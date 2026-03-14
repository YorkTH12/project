import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Import หน้า Public ---
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

// --- ⭐️ Import ยามเฝ้าประตู (Protected Routes) ⭐️ ---
import AdminRoute from './AdminRoute';
import OwnerRoute from './OwnerRoute';

// --- Import หน้าของ Admin ---
import AdminDashboard from '../pages/AdminDashboard';

// --- Import หน้าของ Owner ---
import ShopRegistrationForm from '../pages/ShopRegistrationForm';
import BoothRegistrationForm from '../pages/BoothRegistrationForm';
import ShopList from '../pages/ShopList';
import EditShopPage from '../pages/EditShop';

const AppRouter = () => {
  return (
    <Routes>
      {/* 🟢 Public Routes: เส้นทางที่ทุกคนเข้าได้ (ไม่ต้องล็อกอิน) */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🟠 Owner & Admin Routes: เส้นทางที่ต้องล็อกอินเป็น Owner หรือ Admin ถึงจะเข้าได้ */}
      {/* เราใช้ <OwnerRoute /> ครอบเส้นทางเหล่านี้ไว้ */}
      <Route element={<OwnerRoute />}>
        <Route path="/shop-form" element={<ShopRegistrationForm />} />
        <Route path="/booth-form" element={<BoothRegistrationForm />} />
        <Route path="/shop-list" element={<ShopList />} />
        <Route path="/edit-shop/:shopId" element={<EditShopPage />} /> 
      </Route>

      {/* 🔴 Admin Only Routes: เส้นทางลับเฉพาะ Admin เท่านั้น */}
      {/* เราใช้ <AdminRoute /> ครอบเส้นทางของ Admin ไว้ */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} /> 
      </Route>
      
    </Routes>
  ); 
};

export default AppRouter;