import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Clients from './pages/Clients';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Loader from './components/Loader';
import GuardPatrol from './pages/GuardPatrol';
import GuardAttendance from './pages/GuardAttendance';
import AdminDashboard from './pages/AdminDashboard';
import GuardApp from './pages/GuardApp';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import AdminLogin from './pages/AdminLogin';


const AppContent = () => {
  const location = useLocation();

  return (
    <>
      {/* Remounts the Loader whenever the pathname changes */}
      <Loader key={location.pathname} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="clients" element={<Clients />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/client/login" element={<ClientLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

        </Route>
        <Route path="/guard/patrol" element={<GuardPatrol />} />
        <Route path="/guard/clock-in" element={<GuardAttendance />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/guard" element={<GuardApp />} />

        <Route path="/client/dashboard" element={<ClientDashboard />} />

      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
