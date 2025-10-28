import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/AdminDashboard';
import ShopRegistrationForm from '../pages/ShopRegistrationForm';
import AdminRoute from './AdminRoute';
import OwnerRoute from './OwnerRoute';
import EditShopPage from '../pages/EditShop';
import EditShop from '../pages/EditShop';
import ShopList from '../pages/ShopList';

// const AppRouter = () => {
//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path="/" element={<Home />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />

//       {/* Owner Routes */}
//       <Route element={<OwnerRoute />}>
//         <Route path="/shop-form" element={<ShopRegistrationForm />} />
//       </Route>
      
//       {/* Admin Routes */}
//       <Route element={<AdminRoute />}>
//         <Route path="/admin" element={<AdminDashboard />} />
//       </Route>
//     </Routes>
//   );
// };

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Owner Routes (ปิดการป้องกัน) */}
      <Route path="/shop-form" element={<ShopRegistrationForm />} />
      
      {/* Admin Routes (ปิดการป้องกัน) */}
      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="/edit-shop/:shopId" element={<EditShop />} />
      <Route path="/shop-list" element={<ShopList />} />
    </Routes>
    
  ); 
};

export default AppRouter;