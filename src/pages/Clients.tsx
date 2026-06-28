import { Plane, Activity, Factory, GraduationCap, Tent, CheckCircle2 } from 'lucide-react';
import TestimonialsCarousel from '../components/Testimonials';

const Clients = () => {
  const clientCategories = [
    {
      sector: "Aviation & Government",
      icon: <Plane className="h-8 w-8 text-white" />,
      description: "Securing high-priority infrastructure and government facilities.",
      clients: ["Moradabad Airport"]
    },
    {
      sector: "Healthcare & Medical",
      icon: <Activity className="h-8 w-8 text-white" />,
      description: "Ensuring 24/7 safety for medical professionals and patients.",
      clients: ["G.K. Hospital"]
    },
    {
      sector: "Industrial & Export",
      icon: <Factory className="h-8 w-8 text-white" />,
      description: "Protecting valuable assets, manufacturing plants, and export hubs.",
      clients: ["Tata Motors CNG", "Eastwood International Export"]
    },
    {
      sector: "Education",
      icon: <GraduationCap className="h-8 w-8 text-white" />,
      description: "Maintaining secure and peaceful environments for campuses.",
      clients: ["SDM Inter College"]
    },
    {
      sector: "Hospitality & Entertainment",
      icon: <Tent className="h-8 w-8 text-white" />,
      description: "Managing crowds and securing recreational facilities.",
      clients: ["Jungle Safari Water Park"]
    }
  ];

  return (
    <>
      <section className="py-20 lg:py-32 bg-ees-light min-h-[50vh] relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-ees-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-ees-navy/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-ees-navy mb-4">Trusted By The Best</h1>
          <div className="w-24 h-1.5 bg-ees-red mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            From critical aviation infrastructure to premier healthcare facilities, the leading organizations in Moradabad trust Eagle Eye for uncompromising security.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clientCategories.map((category, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group hover:-translate-y-2 flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-ees-navy group-hover:bg-ees-red transition-colors duration-300 p-4 rounded-xl shadow-md">
                    {category.icon}
                  </div>
                  <h3 className="text-xl font-bold text-ees-navy group-hover:text-ees-red transition-colors duration-300">
                    {category.sector}
                  </h3>
                </div>
                
                <p className="text-gray-500 text-sm mb-6 pb-6 border-b border-gray-100 flex-grow">
                  {category.description}
                </p>

                <div className="space-y-4">
                  {category.clients.map((client, cIdx) => (
                    <div 
                      key={cIdx}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2 className="h-5 w-5 text-ees-red flex-shrink-0" />
                      <span className="font-semibold text-gray-700">{client}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <TestimonialsCarousel />
    </>
  );
};

export default Clients;
