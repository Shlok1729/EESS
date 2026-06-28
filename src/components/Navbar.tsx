import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Services', path: '/services' },
    { name: 'Our Clients', path: '/clients' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact Us', path: '/contact' }
  ];

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <img src="/logo.png" alt="Eagle Eye Security Services Logo" className="h-12 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-ees-navy leading-none">EAGLE EYE</span>
              <span className="text-[0.65rem] font-bold tracking-[0.2em] text-ees-red uppercase mt-1">Security Services</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-colors text-sm uppercase tracking-wider ${
                  location.pathname === link.path ? 'text-ees-red' : 'text-ees-navy hover:text-ees-red'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex">
            <Link to="/contact" className="bg-ees-red hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg">
              Get a Free Quote
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-ees-navy hover:text-ees-red focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-3 py-2 text-base font-medium rounded-md ${
                  location.pathname === link.path ? 'text-ees-red bg-gray-50' : 'text-ees-navy hover:text-ees-red hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="px-3 py-2">
              <Link to="/contact" onClick={() => setIsOpen(false)} className="block w-full bg-ees-red text-white px-4 py-2 rounded-md font-semibold text-center">
                Get a Free Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
