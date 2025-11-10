import type { ReactNode} from 'react';

import React, { useState, useContext, useCallback, createContext } from 'react';

// Define la forma de un producto que se puede añadir al carrito
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  coverUrl: string;
  stock: number;
}

// Define la forma de un ítem del carrito, que incluye la cantidad
export interface CartItem extends CartProduct {
  quantity: number;
}

// Define la forma del contexto del carrito
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: CartProduct, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Crea el contexto con un valor por defecto
const CartContext = createContext<CartContextType | undefined>(undefined);

// Crea el componente proveedor
export const CartProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar el carrito desde localStorage si existe (soporta 'cart_items' o 'guest_cart')
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart_items') || localStorage.getItem('guest_cart');
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch (err) {
      console.warn('No se pudo leer el carrito desde localStorage', err);
      return [];
    }
  });

  // Persistir cambios del carrito en localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('cart_items', JSON.stringify(cartItems));
    } catch (err) {
      console.warn('No se pudo guardar el carrito en localStorage', err);
    }
  }, [cartItems]);

  const addToCart = useCallback((product: CartProduct, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
      const potentialTotalQuantity = currentQuantityInCart + quantity;

      // --- VALIDACIÓN ESTRICTA ---
      if (potentialTotalQuantity > product.stock) {
        alert(`No puedes agregar más de ${product.stock} unidades de "${product.name}".\nYa tienes ${currentQuantityInCart} en el carrito.`);
        return prevItems; // Devuelve el estado anterior sin modificarlo.
      }
      // --- FIN DE LA VALIDACIÓN ---

      if (existingItem) {
        // Si ya existe, actualiza la cantidad
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: potentialTotalQuantity } : item
        );
      } 
      
      // Si es un producto nuevo, lo añade al carrito
      return [...prevItems, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem('cart_items');
      localStorage.removeItem('guest_cart');
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Crea un hook personalizado para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};
