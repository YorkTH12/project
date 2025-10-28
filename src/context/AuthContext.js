// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebase/config'; // (ไฟล์ config ที่ export auth และ firestore)
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// 1. สร้าง Context
const AuthContext = createContext();

// 2. สร้าง Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // ('user', 'owner', 'admin')
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
          // (กรณีที่ User สมัครผ่าน Auth แต่ยังไม่มีเอกสารใน Firestore)
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

  // --- ฟังก์ชันสำหรับการ Register (ตัวอย่าง) ---
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // *** สร้างเอกสารใน 'users' collection ทันทีหลังสมัคร ***
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      role: 'owner', // <-- ตั้งค่า Role เริ่มต้นให้เป็น 'owner' ตาม Requirement
      createdAt: serverTimestamp(),
    });

    // อัปเดต Role ใน State ทันที
    setUserRole('owner');
  };

  // --- ฟังก์ชันสำหรับการ Login (ตัวอย่าง) ---
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // --- ฟังก์ชันสำหรับการ Logout (ตัวอย่าง) ---
  const logout = () => {
    return signOut(auth);
  };

  // 4. ส่งค่า State และฟังก์ชันต่างๆ ผ่าน Provider
  const value = {
    currentUser,
    userRole,
    loading,
    login,
    register,
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