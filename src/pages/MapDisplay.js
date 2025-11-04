import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import L from 'leaflet';

// (Import Icons ที่เราสร้างไว้)
import { getIcon } from '../utils/mapIcons';

// (พิกัดศูนย์กลาง มจพ.)
const center = [13.8197, 100.5146];

const MapDisplay = () => {
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'shop', 'booth'

  // (useEffect ดึงข้อมูล - เหมือนเดิม)
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'shops'), 
      where('status', '==', 'approved')
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const approvedLocations = [];
      querySnapshot.forEach((doc) => {
        approvedLocations.push({ id: doc.id, ...doc.data() });
      });
      setAllLocations(approvedLocations);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูลได้");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // (กรองข้อมูล - เหมือนเดิม)
  const filteredLocations = allLocations.filter(loc => {
    if (filter === 'all') return true;
    return loc.type === filter;
  });

  // (Helper function - เหมือนเดิม)
  const getButtonClass = (type) => {
    return filter === type ? 'btn primary' : 'btn';
  };
  const allCount = allLocations.length;
  const shopCount = allLocations.filter(l => l.type === 'shop').length;
  const boothCount = allLocations.filter(l => l.type === 'booth').length;

  return (
    <div>
      {/* (ส่วนของปุ่ม Filter - เหมือนเดิม) */}
      <div style={{ display: 'flex', gap: '10px', padding: 'var(--spacing-md) var(--spacing-md) 0' }}>
        <button className={getButtonClass('all')} onClick={() => setFilter('all')}>
          แสดงทั้งหมด ({allCount})
        </button>
        <button className={getButtonClass('shop')} onClick={() => setFilter('shop')}>
          ร้านรับซื้อ ({shopCount})
        </button>
        <button className={getButtonClass('booth')} onClick={() => setFilter('booth')}>
          ตู้แยกขวด ({boothCount})
        </button>
      </div>

      {loading && <p style={{ padding: '20px' }}>กำลังโหลดแผนที่...</p>}
      {error && <p className="error-text" style={{ padding: '20px' }}>{error}</p>}
      
      {/* (ส่วนของแผนที่ - เหมือนเดิม) */}
      <MapContainer 
        center={center} 
        zoom={14} 
        style={{ height: '70vh', width: '100%', borderRadius: 'var(--radius)', marginTop: 'var(--spacing-md)', zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {filteredLocations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.coordinates.lat, loc.coordinates.lng]}
            icon={getIcon(loc.type)}
          >
            {/* --- ⬇️ (นี่คือจุดที่แก้ไข) ⬇️ --- */}
            {/* (เราเติมเนื้อหาเข้าไปใน Popup) */}
            <Popup>
              <h3 style={{margin: 0, padding: 0, fontSize: '1.1rem'}}>{loc.shopName}</h3>
              <span style={{
                  background: loc.type === 'shop' ? 'var(--accent)' : '#E9D5FF', 
                  color: loc.type === 'shop' ? 'white' : '#5B21B6',
                  padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                }}>
                {loc.type === 'shop' ? 'ร้านรับซื้อ' : 'ตู้แยกขวด'}
              </span>
              <p style={{margin: '8px 0 0 0', fontSize: '0.9rem'}}>
                <b>เวลาทำการ:</b> {loc.operatingHours} <br />
                <b>ที่อยู่:</b> {loc.address}
              </p>
              {/* (แสดงคำอธิบาย ถ้ามี) */}
              {loc.description && (
                <p style={{fontStyle: 'italic', margin: '4px 0 0 0', fontSize: '0.9rem'}}>
                  "{loc.description}"
                </p>
              )}
            </Popup>
            {/* --- ⬆️ (จบจุดที่แก้ไข) ⬆️ --- */}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapDisplay;