import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SelectUserPage from "./pages/SelectUserPage";
import PaymentOptionsScreen from "./pages/CartScreen";
import PaylaterDetailScreen from "./pages/PaylaterDetailScreen";
import PayLaterInstallmentList from "./pages/PayLaterInstallmentList";


import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chọn user */}
        <Route path="/" element={<SelectUserPage />} />

        {/* Payment options: chọn cart */}
        <Route path="/user/:user_id/cart/:cart_id" element={<PaymentOptionsScreen />} />

        {/* PayLater 3 instalments (Plan selection) */}
        <Route path="/user/:user_id/cart/:cart_id/paylater-detail" element={<PaylaterDetailScreen />} />

        {/* Chi tiết agreement đã tạo */}
       <Route
  path="/paylater/agreement/:agreementId"
  element={<PayLaterInstallmentList />}
/>

        

      </Routes>
    </BrowserRouter>
  );
}
