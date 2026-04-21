import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/global.css'; // หรือ import '../../index.css' ขึ้นอยู่กับโปรเจกต์ของคุณ

const Navbar = () => {
const { currentUser, userRole, logout } = useAuth();
const navigate = useNavigate();

const [isMobile, setIsMobile] = useState(
typeof window !== 'undefined' ? window.innerWidth <= 720 : false
);
const [navOpen, setNavOpen] = useState(false);

useEffect(() => {
const onResize = () => setIsMobile(window.innerWidth <= 720);
window.addEventListener('resize', onResize);
return () => window.removeEventListener('resize', onResize);
}, []);

useEffect(() => {
if (!isMobile) setNavOpen(false);
}, [isMobile]);

const handleLogout = async () => {
try {
await logout();
navigate('/login');
} catch (error) {
console.error('Failed to log out', error);
}
};

return (
  // MODIFIED: ใช้คลาส .header ตาม CSS และลบ inline styles ที่ซ้ำซ้อนออก
  <header className="header">

  {/* MODIFIED: ใช้คลาส .brand ตาม CSS */}
  <Link to="/" className="brand" onClick={() => setNavOpen(false)}>
    <div className="logo" aria-hidden>
      FB
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="brand-name">Find Bottle Shops</div>
      <div className="lead" style={{ marginTop: 0 }}>ค้นหาร้านขายขวดใกล้ตัว</div>
    </div>
  </Link>

  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    {/* Hamburger สำหรับมือถือ */}
    {isMobile && (
      <button
        className="btn"
        aria-label="เมนู"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((s) => !s)}
        style={{ padding: '8px', minHeight: 'auto' }}
      >
        {navOpen ? '✕' : '☰'}
      </button>
    )}

    {/* MODIFIED: ใช้คลาส .nav ตาม CSS ซึ่งจะจัดการ flex และ a tag ให้อัตโนมัติ */}
    <nav
      className="nav"
      style={{
        display: isMobile && !navOpen ? 'none' : 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        position: isMobile ? 'absolute' : 'static',
        top: '70px',
        right: '24px',
        backgroundColor: isMobile ? 'var(--card)' : 'transparent',
        padding: isMobile ? '16px' : '0',
        borderRadius: isMobile ? 'var(--radius)' : '0',
        boxShadow: isMobile ? '0 8px 22px rgba(12,16,23,0.1)' : 'none',
        zIndex: 1000
      }}
    >
      <Link to="/" onClick={() => setNavOpen(false)}>หน้าแรก (แผนที่)</Link>

      {/* ลิงก์สำหรับ Admin เท่านั้น */}
      {userRole === 'admin' && (
        <>
          <Link to="/admin" onClick={() => setNavOpen(false)}>Dashboard แอดมิน</Link>
          <Link to="/shop-form" onClick={() => setNavOpen(false)}>ลงทะเบียนร้านค้า</Link>
          <Link to="/booth-form" onClick={() => setNavOpen(false)}>ลงทะเบียนตู้</Link>
        </>
      )}

      {!currentUser ? (
        // MODIFIED: ใช้คลาส cta ที่อิงจาก .nav a.cta ใน CSS ของคุณ
        <Link to="/login" className="cta" onClick={() => setNavOpen(false)}>
          ล็อกอิน (Admin)
        </Link>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: isMobile ? 0 : '8px' }}>
          <div style={{ color: 'var(--muted)', fontWeight: 600, fontSize: '0.9rem' }}>
            {currentUser?.email ?? 'ผู้ใช้'}
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Role: {userRole}</div>
          </div>
          {/* MODIFIED: ใช้คลาส .btn ตาม CSS */}
          <button onClick={handleLogout} className="btn" aria-label="ล็อกเอาท์">
            ล็อกเอาท์
          </button>
        </div>
      )}
    </nav>
  </div>
</header>


);
};

export default Navbar;