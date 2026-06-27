import { Shield, UserCheck } from 'lucide-react';

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
      </div>
    </section>
  );
};

export default About;
