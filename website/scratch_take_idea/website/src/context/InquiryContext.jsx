import React, { createContext, useState, useContext } from 'react';

const InquiryContext = createContext();

export const useInquiry = () => useContext(InquiryContext);

export const InquiryProvider = ({ children }) => {
  const [inquiryItems, setInquiryItems] = useState(() => {
    // Load initial state from localStorage if it exists
    const saved = localStorage.getItem('inquiryItems');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  // Sync to localStorage whenever items change
  React.useEffect(() => {
    localStorage.setItem('inquiryItems', JSON.stringify(inquiryItems));
  }, [inquiryItems]);

  const addToInquiry = (product, quantity) => {
    setInquiryItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if already exists immutably
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromInquiry = (productId) => {
    setInquiryItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const getTotalItems = () => {
    return inquiryItems.length;
  };

  const clearInquiry = () => {
    setInquiryItems([]);
  };

  return (
    <InquiryContext.Provider value={{ inquiryItems, addToInquiry, removeFromInquiry, getTotalItems, clearInquiry }}>
      {children}
    </InquiryContext.Provider>
  );
};
