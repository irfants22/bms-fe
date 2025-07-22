import { createContext, useContext, useState, useCallback } from "react";

const UnpaidOrdersContext = createContext();

export const UnpaidOrdersProvider = ({ children }) => {
  const [unpaidOrders, setUnpaidOrders] = useState(() => {
    try {
      const stored = localStorage.getItem("unpaidOrders");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  });

  // Gunakan useCallback untuk stabilisasi fungsi
  const addUnpaidOrder = useCallback((order) => {
    setUnpaidOrders((prev) => {
      const existingIndex = prev.findIndex(
        (o) => o.order_id === order.order_id
      );
      let newOrders;

      if (existingIndex >= 0) {
        // Update existing order
        newOrders = [...prev];
        newOrders[existingIndex] = order;
      } else {
        // Add new order
        newOrders = [...prev, order];
      }

      // Simpan ke localStorage secara langsung
      try {
        localStorage.setItem("unpaidOrders", JSON.stringify(newOrders));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }

      return newOrders;
    });
  }, []);

  const removeUnpaidOrder = useCallback((orderId) => {
    setUnpaidOrders((prev) => {
      const newOrders = prev.filter((o) => o.order_id !== orderId);

      // Simpan ke localStorage secara langsung
      try {
        localStorage.setItem("unpaidOrders", JSON.stringify(newOrders));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }

      return newOrders;
    });
  }, []);

  return (
    <UnpaidOrdersContext.Provider
      value={{ unpaidOrders, addUnpaidOrder, removeUnpaidOrder }}
    >
      {children}
    </UnpaidOrdersContext.Provider>
  );
};

export const useUnpaidOrders = () => {
  const context = useContext(UnpaidOrdersContext);
  if (!context) {
    throw new Error(
      "useUnpaidOrders must be used within an UnpaidOrdersProvider"
    );
  }
  return context;
};
