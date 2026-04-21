import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css'; // หรือ import '../index.css' ขึ้นอยู่กับโปรเจกต์ของคุณ

const Login = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const { login } = useAuth();
const navigate = useNavigate();

const handleSubmit = async (e) => {
e.preventDefault();
setError('');
setLoading(true);
try {
await login(email, password);
// ไปหน้า admin dashboard เมื่อล็อกอินสำเร็จ
navigate('/admin');
} catch (err) {
setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
}
setLoading(false);
};

return (
// MODIFIED: ครอบด้วย .app-container เพื่อให้ได้ Padding และ Max-width ที่สวยงามตาม CSS
<div className="app-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>

  {/* MODIFIED: ใช้ .card ตาม CSS และจำกัดความกว้างไม่ให้ฟอร์มยืดเต็มจอเกินไป */}
  <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
    
    <div style={{ marginBottom: 'var(--spacing-md)', textAlign: 'center' }}>
      {/* MODIFIED: ใช้ .title และ .lead ตาม CSS */}
      <h2 className="title">Admin Login</h2>
      <p className="lead">เข้าสู่ระบบสำหรับผู้ดูแลระบบเพื่อจัดการข้อมูล</p>
    </div>

    {/* MODIFIED: ใช้ .form ตาม CSS */}
    <form className="form" onSubmit={handleSubmit} aria-label="Login form">
      
      {/* MODIFIED: ใช้ .form-group ตาม CSS */}
      <div className="form-group">
        <label htmlFor="emailLogin">Email</label>
        <input 
          id="emailLogin" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          placeholder="admin@example.com"
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
          placeholder="********"
        />
      </div>

      {/* MODIFIED: ใช้ .error-text ตาม CSS */}
      {error && <div className="error-text" role="alert">{error}</div>}

      {/* MODIFIED: ใช้ .btn .primary .fullWidth ตรงตาม CSS เลย */}
      <button className="btn primary fullWidth" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
        {loading ? 'กำลังล็อกอิน...' : 'ล็อกอิน'}
      </button>
      
    </form>
  </div>
</div>


);
};

export default Login;