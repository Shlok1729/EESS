import { Shield, Sparkles, UserCheck, Search } from 'lucide-react';

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
    <section className="py-20 lg:py-32 bg-ees-light min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-ees-navy mb-4">Our Core Services</h1>
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

export default Services;
