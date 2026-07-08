import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { Analytics } from '@vercel/analytics/react';

const Layout = () => {
  return (
    <div className="font-sans flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20">
        <Analytics />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
