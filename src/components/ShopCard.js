import React from 'react';
import { Link } from 'react-router-dom';

const ShopCard = ({ shop, userRole, onArchiveClick }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--spacing-md)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        gap: '1rem'
      }}
    >
      {/* ส่วนแสดงรูปภาพและรายละเอียดร้าน */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '1 1 min-content' }}>
        {shop.imageUrl && (
          <img 
            src={shop.imageUrl || '/logo192.png'} 
            alt={shop.shopName}
            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/logo192.png'; 
            }}
          />
        )}
        
        <div>
          <h3 style={{ fontWeight: 600 }}>{shop.shopName}</h3>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '4px 0' }}>
            <span style={{
              background: shop.type === 'shop' ? 'var(--accent)' : '#E9D5FF',
              color: shop.type === 'shop' ? 'white' : '#5B21B6',
              padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
            }}>
              ประเภท: {shop.type === 'shop' ? 'ร้านค้า' : (shop.type === 'booth' ? 'ตู้' : 'N/A')}
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem',
              background: shop.status === 'approved' ? '#C6F6D5' : (shop.status === 'pending' ? '#FEEBC8' : '#FED7D7'),
              color: shop.status === 'approved' ? '#22543D' : (shop.status === 'pending' ? '#744210' : '#822727')
            }}>
              สถานะ: {shop.status}
            </span>
          </div>

          {shop.status === 'rejected' && (
            <p className="error-text" style={{ fontSize: '0.9rem', margin: '4px 0 0 0' }}>
              <b>เหตุผลที่ถูกปฏิเสธ:</b> {shop.rejectionReason}
            </p>
          )}
        </div>
      </div>

      {/* ส่วนปุ่มจัดการ (แสดงตาม Role) */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
        <Link
          to={`/edit-shop/${shop.id}`}
          className="btn"
          style={{ textDecoration: 'none', background: '#EDF2F7', color: '#1A202C' }}
        >
          {shop.status === 'rejected' ? 'แก้ไขและส่งใหม่' : 'แก้ไข'}
        </Link>

        {userRole === 'owner' && (
          <button
            className="btn"
            style={{ background: 'var(--danger)', color: 'white' }}
            onClick={() => onArchiveClick(shop.id)}
          >
            ลบ/ซ่อน
          </button>
        )}
      </div>
    </div>
  );
};

export default ShopCard;