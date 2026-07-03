import Cart from "../models/Cart.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(200).json({ items: [], totalAmount: 0 });
    res.status(200).json(cart);
  } catch (error) {
    console.error("getCart error:", error.message);
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  const { productId, name, price, image, quantity, prescriptionRequired } = req.body;
  const userId = req.user._id;

  if (!productId || !name || price === undefined) {
    return res.status(400).json({ message: "productId, name and price are required" });
  }

  // Find user's cart
  let cart = await Cart.findOne({ userId });
  
  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  // Check if product already exists in cart
  const existingItem = cart.items.find(item => item.productId.toString() === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity || 1;
  } else {
    cart.items.push({
      productId,
      name,
      price,
      image: image || '',
      quantity: quantity || 1,
      prescriptionRequired: prescriptionRequired || false //ADD THIS
    });
  }

  await cart.save();
  res.json(cart);
};

export const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId.toString()
    );

    cart.totalAmount = cart.items.reduce(
      (acc, item) => acc + Number(item.price) * item.quantity, 0
    );

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("❌ removeFromCart error:", error.message);
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    // FIX: Changed { user: ... } to { userId: ... } to match schema
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id }, 
      { items: [], totalAmount: 0 },
      { new: true }
    );
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};