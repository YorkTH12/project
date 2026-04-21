import React, { useState, useEffect, useRef } from 'react'; // ADDED
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/global.css';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { getIcon } from '../utils/mapIcons';

const DEFAULT_COORDS = [13.8197, 100.5146];

function MapClickHandler({ onMapClick, markerPosition, type }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return markerPosition ? (
    <Marker position={markerPosition} icon={getIcon(type || 'shop')}>
      <Popup>ตำแหน่งที่แก้ไขใหม่</Popup>
    </Marker>
  ) : null;
}

const EditShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState(''); 
  const [operatingHours, setOperatingHours] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('shop');
  const [markerPosition, setMarkerPosition] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // ADDED: ใช้ useRef เพื่อเก็บ Timeout
  const debounceTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const docRef = doc(db, 'shops', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setShopName(data.shopName || '');
          setAddress(data.address || '');
          setOperatingHours(data.operatingHours || '');
          setDescription(data.description || '');
          setType(data.type || 'shop');
          
          if (data.coordinates) {
            setMarkerPosition({ lat: data.coordinates.lat, lng: data.coordinates.lng });
          }
        } else {
          setError("ไม่พบข้อมูลสถานที่นี้ในระบบ");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [id]);

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`);
      if (!response.ok) throw new Error('Nominatim API call failed');
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error("Reverse Geocoding Error:", err);
    }
    setIsGeocoding(false);
  };

  const handleMapClick = (latlng) => {
    setMarkerPosition(latlng);
    setIsGeocoding(true);
    setAddress('กำลังดึงข้อมูลที่อยู่...');

    // MODIFIED: เทคนิค Debounce กันรัวปุ่ม
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchAddressFromCoords(latlng.lat, latlng.lng);
    }, 1000); // ดีเลย์ 1 วิ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shopName.trim() || !operatingHours.trim() || !address.trim()) {
      setError("กรุณากรอกข้อมูลบังคับให้ครบถ้วน");
      return;
    }
    if (!markerPosition) { 
      setError("กรุณาปักหมุดตำแหน่ง"); 
      return; 
    }

    setSaving(true);
    setError('');

    try {
      const shopRef = doc(db, 'shops', id);
      await updateDoc(shopRef, {
        shopName: shopName.trim(),
        address: address.trim(),
        operatingHours: operatingHours.trim(),
        description: description.trim(),
        coordinates: {
          lat: markerPosition.lat,
          lng: markerPosition.lng,
        },
        updatedAt: serverTimestamp(),
      });
      
      alert("อัปเดตข้อมูลสำเร็จ!");
      navigate('/admin');

    } catch (err) {
      console.error("Error updating document: ", err);
      setError("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + err.message);
    } finally {
      setSaving(false); 
    }
  };

  if (loading) {
    return <div className="card" style={{ maxWidth: 720, margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="card" style={{ maxWidth: 720, margin: '2rem auto 0 auto' }}>
      <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="title">แก้ไขข้อมูล ({type === 'shop' ? 'ร้านรับซื้อ' : 'ตู้แยกขวด'})</h2>
          <p className="lead">อัปเดตรายละเอียดและตำแหน่งบนแผนที่</p>
        </div>
        <button onClick={() => navigate('/admin')} className="btn ghost" style={{ padding: '6px 12px' }}>
          ย้อนกลับ
        </button>
      </div>

      {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shopName">ชื่อสถานที่ (บังคับ)</label>
            <input id="shopName" type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required disabled={saving} />
          </div>
          <div className="form-group">
            <label htmlFor="hours">เวลาทำการ (บังคับ)</label>
            <input id="hours" type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} required disabled={saving} />
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              {['เปิด 24 ชั่วโมง', '08:00 - 17:00', '09:00 - 18:00', 'ตามเวลาเปิดห้าง'].map(time => (
                <button 
                  key={time} type="button" onClick={() => setOperatingHours(time)} disabled={saving}
                  style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--muted)', cursor: 'pointer' }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="address">ที่อยู่ (บังคับ)</label>
            <input 
              id="address" 
              type="text" 
              value={address}
              onChange={(e) => {
                setIsGeocoding(false);
                setAddress(e.target.value); 
              }} 
              required 
              disabled={saving || isGeocoding} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">คำอธิบายเพิ่มเติม</label>
            <textarea id="description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} disabled={saving} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>ตำแหน่ง (คลิกบนแผนที่เพื่อเปลี่ยนตำแหน่ง)</label>
            <MapContainer 
              center={markerPosition || DEFAULT_COORDS} 
              zoom={15} 
              style={{ height: '300px', width: '100%', borderRadius: 'var(--radius)', zIndex: 0 }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler onMapClick={handleMapClick} markerPosition={markerPosition} type={type} />
            </MapContainer>
          </div>
        </div>

        <button type="submit" className="btn primary fullWidth" disabled={saving || isGeocoding} style={{marginTop: '1rem'}}>
          {saving ? 'กำลังบันทึกข้อมูล...' : (isGeocoding ? 'กำลังค้นหาพิกัด...' : 'บันทึกการแก้ไข')}
        </button>
      </form>
    </div>
  );
};

export default EditShop;