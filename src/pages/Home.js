import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import { Link } from 'react-router-dom';
import MapDisplay from '../pages/MapDisplay'; 

const Home = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 720 : false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
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
          <div style={{flex:1, minWidth:240}}>
            <h1 className="title">หน้าแรก: ค้นหาร้านขายขวด</h1>
            <p className="lead">ค้นหาและนำทางไปยังร้านรับซื้อขวดและตู้แยกขวดในพื้นที่ — ใช้แผนที่เพื่อสำรวจจุดที่ใกล้เคียงคุณ</p>
          </div>
        </section>
        <section className="card" style={{padding: 0, marginTop: '1rem', width: '100%'}}>
          <MapDisplay />
        </section>

      </main>
    </div>
  );
};

export default Home;