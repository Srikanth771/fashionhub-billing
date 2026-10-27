import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const ShopContext = createContext(null);

export const ShopProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    shopName: 'The Fashion Hub',
    phone: '6309382716',
    address: 'New Jewewllary Market, Kamala Theatre Road Bhainsa 504103',
    logoUrl: '',
    currency: '₹',
    tagline: "Men's Luxury Wear & Exclusive Collection",
    gstin: '36AAAAA0000A1Z5',
    terms: 'Goods once sold cannot be refunded. Exchange within 7 days with original bill.',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosClient.get('/settings');
        if (res.data?.success && res.data.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }));
        }
      } catch (err) {
        console.warn('Using local fallback shop settings:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateLocalSettings = async (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await axiosClient.post('/settings', newSettings);
    } catch (err) {
      console.warn('Could not persist settings to backend:', err.message);
    }
  };

  return (
    <ShopContext.Provider value={{ settings, updateLocalSettings, loading }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
