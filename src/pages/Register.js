import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/global.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // assume register throws on failure (Firebase / typical auth libs)
      await register(email, password);

      // register resolved => proceed to home (user may already be logged in)
      navigate('/');
    } catch (err) {
      console.error('register error', err);
      // provide clearer messages for common cases if available
      const code = err?.code || err?.message || '';
      if (code.includes('email-already') || code.includes('auth/email-already-in-use')) {
        setError('อีเมลนี้ถูกใช้งานแล้ว');
      } else {
        setError('ไม่สามารถสมัครสมาชิกได้ (โปรดลองอีกครั้ง)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720, margin: '2rem auto 0 auto' }}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h2 className="title">สร้างบัญชี (สำหรับเจ้าของร้าน)</h2>
        <p className="lead">ลงทะเบียนเพื่อเริ่มเพิ่มร้านค้าของคุณลงในแผนที่</p>
      </div>

      <form className="form" onSubmit={handleSubmit} aria-label="Register form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
        </div>

        {error && <div className="error-text" role="alert">{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <button className="btn primary fullWidth" type="submit" disabled={loading}>
            {loading ? 'กำลังสมัคร...' : 'ยืนยันการสมัครสมาชิก'}
          </button>

          <Link 
            to="/login" 
            style={{ textDecoration: 'none', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}
          >
            มีบัญชีอยู่แล้ว? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>ล็อกอินที่นี่</span>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;