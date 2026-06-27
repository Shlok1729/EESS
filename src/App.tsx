import { useState } from 'react';
import { 
  Shield, 
  Menu, 
  X, 
  Sparkles, 
  UserCheck, 
  Search, 
  Quote, 
  MapPin, 
  Phone, 
  Mail,
  ChevronRight
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const links = ['Home', 'About Us', 'Our Services', 'Our Clients', 'Testimonials', 'Contact Us'];

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <Shield className="h-8 w-8 text-ees-red" />
            <span className="font-bold text-2xl tracking-tight text-ees-navy">EAGLE EYE</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <a 
                key={link} 
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-ees-navy hover:text-ees-red font-medium transition-colors text-sm uppercase tracking-wider"
              >
                {link}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex">
            <button className="bg-ees-red hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg">
              Get a Free Quote
            </button>
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
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="block px-3 py-2 text-base font-medium text-ees-navy hover:text-ees-red hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {link}
              </a>
            ))}
            <div className="px-3 py-2">
              <button className="w-full bg-ees-red text-white px-4 py-2 rounded-md font-semibold text-center">
                Get a Free Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    <section id="home" className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden min-h-[90vh] flex items-center">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80" 
          alt="Security Professionals" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ees-navy/85 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-ees-navy/95 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ees-red/10 border border-ees-red/20 text-ees-red mb-6 animate-fade-in-up">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-semibold tracking-wide">ZERO-COMPROMISE SECURITY</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Securing Moradabad’s <br/><span className="text-ees-red">Top Businesses</span> & Assets.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
            Professional Security, Investigation, & Integrated Housekeeping Services for Industrial, Commercial, and Residential sectors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-ees-red hover:bg-red-700 text-white px-8 py-4 rounded-md font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group">
              Hire Security Now
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-ees-navy px-8 py-4 rounded-md font-bold text-lg transition-colors flex items-center justify-center">
              Explore Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  return (
    <section id="about-us" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-ees-navy mb-4">
                Elite Protection by <span className="text-ees-red">Ex-Military Professionals</span>
              </h2>
              <div className="w-20 h-1.5 bg-ees-red mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Eagle Eye Security Services (EES) is a fully compliant, newly upgraded security setup committed to delivering unparalleled protection and facility management. 
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Under the visionary leadership of <strong>Director Sunil Kumar Gupta</strong>, we bring a zero-compromise approach to security. Our personnel are highly trained, disciplined, and include ex-military experts dedicated to safeguarding your assets.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="bg-ees-light p-3 rounded-lg text-ees-red">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-ees-navy">Fully Compliant</h4>
                  <p className="text-sm text-gray-500 mt-1">Licensed and certified operations.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-ees-light p-3 rounded-lg text-ees-red">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-ees-navy">Expert Personnel</h4>
                  <p className="text-sm text-gray-500 mt-1">Highly trained & ex-military staff.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <div className="absolute inset-0 bg-ees-red rounded-2xl transform translate-x-4 translate-y-4 -z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80" 
              alt="Corporate Security Team" 
              className="rounded-2xl shadow-xl w-full object-cover h-[500px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Services = () => {
  const services = [
    {
      title: "Guarding Services",
      description: "Comprehensive commercial, industrial & residential security solutions tailored to your specific needs.",
      icon: <Shield className="h-10 w-10 text-ees-red" />
    },
    {
      title: "Housekeeping & IFM",
      description: "Complete integrated facility management, ensuring your premises are immaculate and well-maintained.",
      icon: <Sparkles className="h-10 w-10 text-ees-red" />
    },
    {
      title: "Bouncers & Event Security",
      description: "On-demand specialized event protection with trained professionals for crowd control and VIP safety.",
      icon: <UserCheck className="h-10 w-10 text-ees-red" />
    },
    {
      title: "Investigation & Detection",
      description: "Discreet corporate screening, background checks, and private investigation services.",
      icon: <Search className="h-10 w-10 text-ees-red" />
    }
  ];

  return (
    <section id="our-services" className="py-20 lg:py-32 bg-ees-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-ees-navy mb-4">Our Core Services</h2>
          <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Integrated solutions for all your security and facility management needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="bg-red-50 w-20 h-20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-ees-navy mb-3">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Clients = () => {
  const clients = [
    "Moradabad Airport",
    "G.K. Hospital",
    "Tata Motors CNG",
    "SDM Inter College",
    "Jungle Safari Water Park",
    "Eastwood International Export"
  ];

  return (
    <section id="our-clients" className="py-20 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-ees-navy mb-4">Trusted By The Best</h2>
        <div className="w-20 h-1.5 bg-ees-red mx-auto"></div>
      </div>
      
      {/* CSS Marquee Alternative using flex layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
          {clients.map((client, index) => (
            <div 
              key={index}
              className="w-full bg-ees-light py-8 px-4 rounded-lg text-center font-bold text-gray-500 hover:text-ees-navy hover:bg-gray-100 transition-colors cursor-default"
            >
              {client}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-32 bg-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-ees-navy mb-4">What Our Customers Say</h2>
          <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <Quote className="absolute -top-10 -left-6 lg:-left-12 h-32 w-32 text-gray-200/60 -z-10 rotate-180" />
          
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
            <p className="text-xl md:text-2xl text-gray-700 font-medium italic leading-relaxed mb-8">
              "Pleasant and professional services, quality & dedication of security guards is well up to the mark. Highly recommend Eagle Eye for factory security."
            </p>
            
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gray-200 border-2 border-ees-red overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/initials/svg?seed=NF&backgroundColor=e2e8f0&textColor=0f172a" 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-ees-navy text-lg">Nirmal Fibres Pvt Ltd.</h4>
                <p className="text-sm text-gray-500">Factory Client, Moradabad</p>
              </div>
            </div>
          </div>
          
          {/* Dots navigation placeholder */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-3 h-3 rounded-full bg-ees-red"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-ees-navy text-gray-300 pt-20 pb-10" id="contact-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-16">
          
          {/* Col 1: Intro */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-ees-red" />
              <span className="font-bold text-2xl tracking-tight text-white">EAGLE EYE</span>
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Securing assets, businesses, and people with uncompromising dedication and professional excellence in Moradabad and beyond.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {['Home', 'About Us', 'Our Services', 'Our Clients', 'Testimonials'].map(link => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-ees-red transition-colors inline-flex items-center gap-2">
                    <ChevronRight className="h-4 w-4" /> {link}
                  </a>
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

function App() {
  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Clients />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
