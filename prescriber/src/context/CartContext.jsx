import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart]           = useState({ items: [], totalAmount: 0 });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const count = (cart?.items || []).reduce((acc, i) => acc + (i.quantity || 0), 0);
    setCartCount(count);
  }, [cart]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/cart")
        .then((res) => setCart(res.data || { items: [], totalAmount: 0 }))
        .catch((err) => console.error("Cart fetch error:", err?.response?.data));
    }
  }, []);

  const addToCart = async (product) => {
  const token = localStorage.getItem("token");

  // ── FIX: ensure price is always a valid number ────────────
  const price = Number(
    product.sellingPrice || product.price || product.unitPrice || 0
  );

  if (!product._id || !product.name || price === 0) {
    console.error("Invalid product data:", product);
    throw new Error("Invalid product — missing id, name or price");
  }

  const qty = Number(product.quantity) || 1;
  
  // ✅ Get prescriptionRequired from product
  const prescriptionRequired = product.prescriptionRequired || false;

  if (!token) {
    setCart((prev) => {
      const items = prev?.items || [];
      const existing = items.find((i) => i.productId === product._id);
      if (existing) {
        return {
          ...prev,
          items: items.map((i) =>
            i.productId === product._id
              ? { ...i, quantity: i.quantity + qty }
              : i
          ),
        };
      }
      return {
        ...prev,
        items: [...items, {
          productId: product._id,
          name: product.name,
          price,
          image: product.image || '',
          quantity: qty,
          prescriptionRequired, // ADD THIS
        }],
      };
    });
    return;
  }

  const res = await API.post("/cart/add", {
    productId: product._id,
    name: product.name,
    price,
    image: product.image || '',
    quantity: qty,
    prescriptionRequired, // ADD THIS
  });
  setCart(res.data);
};

  const removeFromCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCart((prev) => ({
        ...prev,
        items: (prev?.items || []).filter((i) => i.productId !== productId),
      }));
      return;
    }
    try {
      const res = await API.delete(`/cart/remove/${productId}`);
      setCart(res.data);
    } catch (err) {
      console.error("Remove error:", err?.response?.data);
    }
  };

  const refreshCart = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await API.get("/cart");
        setCart(res.data || { items: [], totalAmount: 0 });
      } catch (err) {
        console.error("Refresh error:", err?.response?.data);
      }
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await API.delete("/cart/clear");
      } catch {
        // clear locally if endpoint fails
      }
    }
    setCart({ items: [], totalAmount: 0 });
  };

  return (
    <CartContext.Provider value={{
      cart, cartCount,
      addToCart, removeFromCart,
      refreshCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};