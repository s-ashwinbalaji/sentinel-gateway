import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BankPortal from './pages/BankPortal';
import SocDashboard from './pages/SocDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/portal" replace />} />
        <Route path="/portal" element={<BankPortal />} />
        <Route path="/soc" element={<SocDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
