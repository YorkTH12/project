import React from 'react';
import { Routes, Route } from 'react-router-dom';

// นำเข้า Components
import AdminRoute from './AdminRoute';
import AdminDashboard from '../pages/AdminDashboard';
import MapDisplay from '../pages/MapDisplay';
import Login from '../pages/Login';
import ShopRegistrationForm from '../pages/ShopRegistrationForm';
import BoothRegistrationForm from '../pages/BoothRegistrationForm';
import EditShop from '../pages/EditShop';
import Home from '../pages/Home';

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes (ผู้ใช้งานทั่วไปดูได้) */}
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<MapDisplay />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Routes (ผู้ดูแลระบบเท่านั้น) */}
      <Route element={<AdminRoute />}>
        {/* MODIFIED: แก้ไข path ให้ตรงกับ Navbar.js ที่คุณตั้งไว้ */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/shop-form" element={<ShopRegistrationForm />} />
        <Route path="/booth-form" element={<BoothRegistrationForm />} />
        <Route path="/edit-shop/:id" element={<EditShop />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;