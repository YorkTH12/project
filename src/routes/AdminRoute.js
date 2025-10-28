// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const AdminRoute = () => {
//   const { userRole } = useAuth();

//   if (userRole === 'admin') {
//     return <Outlet />; // อนุญาตให้ไปต่อ
//   }

//   // ถ้าไม่ใช่ Admin ให้เด้งกลับหน้าหลัก
//   return <Navigate to="/" replace />;
// };

// export default AdminRoute;