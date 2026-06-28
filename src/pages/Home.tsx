import { Shield, ChevronRight, Sparkles, UserCheck, Search, QrCode, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import TestimonialsCarousel from '../components/Testimonials';

const Home = () => {
  return (
    <>
      <section className="relative pt-12 pb-32 lg:pt-20 lg:pb-48 overflow-hidden min-h-[85vh] flex items-center">
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Written Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ees-red/10 border border-ees-red/20 text-ees-red mb-6 animate-fade-in-up">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-semibold tracking-wide">ZERO-COMPROMISE SECURITY</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
                Securing Moradabad’s <br /><span className="text-ees-red">Top Businesses</span> & Assets.
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
                Professional Security, Investigation, & Integrated Housekeeping Services for Industrial, Commercial, and Residential sectors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="bg-ees-red hover:bg-red-700 text-white px-8 py-4 rounded-md font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group">
                  Hire Security Now
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/services" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-ees-navy px-8 py-4 rounded-md font-bold text-lg transition-colors flex items-center justify-center">
                  Explore Services
                </Link>
              </div>
            </div>

            {/* Right Column: Animated Logo / Image Placeholder */}
            <div className="hidden lg:flex justify-center items-center relative">
              {/* Glowing Background Blur */}
              <div className="absolute inset-0 bg-ees-red/20 blur-[100px] rounded-full"></div>

              {/* Premium Animated SVG Container */}
              <div className="relative bg-white/5 p-16 rounded-full border border-white/10 backdrop-blur-sm shadow-2xl">
                {/* Center Icon (Logo) */}
                <div className="relative z-10 w-48 h-48 flex items-center justify-center bg-white/90 rounded-full p-4 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                  <img src="/logo.png" alt="Eagle Eye Security Services Logo" className="w-full h-auto object-contain" />
                </div>

                {/* Rotating Rings */}
                <div className="absolute inset-0 border-4 border-white/5 rounded-full border-t-ees-gold animate-spin" style={{ animationDuration: '8s' }}></div>
                <div className="absolute inset-[-24px] border-2 border-dashed border-white/20 rounded-full animate-spin" style={{ animationDuration: '24s', animationDirection: 'reverse' }}></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Infinite Marquee Client Banner */}
      <div className="bg-ees-gold border-y border-gray-200 pt-8 pb-6 overflow-hidden flex flex-col items-center shadow-inner relative">
        <h3 className="text-gray-500 uppercase tracking-[0.2em] text-sm font-semibold mb-6 z-20">
          Trusted By Moradabad's Leading Organizations
        </h3>

        {/* Fading gradients at the edges for a smoother effect */}
        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-ees-gold to-transparent z-10 pointer-events-none mt-14"></div>
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-ees-gold to-transparent z-10 pointer-events-none mt-14"></div>

        <div className="flex whitespace-nowrap animate-marquee w-full">
          {/* We duplicate the array to ensure smooth infinite looping */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center space-x-16 mx-8">
              {[
                "Moradabad Airport",
                "G.K. Hospital",
                "Tata Motors CNG",
                "SDM Inter College",
                "Jungle Safari Water Park",
                "Eastwood International Export"
              ].map((client, index) => (
                <div key={index} className="text-ees-navy font-bold text-xl uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity flex items-center">
                  <span className="mr-3 text-ees-red text-2xl">•</span> {client}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Services Overview */}
      <section className="py-20 bg-ees-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ees-navy mb-4">Core Expertise</h2>
            <div className="w-16 h-1.5 bg-ees-red mx-auto mb-6"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/services#guarding-services" className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-ees-red/20 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-ees-red/5 flex items-center justify-center mb-6 group-hover:bg-ees-red transition-colors duration-300 shrink-0">
                <Shield className="h-10 w-10 text-ees-red group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-ees-navy group-hover:text-ees-red transition-colors duration-300 mb-3">Guarding Services</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Highly trained ex-military and professional guards providing uncompromising safety for commercial, industrial, and residential sectors.
              </p>
            </Link>
            <Link to="/services#housekeeping-ifm" className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-ees-red/20 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-ees-red/5 flex items-center justify-center mb-6 group-hover:bg-ees-red transition-colors duration-300 shrink-0">
                <Sparkles className="h-10 w-10 text-ees-red group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-ees-navy group-hover:text-ees-red transition-colors duration-300 mb-3">Housekeeping & IFM</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Comprehensive facility management ensuring your premises remain immaculate, well-maintained, and perfectly operational 24/7.
              </p>
            </Link>
            <Link to="/services#bouncers-event-security" className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-ees-red/20 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-ees-red/5 flex items-center justify-center mb-6 group-hover:bg-ees-red transition-colors duration-300 shrink-0">
                <UserCheck className="h-10 w-10 text-ees-red group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-ees-navy group-hover:text-ees-red transition-colors duration-300 mb-3">Bouncers & Event Security</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Specialized crowd control and VIP protection ensuring seamless, incident-free management for high-profile events and concerts.
              </p>
            </Link>
            <Link to="/services#investigation" className="group bg-white p-8 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-ees-red/20 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="w-20 h-20 rounded-full bg-ees-red/5 flex items-center justify-center mb-6 group-hover:bg-ees-red transition-colors duration-300 shrink-0">
                <Search className="h-10 w-10 text-ees-red group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-ees-navy group-hover:text-ees-red transition-colors duration-300 mb-3">Investigation</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Discreet corporate screening, background checks, and private investigation services to completely protect your business interests.
              </p>
            </Link>
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="text-ees-red font-semibold hover:underline inline-flex items-center gap-1">
              View all services <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Eagle Eye Advantage (USPs) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ees-navy mb-4">The Eagle Eye Advantage</h2>
            <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              What sets us apart as Moradabad's premium security and facility management provider.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* USP 1 */}
            <div className="group flex flex-col bg-ees-light rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:border-ees-red/20 transition-all duration-300 overflow-hidden cursor-pointer">
              <div className="w-full h-64 overflow-hidden relative">
                <img src="/qr-patrol.jpg" alt="Smart QR Patrols" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 flex flex-col sm:flex-row gap-6 items-start">
                <div className="bg-white p-4 rounded-full text-ees-red shadow-sm shrink-0 group-hover:bg-ees-red group-hover:text-white transition-colors duration-300 -mt-16 relative z-10 border-4 border-ees-light">
                  <QrCode className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ees-navy mb-3 group-hover:text-ees-red transition-colors duration-300">No More Blind Spots: Smart QR Patrols</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Say goodbye to traditional paper registers and sleeping on the job. Eagle Eye deploys strategic QR checkpoints across your premises. Our guards must physically scan these points during their night and day patrols. As a client, you receive automated digital logs proving your property was actively monitored every single hour.
                  </p>
                </div>
              </div>
            </div>

            {/* USP 2 */}
            <div className="group flex flex-col bg-ees-light rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:border-ees-red/20 transition-all duration-300 overflow-hidden cursor-pointer">
              <div className="w-full h-64 overflow-hidden relative">
                <img src="/geo-fence.jpg" alt="Live Geo-Fenced Attendance" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 flex flex-col sm:flex-row gap-6 items-start">
                <div className="bg-white p-4 rounded-full text-ees-red shadow-sm shrink-0 group-hover:bg-ees-red group-hover:text-white transition-colors duration-300 -mt-16 relative z-10 border-4 border-ees-light">
                  <MapPin className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ees-navy mb-3 group-hover:text-ees-red transition-colors duration-300">Verified Deployments: Live Geo-Fenced Attendance</h3>
                  <p className="text-gray-600 leading-relaxed">
                    We bring absolute transparency to manpower deployment. Our personnel log their shifts using GPS-fenced biometric apps and uniform selfies. You get exactly what you pay for—on-time, fully uniformed professionals, verified in real-time by our central Moradabad command desk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <TestimonialsCarousel />


      {/* Quick Testimonial */}

    </>
  );
};

export default Home;
