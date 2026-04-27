// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebase/config'; 
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// 1. สร้าง Context
const AuthContext = createContext();

// 2. สร้าง Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // ('user', 'admin')
  const [loading, setLoading] = useState(true); // สถานะ Loading ตอนเริ่มแอปฯ

  // 3. ฟังการเปลี่ยนแปลงสถานะ Auth (Login/Logout)
  useEffect(() => {
    // onAuthStateChanged จะทำงานเมื่อมีการ Login/Logout หรือตอนเปิดแอปฯ ครั้งแรก
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // --- User ล็อกอินเข้ามา ---
        // 1. เก็บข้อมูล Auth
        setCurrentUser(user);
        
        // 2. ดึงข้อมูล Role จาก Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // 3. ถ้ามีเอกสาร user, ให้ดึง role มาเก็บใน state
          setUserRole(userDocSnap.data().role);
        } else {
          // (กรณีที่ User ล็อกอินเข้ามาแต่ยังไม่มีเอกสารใน Firestore)
          console.warn("No user document found for UID:", user.uid);
          setUserRole('user'); // ให้ Role พื้นฐานไปก่อน
        }
      } else {
        // --- User ล็อกเอาท์ ---
        setCurrentUser(null);
        setUserRole(null);
      }
      // ไม่ว่าจะ Login หรือ Logout, เมื่อเสร็จสิ้นกระบวนการ ให้หยุด Loading
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  // --- ฟังก์ชันสำหรับการ Login ---
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // --- ฟังก์ชันสำหรับการ Logout ---
  const logout = () => {
    return signOut(auth);
  };

  // 4. ส่งค่า State และฟังก์ชันต่างๆ ผ่าน Provider
  const value = {
    currentUser,
    userRole,
    loading,
    login,
    logout,
  };

  // 5. Render children
  // (เราจะแสดงแอปฯ ก็ต่อเมื่อ loading เสร็จแล้ว เพื่อป้องกันการกระพริบของ Protected Routes)
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 6. สร้าง Custom Hook (useAuth) เพื่อให้เรียกใช้ได้ง่ายๆ
export const useAuth = () => {
  return useContext(AuthContext);
};