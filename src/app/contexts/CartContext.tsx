"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem("cart");
        if (stored) {
          const parsedCart = JSON.parse(stored);
          // Validate cart items
          const validCart = parsedCart.filter((item: any) => 
            item && 
            item.id && 
            item.name && 
            typeof item.price === 'number' && 
            typeof item.quantity === 'number' && 
            item.quantity > 0
          );
          setCart(validCart);
          
          // Update localStorage with clean data if needed
          if (validCart.length !== parsedCart.length) {
            localStorage.setItem("cart", JSON.stringify(validCart));
          }
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem("cart");
        setCart([]);
      }
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (product: any) => {
    console.log('Adding to cart:', product);
    
    const safeItem = {
      id: String(product.id),
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url || null,
      quantity: 1,
    };

    console.log('Safe item to add:', safeItem);

    setCart(prev => {
      console.log('Previous cart state:', prev);
      const existing = prev.find((item: any) => item.id === safeItem.id);
      console.log('Existing item found:', existing);
      
      if (existing) {
        // Update existing item quantity
        const newCart = prev.map((item: any) =>
          item.id === safeItem.id ? { ...item, quantity: (item.quantity || 0) + 1 } : item
        );
        console.log('Updated cart (existing item):', newCart);
        return newCart;
      } else {
        // Add new item
        const newCart = [...prev, safeItem];
        console.log('Updated cart (new item):', newCart);
        return newCart;
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("cart");
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Debug cart data
  useEffect(() => {
    if (isInitialized) {
      console.log('CartContext - Current cart state:', cart);
      console.log('CartContext - Cart item count:', cartItemCount);
    }
  }, [cart, cartItemCount, isInitialized]);

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartItemCount,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}


