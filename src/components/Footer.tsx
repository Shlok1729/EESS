import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-ees-navy text-gray-300 pt-20 pb-10" id="contact-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          
          {/* Col 1: Intro */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 w-fit">
              <div className="bg-white p-1.5 rounded-lg">
                <img src="/logo.png" alt="Eagle Eye Security Services Logo" className="h-10 w-auto object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-white leading-none">EAGLE EYE</span>
                <span className="text-[0.65rem] font-bold tracking-[0.2em] text-ees-red uppercase mt-1">Security Services</span>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm mt-6">
              Securing assets, businesses, and people with uncompromising dedication and professional excellence in Moradabad and beyond.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'About Us', path: '/about' },
                { name: 'Our Services', path: '/services' },
                { name: 'Our Clients', path: '/clients' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Contact Us', path: '/contact' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="hover:text-ees-red transition-colors inline-flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" /> {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-ees-red shrink-0 mt-1" />
                <span>
                  House No-204, A-block, Sec-13,<br />
                  Landmark Power House,<br />
                  New Moradabad 244001 U.P
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-ees-red shrink-0" />
                <span>+91-8192005876</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-ees-red shrink-0" />
                <span>info@eagleeyesecurity.in</span>
              </li>
              <li className="flex items-center gap-3 mt-4">
                <span className="font-bold text-white">Director:</span> Sunil Kumar Gupta
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Eagle Eye Security Services. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
