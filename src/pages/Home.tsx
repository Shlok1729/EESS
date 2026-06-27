import { Shield, ChevronRight, Sparkles, UserCheck, Search, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

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
              <Link to="/contact" className="bg-ees-red hover:bg-red-700 text-white px-8 py-4 rounded-md font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 group">
                Hire Security Now
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/services" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-ees-navy px-8 py-4 rounded-md font-bold text-lg transition-colors flex items-center justify-center">
                Explore Services
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Services Overview */}
      <section className="py-20 bg-ees-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ees-navy mb-4">Core Expertise</h2>
            <div className="w-16 h-1.5 bg-ees-red mx-auto mb-6"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <Shield className="h-10 w-10 text-ees-red mb-4" />
              <h3 className="text-lg font-bold text-ees-navy">Guarding Services</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <Sparkles className="h-10 w-10 text-ees-red mb-4" />
              <h3 className="text-lg font-bold text-ees-navy">Housekeeping & IFM</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <UserCheck className="h-10 w-10 text-ees-red mb-4" />
              <h3 className="text-lg font-bold text-ees-navy">Bouncers & Event Security</h3>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <Search className="h-10 w-10 text-ees-red mb-4" />
              <h3 className="text-lg font-bold text-ees-navy">Investigation</h3>
            </div>
          </div>
          <div className="text-center mt-10">
             <Link to="/services" className="text-ees-red font-semibold hover:underline inline-flex items-center gap-1">
                View all services <ChevronRight className="h-4 w-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* Quick Testimonial */}
      <section className="py-20 bg-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto relative">
            <Quote className="absolute -top-10 -left-6 lg:-left-12 h-32 w-32 text-gray-200/60 -z-10 rotate-180" />
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
              <p className="text-xl md:text-2xl text-gray-700 font-medium italic leading-relaxed mb-8">
                "Pleasant and professional services, quality & dedication of security guards is well up to the mark. Highly recommend Eagle Eye for factory security."
              </p>
              <div className="flex justify-between items-center">
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
                <Link to="/clients" className="hidden sm:flex text-ees-red font-semibold hover:underline items-center gap-1">
                  More reviews <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
