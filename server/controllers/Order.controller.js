import mongoose from "mongoose";
import Order from "../models/Order.js";
import Medicine from "../models/medicines.js";
import Stock from "../models/Stock.js";
import OnePort from "../models/OnePort.js";
import User from "../models/User.js";
import { syncPot1 } from "./helpers/syncPot1.js";

const CONFIG = {
  PACKAGING_COST_EX_VAT: 2.50,
  DELIVERY_COST_EX_VAT: 5.00,
  PAYMENT_FEE_RATE: 0.015,
  VAT_RATE_STANDARD: 0.20,
  VAT_RATE_POM: 0.00,
};

const calculateCommission = (revenueExVat, cogsExVat, totalIncVat) => {
  const packaging = CONFIG.PACKAGING_COST_EX_VAT;
  const delivery = CONFIG.DELIVERY_COST_EX_VAT;
  const paymentFee = parseFloat((totalIncVat * CONFIG.PAYMENT_FEE_RATE).toFixed(2));
  const commission = parseFloat(
    Math.max(0, revenueExVat - cogsExVat - packaging - delivery - paymentFee).toFixed(2)
  );
  return { packaging, delivery, paymentFee, commission };
};

// ─────────────────────────────────────────────────────────────
// POST /api/orders
// ─────────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { prescriberId, prescriptionId, items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    let prescriber = null;
    if (prescriberId) {
      prescriber = await User.findOne({ prescriberId: prescriberId, role: "prescriber" }); // ✅
      if (!prescriber) {
        return res.status(404).json({ message: "Prescriber not found" });
      }
    }

    let revenueExVat = 0;
    let cogsExVat = 0;
    let outputVat = 0; // VAT charged to patient (owed to HMRC for standard items)
    let inputVat = 0; // VAT paid when buying stock (always reclaimable)
    const orderItems = [];
    const stockUpdates = [];

    // ── Validate all items & check stock ──────────────────────
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine not found: ${item.medicineId}` });
      }

      // 1. Try to find prescriber-specific stock in the Stock collection first
      let stockEntry = null;
      let isGeneralStock = false;

      if (prescriber?.prescriberId) {
        stockEntry = await Stock.findOne({
          product: new mongoose.Types.ObjectId(item.medicineId),
          prescriberId: prescriber.prescriberId,
          quantityAvailable: { $gte: item.quantity }
        });
      }

      // 2. If no prescriber-specific stock is found, fall back to general stock from Medicine
      if (!stockEntry) {
        if (medicine.stock >= item.quantity) {
          isGeneralStock = true;
        } else {
          return res.status(400).json({
            message: `Insufficient stock for: ${medicine.name}`
          });
        }
      }

      const isPOM = medicine.prescriptionRequired;
      const vatRate = isPOM ? CONFIG.VAT_RATE_POM : CONFIG.VAT_RATE_STANDARD;
      const lineRevExVat = medicine.sellingPrice * item.quantity;
      const lineCostExVat = medicine.buyingPrice * item.quantity;

      revenueExVat += lineRevExVat;
      cogsExVat += lineCostExVat;
      outputVat += lineRevExVat * vatRate;                    // 0 for POM, 20% for standard
      inputVat += lineCostExVat * CONFIG.VAT_RATE_STANDARD;  // pharmacy always pays 20% on purchases

      orderItems.push({
        product: medicine._id,
        productName: medicine.name,
        quantity: item.quantity,
        isPOM,
        unitCostExVat: medicine.buyingPrice,
        unitRevenueExVat: medicine.sellingPrice,
        vatRate,
      });

      if (isGeneralStock) {
        stockUpdates.push({ medicineId: medicine._id, quantity: item.quantity, isGeneral: true });
      } else {
        stockUpdates.push({ stockEntry, quantity: item.quantity, isGeneral: false });
      }
    }

    // ── Financial Calculations ────────────────────────────────
    const totalIncVat = parseFloat((revenueExVat + outputVat).toFixed(2));
    const { packaging, delivery, paymentFee, commission } = calculateCommission(revenueExVat, cogsExVat, totalIncVat);

    // Per-spec derived values
    const vatPositionImpact = parseFloat((inputVat - outputVat).toFixed(2));  // + means HMRC owes pot
    const immediateCashImpact = parseFloat((totalIncVat - paymentFee - packaging - delivery).toFixed(2));
    const trueProfitImpact = parseFloat((immediateCashImpact + vatPositionImpact).toFixed(2));

    // ── Save Order ────────────────────────────────────────────
    const order = await Order.create({
      customer: req.user._id,
      prescriber: prescriber ? prescriber._id : null,
      prescriberId: prescriber ? prescriber.prescriberId : null,
      prescription: prescriptionId || null,
      items: orderItems,
      financials: {
        revenueExVat,
        cogsExVat,
        packagingCostExVat: packaging,
        deliveryCostExVat: delivery,
        paymentFee,
        commissionExVat: commission,
        outputVat: parseFloat(outputVat.toFixed(2)),
        inputVat: parseFloat(inputVat.toFixed(2)),
        vatPositionImpact,
        immediateCashImpact,
        trueProfitImpact,
      },
      deliveryAddress,
      status: prescriptionId ? "pending" : "verified",
    });

    // ── Deduct Stock ──────────────────────────────────────────
    for (const update of stockUpdates) {
      if (update.isGeneral) {
        await Medicine.findByIdAndUpdate(update.medicineId, {
          $inc: { stock: -update.quantity }
        });
      } else {
        update.stockEntry.quantityAvailable -= update.quantity;
        await update.stockEntry.save();
      }
    }

    // ── Pot Syncing (Only if prescriber is involved) ──────────
    if (prescriberId && prescriber) {
      const actualPrescriberId = prescriber.prescriberId;

      let pot = await OnePort.findOne({ prescriberId: actualPrescriberId });
      if (!pot) {
        pot = await OnePort.create({
          prescriber: prescriber._id,
          prescriberId: actualPrescriberId,
        });
      }

      const pot1Before = pot.stockValue || 0;

      await syncPot1(actualPrescriberId);

      const freshPot = await OnePort.findOne({ prescriberId: actualPrescriberId });
      const pot1After = freshPot?.stockValue || 0;

      order.potSnapshot = {
        pot1StockBefore: pot1Before,
        pot1StockAfter: pot1After,
        pot2Deposit: freshPot?.cashBalance || 0,
        pot3Running: (freshPot?.earnedProfit || 0) + commission,
      };
      await order.save();

      if (freshPot) {
        // ── 1. Patient payment received ───────────────────────
        freshPot.addLedgerEntry({
          type: "PATIENT_PAYMENT_RECEIVED",
          orderId: order._id,
          amount: totalIncVat,
          vatAmount: outputVat,
          cashDelta: totalIncVat,
          description: `Order #${order._id} — patient payment received`,
        });

        // ── 2. Card / payment processing fee ─────────────────
        freshPot.addLedgerEntry({
          type: "CARD_FEE_DEDUCTED",
          orderId: order._id,
          amount: paymentFee,
          cashDelta: -paymentFee,
          description: `Order #${order._id} — payment processing fee`,
        });

        // ── 3. Stock allocated to this order ─────────────────
        freshPot.addLedgerEntry({
          type: "STOCK_ALLOCATED_TO_ORDER",
          orderId: order._id,
          amount: cogsExVat,
          stockDelta: -cogsExVat,
          description: `Order #${order._id} — stock allocated (${orderItems.length} item${orderItems.length > 1 ? 's' : ''})`,
        });

        // ── 4. Packaging cost ─────────────────────────────────
        freshPot.addLedgerEntry({
          type: "PACKAGING_REIMBURSEMENT",
          orderId: order._id,
          amount: packaging,
          cashDelta: -packaging,
          description: `Order #${order._id} — packaging cost`,
        });

        // ── 5. Delivery cost ──────────────────────────────────
        freshPot.addLedgerEntry({
          type: "DELIVERY_REIMBURSEMENT",
          orderId: order._id,
          amount: delivery,
          cashDelta: -delivery,
          description: `Order #${order._id} — delivery cost`,
        });

        // ── 6. Output VAT (charged to patient → owed to HMRC) ─
        if (outputVat > 0) {
          freshPot.addLedgerEntry({
            type: "VAT_OUTPUT_RECORDED",
            orderId: order._id,
            amount: outputVat,
            vatAmount: outputVat,
            vatPositionDelta: -outputVat,
            restrictedDelta: outputVat,
            description: `Order #${order._id} — output VAT payable to HMRC`,
          });
        }

        // ── 7. Input VAT (paid on stock purchases → reclaimable) ─
        if (inputVat > 0) {
          freshPot.addLedgerEntry({
            type: "VAT_INPUT_RECORDED",
            orderId: order._id,
            amount: inputVat,
            vatAmount: inputVat,
            vatPositionDelta: inputVat,
            description: `Order #${order._id} — input VAT reclaimable from HMRC`,
          });
        }

        // ── 8. Commission earned by prescriber ────────────────
        if (commission > 0) {
          freshPot.addLedgerEntry({
            type: "COMMISSION_EARNED",
            orderId: order._id,
            amount: commission,
            profitDelta: commission,
            description: `Order #${order._id} — commission earned`,
          });
        }

        await freshPot.save();
      }
    }

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id,
      financialSummary: {
        revenueExVat: revenueExVat.toFixed(2),
        cogsExVat: cogsExVat.toFixed(2),
        packaging: packaging.toFixed(2),
        delivery: delivery.toFixed(2),
        paymentFee: paymentFee.toFixed(2),
        commission: commission.toFixed(2),
        outputVat: outputVat.toFixed(2),
        inputVat: inputVat.toFixed(2),
        vatPositionImpact: vatPositionImpact.toFixed(2),
        immediateCashImpact: immediateCashImpact.toFixed(2),
        trueProfitImpact: trueProfitImpact.toFixed(2),
        totalIncVat: totalIncVat.toFixed(2),
      },
    });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────

