import { createContext, useContext, useState, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items,   setItems]   = useState([])
  const [isOpen,  setIsOpen]  = useState(false)

  const addItem = useCallback((product, size) => {
    setItems(prev => {
      const key     = `${product.id}__${size}`
      const existing = prev.find(i => i.key === key)
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { key, product, size, qty: 1 }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback(key => setItems(p => p.filter(i => i.key !== key)), [])

  const updateQty = useCallback((key, qty) => {
    if (qty < 1) return removeItem(key)
    setItems(p => p.map(i => i.key === key ? { ...i, qty } : i))
  }, [removeItem])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, total, count, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
