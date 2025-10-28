import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/global.css';

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
    <header className="header" style={{ alignItems: isMobile ? 'flex-start' : 'center' }}>
      <div className="brand" style={{ gap: 12 }}>
        <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="logo" aria-hidden>
            FB
          </div>
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="brand-name">Find Bottle Shops</div>
          <div className="lead" style={{ marginTop: 4 }}>ค้นหาร้านขายขวดใกล้ตัวคุณ</div>
        </div>
      </div>

      {/* mobile toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        {isMobile && (
          <button
            className="hamburger"
            aria-label="เมนู"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((s) => !s)}
            title="เมนู"
          >
            {navOpen ? '✕' : '☰'}
          </button>
        )}

        <nav
          className="nav"
          style={{
            display: isMobile ? (navOpen ? 'flex' : 'none') : 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: 12,
            minWidth: isMobile ? '100%' : 'auto'
          }}
        >
          <Link to="/" onClick={() => setNavOpen(false)}>หน้าแรก (แผนที่)</Link>

          {userRole === 'admin' && (
            <Link to="/admin" onClick={() => setNavOpen(false)}>Dashboard แอดมิน</Link>
          )}

          {(userRole === 'owner' || userRole === 'admin') && (
            <Link to="/shop-form" onClick={() => setNavOpen(false)}>ลงทะเบียนร้านค้า</Link>
          )}

          {(userRole === 'owner' || userRole === 'admin') && (
            <Link to="/shop-list" onClick={() => setNavOpen(false)}>จัดการร้านของฉัน</Link>
          )}

          {!currentUser ? (
            <>
              <div style={{ display: 'flex', gap: 8, marginTop: isMobile ? 8 : 0 }}>
                <Link to="/login" onClick={() => setNavOpen(false)} style={{ textDecoration: 'none' }}>
                  <span className="btn ghost" style={{ padding: '8px 12px' }}>ล็อกอิน</span>
                </Link>
                <Link to="/register" onClick={() => setNavOpen(false)} style={{ textDecoration: 'none' }}>
                  <span className="btn primary" style={{ padding: '8px 12px' }}>สมัครสมาชิก</span>
                </Link>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: isMobile ? 8 : 0 }}>
              <div style={{ color: 'var(--muted)', fontWeight: 600 }}>
                สวัสดี, {currentUser?.email ?? 'ผู้ใช้'}
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Role: {userRole}</div>
              </div>
              <button
                onClick={handleLogout}
                className="btn ghost"
                style={{ marginLeft: 6 }}
                aria-label="ล็อกเอาท์"
              >
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