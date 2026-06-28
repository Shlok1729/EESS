import { Shield, UserCheck, Award, Users } from 'lucide-react';

const About = () => {
  return (
    <section className="py-20 lg:py-32 bg-white min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-ees-navy mb-4">About Us</h1>
          <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover who we are and what drives our commitment to excellence.
          </p>
        </div>

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
        
        {/* Customer Brand Relationship Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ees-navy mb-4">Customer Brand Relationship</h2>
            <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We believe in building long-lasting partnerships based on trust, quality, and mutual growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* USP 3 from Home */}
            <div className="group flex flex-col sm:flex-row gap-6 items-start bg-ees-light p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:border-ees-red/20 transition-all duration-300 cursor-pointer">
              <div className="bg-white p-4 rounded-full text-ees-red shadow-sm shrink-0 group-hover:bg-ees-red group-hover:text-white transition-colors duration-300">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ees-navy mb-3 group-hover:text-ees-red transition-colors duration-300">First Impressions Matter: The Corporate Security Standard</h3>
                <p className="text-gray-600 leading-relaxed">
                  Security is the first point of contact for your clients, guests, and employees. At Eagle Eye, we treat security deployment as brand representation. From crisp, high-visibility uniforms to mandatory grooming standards and polite communication, our personnel are trained to elevate the corporate image of your facility.
                </p>
              </div>
            </div>

            {/* USP 4 from Home */}
            <div className="group flex flex-col sm:flex-row gap-6 items-start bg-ees-light p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-2 hover:border-ees-red/20 transition-all duration-300 cursor-pointer">
              <div className="bg-white p-4 rounded-full text-ees-red shadow-sm shrink-0 group-hover:bg-ees-red group-hover:text-white transition-colors duration-300">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-ees-navy mb-3 group-hover:text-ees-red transition-colors duration-300">Empowering Local Communities with Dignified Employment</h3>
                <p className="text-gray-600 leading-relaxed">
                  Eagle Eye Security is more than a service provider; we are an employment engine for Moradabad and surrounding regions. By up-skilling local youth, ex-servicemen, and providing fair, reliable income, we build a highly motivated, loyal workforce. When you partner with us, you aren't just securing your premises—you are driving local economic empowerment, resulting in guards who truly care about protecting your assets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
