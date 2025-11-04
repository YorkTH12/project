import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import { Link } from 'react-router-dom';
// 1. (แก้ไข Path) สมมติว่าเราย้าย MapDisplay ไปที่ components/map
import MapDisplay from '../pages/MapDisplay'; 

const Home = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 720 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    // 2. (แก้ไข) ใช้ app-container แต่ปรับ style เล็กน้อย
    <div className="app-container" style={{maxWidth: 1200, margin: '1rem auto 0 auto'}}>
      
      <main className="page" style={{gap: 0}}> {/* เอา gap ออกเพื่อให้ card ติดกัน */}
        <section
          className="hero"
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: isMobile ? 'column' : 'row'
          }}
        >
          {/* (ส่วนข้อความ Title/Lead - เหมือนเดิม) */}
          <div style={{flex:1, minWidth:240}}>
            <h1 className="title">หน้าแรก: ค้นหาร้านขายขวด</h1>
            <p className="lead">ค้นหาและนำทางไปยังร้านรับซื้อขวดและตู้แยกขวดในพื้นที่ — ใช้แผนที่เพื่อสำรวจจุดที่ใกล้เคียงคุณ</p>
            <div style={{marginTop:14, display:'flex', gap:10, flexWrap:'wrap'}}>
              <Link to="/register" className="btn primary" style={{textDecoration:'none', minWidth:140, textAlign:'center'}}>
                ลงทะเบียนร้านค้า
              </Link>
            </div>
          </div>

          {/* (ส่วน Title/Lead - สำหรับตู้ (ถ้ามี)) */}
          {/* <div style={{flex:1, minWidth:240}}>
            <h1 className="title">เจ้าของตู้แยกขวด</h1>
            <Link to="/register-booth" className="btn" style={{textDecoration:'none', minWidth:140, textAlign:'center'}}>
              ลงทะเบียนตู้
            </Link>
          </div>
          */}

        </section>

        {/* 3. (แก้ไข) เรียกใช้ MapDisplay ใน Card โดยไม่ต้องส่ง style */}
        <section className="card" style={{padding: 0, marginTop: '1rem', width: '100%'}}>
          <MapDisplay />
        </section>

      </main>
    </div>
  );
};

export default Home;