import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/global.css'; // ถูกต้อง

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // เพิ่ม state loading
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // เริ่มโหลด
    try {
      await login(email, password);
      navigate('/'); 
    } catch (err) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
    setLoading(false); // โหลดเสร็จ
  };

  return (
    // 1. ลบ <div className="app-container"> และ <header> ที่ซ้ำซ้อนออก
    //    เราจะเริ่มที่ "การ์ด" เลย และจัดกลางเอง
    
    <div className="card" style={{ maxWidth: 500, margin: '2rem auto 0 auto' }}>
      
      {/* 2. สร้างหัวข้อของการ์ดนี้เอง */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h2 className="title">ล็อกอิน</h2>
        <p className="lead">เข้าสู่ระบบเพื่อจัดการร้านของคุณ</p>
      </div>

      {/* 3. โค้ดฟอร์มนี้ยอดเยี่ยมมากครับ มันแก้ปัญหาช่องว่างได้แล้ว */}
      <form className="form" onSubmit={handleSubmit} aria-label="Login form">
        
        <div className="form-group">
          <label htmlFor="emailLogin">Email</label>
          <input 
            id="emailLogin" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="passwordLogin">Password</label>
          <input 
            id="passwordLogin" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        {/* 4. ใช้ .error-text จาก global.css */}
        {error && <div className="error-text" role="alert">{error}</div>}

        {/* 5. จัดปุ่มให้ UX ดีขึ้น */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          
          <button className="btn primary fullWidth" type="submit" disabled={loading}>
            {loading ? 'กำลังล็อกอิน...' : 'ล็อกอิน'}
          </button>
          
          <Link 
            to="/register" 
            style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}
          >
            ยังไม่มีบัญชี? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>สมัครสมาชิก</span>
          </Link>

        </div>
      </form>
    </div>
  );
};

export default Login;