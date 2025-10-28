import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import Navbar from './components/layout/Navbar';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    
    <AuthProvider>
      <BrowserRouter>
        <Navbar /> {/* Navbar แสดงทุกหน้า */}
        <div style={{ padding: '20px' }}>
          <AppRouter />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;