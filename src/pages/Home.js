import React, { useState, useEffect } from 'react';
import '../styles/global.css'
import { Link } from 'react-router-dom';
import MapDisplay from '../pages/MapDisplay';
const Home = () => {
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 720 : false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 720);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // close mobile nav when switching to desktop
    if (!isMobile) setNavOpen(false);
  }, [isMobile]);

  const mapHeight = isMobile ? 220 : 360;

  return (
    <div className="app-container">
      

      <main className="page">
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
          <div style={{flex:1,minWidth:240}}>
            <h1 className="title">หน้าแรก: ค้นหาร้านขายขวด</h1>
            <p className="lead">ค้นหาและนำทางไปยังร้านรับซื้อขวดอย่างรวดเร็ว — ใช้แผนที่เพื่อสำรวจร้านใกล้เคียง</p>
            <div style={{marginTop:14, display:'flex', gap:10, flexWrap:'wrap'}}>
              {/* <Link to="/search" className="btn primary" style={{textDecoration:'none', minWidth:120, textAlign:'center'}}>เริ่มค้นหา</Link> */}
              <Link to="/register" className="btn primary" style={{textDecoration:'none', minWidth:140, textAlign:'center'}}>เป็นเจ้าของร้าน?</Link>
            </div>
          </div>

          <div style={{flex:1,minWidth:320, width: isMobile ? '100%' : 'auto'}} className="card">
            <MapDisplay style={{height:mapHeight, width:'100%'}} />
          </div>
        </section>

        {/* <section className="card">
          <h3 style={{marginBottom:8}}>เคล็ดลับการใช้</h3>
          <p className="lead" style={{margin:0}}>ใช้ฟิลเตอร์เพื่อจำกัดผลลัพธ์ตามประเภทของขวด ระยะทาง หรือคะแนนร้าน</p>
        </section> */}
      </main>
    </div>
  );
};

export default Home;