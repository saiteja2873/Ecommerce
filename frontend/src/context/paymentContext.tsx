import React, { createContext, useState, useContext } from "react";

export interface PaymentContextProps {
  paymentAmount: number;
  setPaymentAmount: (amount: number) => void;
  orderTotal: number;
  setOrderTotal: (total: number) => void;
}

const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);

  return (
    <PaymentContext.Provider
      value={{
        paymentAmount,
        setPaymentAmount,
        orderTotal,
        setOrderTotal,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error("usePaymentContext must be used within a PaymentProvider");
  return context;
};
