import { Shield, ChevronRight, Sparkles, UserCheck, Search, Quote, QrCode, MapPin, Award, Users } from 'lucide-react';
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
                {/* Center Icon */}
                <Shield className="h-48 w-48 text-ees-red drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]" strokeWidth={1} />
                
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
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-ees-light p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-white p-4 rounded-full text-ees-red shadow-sm shrink-0">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ees-navy mb-3">No More Blind Spots: Smart QR Patrols</h3>
                <p className="text-gray-600 leading-relaxed">
                  Say goodbye to traditional paper registers and sleeping on the job. Eagle Eye deploys strategic QR checkpoints across your premises. Our guards must physically scan these points during their night and day patrols. As a client, you receive automated digital logs proving your property was actively monitored every single hour.
                </p>
              </div>
            </div>

            {/* USP 2 */}
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-ees-light p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-white p-4 rounded-full text-ees-red shadow-sm shrink-0">
                <MapPin className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ees-navy mb-3">Verified Deployments: Live Geo-Fenced Attendance</h3>
                <p className="text-gray-600 leading-relaxed">
                  We bring absolute transparency to manpower deployment. Our personnel log their shifts using GPS-fenced biometric apps and uniform selfies. You get exactly what you pay for—on-time, fully uniformed professionals, verified in real-time by our central Moradabad command desk.
                </p>
              </div>
            </div>

            {/* USP 3 */}
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-ees-light p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-white p-4 rounded-full text-ees-red shadow-sm shrink-0">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ees-navy mb-3">First Impressions Matter: The Corporate Security Standard</h3>
                <p className="text-gray-600 leading-relaxed">
                  Security is the first point of contact for your clients, guests, and employees. At Eagle Eye, we treat security deployment as brand representation. From crisp, high-visibility uniforms to mandatory grooming standards and polite communication, our personnel are trained to elevate the corporate image of your facility.
                </p>
              </div>
            </div>

            {/* USP 4 */}
            <div className="flex flex-col sm:flex-row gap-6 items-start bg-ees-light p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="bg-white p-4 rounded-full text-ees-red shadow-sm shrink-0">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ees-navy mb-3">Empowering Local Communities with Dignified Employment</h3>
                <p className="text-gray-600 leading-relaxed">
                  Eagle Eye Security is more than a service provider; we are an employment engine for Moradabad and surrounding regions. By up-skilling local youth, ex-servicemen, and providing fair, reliable income, we build a highly motivated, loyal workforce. When you partner with us, you aren't just securing your premises—you are driving local economic empowerment, resulting in guards who truly care about protecting your assets.
                </p>
              </div>
            </div>
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
