import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = () => {
  const { userRole, currentUser } = useAuth();

  // ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า Login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ถ้าเป็น Admin อนุญาตให้ไปต่อ (เข้าถึงเนื้อหาได้)
  if (userRole === 'admin') {
    return <Outlet />; 
  }

  // ถ้าล็อกอินแล้ว แต่ไม่ใช่ Admin (เช่น เป็นแค่ User หรือ Owner) ให้เด้งกลับหน้าหลัก
  return <Navigate to="/" replace />;
};

export default AdminRoute;