import { Quote } from 'lucide-react';

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
    <>
      <section className="py-20 lg:py-32 bg-white min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-ees-navy mb-4">Trusted By The Best</h1>
          <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We take pride in providing top-tier security for these esteemed organizations.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 items-center justify-items-center">
            {clients.map((client, index) => (
              <div 
                key={index}
                className="w-full bg-ees-light py-10 px-4 rounded-lg text-center font-bold text-gray-500 hover:text-ees-navy hover:bg-gray-100 transition-colors cursor-default text-lg shadow-sm border border-gray-100"
              >
                {client}
              </div>
            ))}
          </div>
        </div>
      </section>

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
          </div>
        </div>
      </section>
    </>
  );
};

export default Clients;
