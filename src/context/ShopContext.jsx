import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const ShopContext = createContext(null);
const read = key => {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
};

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => read('volt-cart'));
  const [wishlist, setWishlist] = useState(() => read('volt-wishlist'));
  const [recentlyViewed, setRecentlyViewed] = useState(() => read('volt-recently-viewed'));
  const [toast, setToast] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const closeQuickView = useCallback(() => setQuickViewProduct(null), []);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => localStorage.setItem('volt-cart', JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem('volt-wishlist', JSON.stringify(wishlist)), [wishlist]);
  useEffect(() => localStorage.setItem('volt-recently-viewed', JSON.stringify(recentlyViewed)), [recentlyViewed]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = message => setToast({ message, id: Date.now() });
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const found = prev.find(item => item.id === product.id);
      return found
        ? prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item)
        : [...prev, { ...product, qty }];
    });
    notify(`${product.name} added to your bag`);
  };
  const removeFromCart = id => setCart(prev => prev.filter(item => item.id !== id));
  const setQuantity = (id, qty) => setCart(prev => prev.map(item => item.id === id ? { ...item, qty: Math.max(1, qty) } : item));
  const toggleWishlist = product => {
    const saved = wishlist.some(item => item.id === product.id);
    setWishlist(prev => saved ? prev.filter(item => item.id !== product.id) : [...prev, product]);
    notify(saved ? `${product.name} removed from your wishlist` : `${product.name} saved to your wishlist`);
  };
  const addRecentlyViewed = product => setRecentlyViewed(prev => [product, ...prev.filter(item => item.id !== product.id)].slice(0, 6));

  return <ShopContext.Provider value={{
    cart, wishlist, recentlyViewed, toast, quickViewProduct,
    addToCart, removeFromCart, setQuantity, toggleWishlist, addRecentlyViewed,
    openQuickView: setQuickViewProduct, closeQuickView, dismissToast,
    cartCount: cart.reduce((sum, item) => sum + item.qty, 0),
    cartTotal: cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  }}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
