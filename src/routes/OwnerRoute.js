// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const OwnerRoute = () => {
//   const { userRole } = useAuth();

//   // Admin ก็ควรเข้าหน้าของ Owner ได้ (เผื่อต้องแก้ไข)
//   if (userRole === 'owner' || userRole === 'admin') {
//     return <Outlet />; // อนุญาตให้ไปต่อ
//   }
  
//   // ถ้าไม่ใช่ ให้เด้งกลับหน้าหลัก
//   return <Navigate to="/" replace />;
// };

// export default OwnerRoute;