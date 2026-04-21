import React from 'react';
import { Marker, Popup } from 'react-leaflet';
// นำเข้าไอคอนของคุณ (ถ้ามี) เช่น: import { customIcon } from '../../utils/mapIcons';

const ShopMarker = ({ shop }) => {
  // ตรวจสอบว่ามีข้อมูลร้านและพิกัดหรือไม่
  if (!shop) return null;
  
  // รองรับกรณีที่คุณอาจจะตั้งชื่อ key เป็น lat/lng หรือ latitude/longitude
  const lat = shop.lat || shop.latitude;
  const lng = shop.lng || shop.longitude;

  if (!lat || !lng) return null;

  // ADDED: สร้าง URL ของ Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <Marker position={[lat, lng]}>
      <Popup>
        <div style={{ textAlign: 'center', minWidth: '160px' }}>
          <h3 className="brand-name" style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>
            {shop.name || 'ไม่มีชื่อร้าน'}
          </h3>
          <p className="lead" style={{ margin: '0 0 12px 0', fontSize: '0.9rem' }}>
            {shop.address || shop.description || 'ไม่มีรายละเอียด'}
          </p>
          
          {/* ADDED: ปุ่มนำทางไป Google Maps */}
          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn primary fullWidth"
            style={{ textDecoration: 'none', padding: '8px 12px', fontSize: '0.9rem' }}
          >
            🗺️ นำทาง
          </a>
        </div>
      </Popup>
    </Marker>
  );
};

export default ShopMarker;