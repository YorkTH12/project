import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../styles/global.css';

const ShopList = () => {
  const { currentUser, userRole } = useAuth(); // ดึง Role มาเช็ค
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return; 
    }

    setLoading(true);
    let q; // (ตัวแปรสำหรับเก็บ Query)

    // --- ⭐️ นี่คือ Logic ที่คุณต้องการ ⭐️ ---
    if (userRole === 'admin') {
      // 1. ถ้าเป็น Admin: ดึง 'shops' ทั้งหมด
      q = query(collection(db, 'shops'));

    } else if (userRole === 'owner') {
      // 2. ถ้าเป็น Owner: ดึงเฉพาะที่ ownerId ตรงกับเรา
      q = query(
        collection(db, 'shops'), 
        where('ownerId', '==', currentUser.uid)
      );
    } else {
      // (กรณีอื่นๆ ที่ไม่ใช่ admin/owner)
      setError("คุณไม่มีสิทธิ์ดูหน้านี้");
      setLoading(false);
      return;
    }
    // --- ⭐️ จบส่วน Logic ⭐️ ---

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shopsArray = [];
      querySnapshot.forEach((doc) => {
        // ดึง doc.id (ซึ่งก็คือ shopId) มาด้วย
        shopsArray.push({ id: doc.id, ...doc.data() }); 
      });
      setShops(shopsArray);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userRole]); // ทำงานใหม่เมื่อ User เปลี่ยน

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>กำลังโหลด...</p>;
  }

  if (error) {
    return <p className="error-text" style={{ textAlign: 'center', margin: '2rem auto' }}>{error}</p>;
  }

  // ส่วนแสดงผล
  // src/pages/ShopListPage.js
// ... (imports และ โค้ดส่วนบนเหมือนเดิม) ...

// ... (useEffect เหมือนเดิม) ...

  return (
    <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}>
      {/* ... (ส่วน Title/Lead เหมือนเดิม) ... */}
      
      <div className="form" style={{ gap: '1rem' }}>
        {/* ... (ส่วน loading/error/empty) ... */}
        
        {shops.map((shop) => (
          <div key={shop.id} /* ... (style เหมือนเดิม) ... */ >
            <div>
              <h3 style={{ fontWeight: 600 }}>{shop.shopName}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{shop.address}</p>
              
              {/* (แสดงสถานะ) */}
              <span style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem',
                  background: shop.status === 'approved' ? '#C6F6D5' : (shop.status === 'pending' ? '#FEEBC8' : '#FED7D7'),
                  color: shop.status === 'approved' ? '#22543D' : (shop.status === 'pending' ? '#744210' : '#822727')
                }}>
                  สถานะ: {shop.status}
              </span>
              
              {/* --- ⭐️ เพิ่มส่วนนี้ ⭐️ --- */}
              {shop.status === 'rejected' && (
                <p className="error-text" style={{fontSize: '0.9rem', margin: '4px 0 0 0'}}>
                  <b>เหตุผลที่ถูกปฏิเสธ:</b> {shop.rejectionReason}
                </p>
              )}
              {/* ------------------------- */}
            </div>

            {/* ปุ่ม "แก้ไข" */}
            <Link 
              to={`/edit-shop/${shop.id}`}
              className="btn" 
              style={{ textDecoration:'none', background: '#EDF2F7', color: '#1A202C' }}
            >
              {/* เปลี่ยนข้อความปุ่ม ถ้าถูกปฏิเสธ */}
              {shop.status === 'rejected' ? 'แก้ไขและส่งใหม่' : 'แก้ไข'}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopList;