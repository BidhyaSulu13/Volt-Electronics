import { createContext, useContext, useEffect, useState } from 'react';
const ShopContext = createContext(null);
const read = key => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
export function ShopProvider({children}) {
 const [cart,setCart]=useState(()=>read('volt-cart')),[wishlist,setWishlist]=useState(()=>read('volt-wishlist'));
 useEffect(()=>localStorage.setItem('volt-cart',JSON.stringify(cart)),[cart]);
 useEffect(()=>localStorage.setItem('volt-wishlist',JSON.stringify(wishlist)),[wishlist]);
 const addToCart=(product,qty=1)=>setCart(prev=>{const found=prev.find(x=>x.id===product.id);return found?prev.map(x=>x.id===product.id?{...x,qty:x.qty+qty}:x):[...prev,{...product,qty}];});
 const removeFromCart=id=>setCart(prev=>prev.filter(x=>x.id!==id));
 const setQuantity=(id,qty)=>setCart(prev=>prev.map(x=>x.id===id?{...x,qty:Math.max(1,qty)}:x));
 const toggleWishlist=product=>setWishlist(prev=>prev.some(x=>x.id===product.id)?prev.filter(x=>x.id!==product.id):[...prev,product]);
 return <ShopContext.Provider value={{cart,wishlist,addToCart,removeFromCart,setQuantity,toggleWishlist,cartCount:cart.reduce((s,x)=>s+x.qty,0),cartTotal:cart.reduce((s,x)=>s+x.price*x.qty,0)}}>{children}</ShopContext.Provider>;
}
export const useShop=()=>useContext(ShopContext);
