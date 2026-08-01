import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  primaryImage: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  getCartCount: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchCart = async () => {
    if (location.pathname.startsWith('/team')) {
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('token') || localStorage.getItem('aura-token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true,
      });
      if (response.status === 200) {
        setCart(response.data.products || []);
      } else if (response.status === 401) {
        setCart([]);
        localStorage.removeItem('token');
        localStorage.removeItem('aura-token');
      } else {
        setCart([]);
      }
    } catch (error: any) {
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [location.pathname]);

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    const token = localStorage.getItem('token') || localStorage.getItem('aura-token');
    if (!token) return;
    try {
      setCart((prevCart) => {
        const itemIndex = prevCart.findIndex((item) => item.productId === productId);
        if (itemIndex > -1) {
          if (quantity > 0) {
            const updatedCart = [...prevCart];
            updatedCart[itemIndex] = { ...updatedCart[itemIndex], quantity };
            return updatedCart;
          } else {
            return prevCart.filter((item) => item.productId !== productId);
          }
        } else if (quantity > 0) {
          return [...prevCart, { productId, name: '', price: 0, primaryImage: '', quantity }];
        }
        return prevCart;
      });
      const response = await axios.put('/api/cart', { productId, quantity }, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true });
      if (response.status === 200 || response.status === 401) fetchCart();
      else fetchCart();
    } catch (error: any) {
      fetchCart();
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('aura-token');
    if (!token) return;
    try {
      setCart([]);
      const deleteRequests = cart.map(item =>
        axios.put('/api/cart', { productId: item.productId, quantity: 0 }, { headers: { Authorization: `Bearer ${token}` } })
      );
      await Promise.all(deleteRequests);
      fetchCart();
    } catch (error) {
      fetchCart();
    }
  };

  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, updateCartItemQuantity, getCartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
