import React from 'react';
import '../styles/global.css';

const ShopCard = ({ shop }) => {
  if (!shop) return null;

  const lat = shop.lat || shop.latitude;
  const lng = shop.lng || shop.longitude;

  // ADDED: สร้าง URL ของ Google Maps
  const googleMapsUrl = (lat && lng) 
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` 
    : null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexGrow: 1 }}>
        <h3 className="brand-name" style={{ marginBottom: '8px' }}>{shop.name || 'ไม่มีชื่อร้าน'}</h3>
        <p className="lead" style={{ marginBottom: '16px', fontSize: '0.95rem' }}>
          {shop.address || shop.description || 'ไม่มีรายละเอียดที่อยู่'}
        </p>
        
        {/* ตรงนี้คุณสามารถใส่ข้อมูลอื่นๆ ของร้านเพิ่มเติมได้ตามโครงสร้างเดิมของคุณ */}
      </div>

      {/* ADDED: แสดงปุ่มนำทางถ้ามีพิกัด */}
      {googleMapsUrl && (
        <div style={{ marginTop: '16px' }}>
          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn primary fullWidth"
            style={{ textDecoration: 'none', justifyContent: 'center' }}
          >
            🗺️ นำทางไปที่นี่
          </a>
        </div>
      )}
    </div>
  );
};

export default ShopCard;