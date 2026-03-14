import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OwnerRoute = () => {
  const { userRole, currentUser } = useAuth();

  // ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า Login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // อนุญาตให้ Owner และ Admin เข้าถึงหน้านี้ได้
  if (userRole === 'owner' || userRole === 'admin') {
    return <Outlet />; 
  }
  
  // ถ้าไม่ใช่ ให้เด้งกลับหน้าหลัก
  return <Navigate to="/" replace />;
};

export default OwnerRoute;