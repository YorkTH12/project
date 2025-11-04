import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Import หน้า Public ---
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

// --- Import หน้าที่ปกติเป็นของ Admin ---
import AdminDashboard from '../pages/AdminDashboard';

// --- Import หน้าที่ปกติเป็นของ Owner ---
import ShopRegistrationForm from '../pages/ShopRegistrationForm';
import BoothRegistrationForm from '../pages/BoothRegistrationForm'; // (หน้าที่สร้างใหม่)
import ShopList from '../pages/ShopList';
import EditShopPage from '../pages/EditShop'; // (ใช้ชื่อเดียวตามไฟล์ที่คุณ Import มา)

// (เราไม่ Import AdminRoute และ OwnerRoute)

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- Development Routes (เปิดทุกหน้า) --- */}
      
      {/* (หน้าที่ปกติเป็นของ Owner) */}
      <Route path="/shop-form" element={<ShopRegistrationForm />} />
      <Route path="/booth-form" element={<BoothRegistrationForm />} />
      <Route path="/shop-list" element={<ShopList />} />
      <Route path="/edit-shop/:shopId" element={<EditShopPage />} /> 

      {/* (หน้าที่ปกติเป็นของ Admin) */}
      <Route path="/admin" element={<AdminDashboard />} /> 
      
    </Routes>
  ); 
};

export default AppRouter;