export const getAllOrders = async (req, res) => {
  try {
    const { prescriberId, status, commissionStatus, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (prescriberId) filter.prescriberId = prescriberId;
    if (status) filter.status = status;
    if (commissionStatus) filter.commissionStatus = commissionStatus;

    const [orders, count] = await Promise.all([
      Order.find(filter)
        .populate("customer", "firstName lastName email")
        .populate("prescriber", "firstName lastName prescriberId practiceName")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ count, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCommissionSummary = async (req, res) => {
  try {
    const summary = await Order.aggregate([
      { $match: { commissionStatus: "pending" } },
      {
        $group: {
          _id: "$prescriberId",
          totalCommission: { $sum: "$financials.commissionExVat" },
          totalRevenue: { $sum: "$financials.revenueExVat" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalCommission: -1 } },
    ]);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// PRESCRIBER CONTROLLERS
// ─────────────────────────────────────────────────────────────

export const getMyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { prescriberId: req.user.prescriberId };
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ total, page: Number(page), orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyStats = async (req, res) => {
  try {
    const prescriberId = req.user.prescriberId;

    const [totals] = await Order.aggregate([
      { $match: { prescriberId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$financials.revenueExVat" },
          totalCommission: { $sum: "$financials.commissionExVat" },
          totalOutputVat: { $sum: "$financials.outputVat" },
          totalInputVat: { $sum: "$financials.inputVat" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthly = await Order.aggregate([
      { $match: { prescriberId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$financials.revenueExVat" },
          commission: { $sum: "$financials.commissionExVat" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      totals: totals || {
        totalRevenue: 0, totalCommission: 0,
        totalOutputVat: 0, totalInputVat: 0, totalOrders: 0,
      },
      monthly,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyCommission = async (req, res) => {
  try {
    const prescriberId = req.user.prescriberId;

    const [totals] = await Order.aggregate([
      { $match: { prescriberId } },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$financials.commissionExVat" },
          totalOrders: { $sum: 1 },
          pendingCommission: {
            $sum: {
              $cond: [
                { $eq: ["$commissionStatus", "pending"] },
                "$financials.commissionExVat",
                0
              ]
            }
          }
        }
      }
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthly] = await Order.aggregate([
      { $match: { prescriberId, createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: null,
          monthlyCommission: { $sum: "$financials.commissionExVat" }
        }
      }
    ]);

    const port = await OnePort.findOne({ prescriberId }).select("commissionPayouts");
    const payouts = port ? port.commissionPayouts : [];

    res.json({
      totalCommission: totals?.totalCommission || 0,
      monthlyCommission: monthly?.monthlyCommission || 0,
      pendingCommission: totals?.pendingCommission || 0,
      totalOrders: totals?.totalOrders || 0,
      payouts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};