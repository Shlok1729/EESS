import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Sparkles, UserCheck, Search, CheckCircle2 } from 'lucide-react';

const Services = () => {
  const services = [
    {
      id: "guarding-services",
      title: "Guarding Services",
      short: "Commercial, Industrial & Residential Protection",
      description: "Our highly trained guarding personnel form the backbone of Eagle Eye Security. Whether securing a large industrial plant, a corporate office, or a residential complex, our guards are equipped with the latest protocols to ensure zero-compromise safety. They are vetted through rigorous background checks and trained in threat detection, emergency response, and professional visitor management.",
      features: ["24/7 Perimeter Patrols", "Access Control & Logging", "Emergency Response Trained"],
      image: "https://images.unsplash.com/photo-1541888086925-ebcfb3952ba6?auto=format&fit=crop&q=80",
      icon: <Shield className="h-8 w-8 text-white" />
    },
    {
      id: "housekeeping-ifm",
      title: "Housekeeping & IFM",
      short: "Integrated Facility Management",
      description: "Security goes hand-in-hand with a well-maintained environment. We provide comprehensive housekeeping and facility management services to ensure your premises are immaculate. From deep cleaning routines to everyday maintenance, our dedicated staff use industry-standard equipment and eco-friendly products to maintain a pristine, healthy space for your employees and guests.",
      features: ["Daily Maintenance & Deep Cleaning", "Eco-Friendly Products", "Waste Management"],
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80",
      icon: <Sparkles className="h-8 w-8 text-white" />
    },
    {
      id: "bouncers-event-security",
      title: "Bouncers & Event Security",
      short: "Specialized Crowd Control & VIP Safety",
      description: "Managing large crowds requires tact, strength, and strategic planning. Our specialized event security teams and bouncers are experienced in handling high-profile events, concerts, and VIP protection. We focus on seamless crowd control, access point management, and de-escalation techniques, ensuring your event runs smoothly without any security breaches.",
      features: ["VIP Escort & Protection", "Crowd & Queue Management", "Threat De-escalation"],
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80",
      icon: <UserCheck className="h-8 w-8 text-white" />
    },
    {
      id: "investigation",
      title: "Investigation & Detection",
      short: "Discreet Corporate & Private Screening",
      description: "Knowledge is the ultimate security. We offer highly discreet corporate screening, background checks, and private investigation services to protect your business interests. Whether you are dealing with internal theft, corporate espionage, or need thorough pre-employment vetting, our expert investigators utilize advanced techniques to uncover the truth.",
      features: ["Pre-employment Vetting", "Corporate Espionage Audits", "Asset Verification"],
      image: "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?auto=format&fit=crop&q=80",
      icon: <Search className="h-8 w-8 text-white" />
    }
  ];

  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <section className="py-20 lg:py-32 bg-ees-light min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-ees-navy mb-4">Our Premium Services</h1>
          <div className="w-24 h-1.5 bg-ees-red mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            We don't just provide personnel; we provide complete peace of mind through meticulously planned security architectures and immaculate facility management.
          </p>
        </div>

        <div className="space-y-16">
          {services.map((service, index) => (
            <div 
              key={index} 
              id={service.id}
              className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} group hover:shadow-xl transition-shadow duration-300 scroll-mt-24`}
            >
              {/* Image Section */}
              <div className="lg:w-1/2 relative overflow-hidden h-80 lg:h-auto">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-ees-navy/20 group-hover:bg-transparent transition-colors duration-500"></div>
                {/* Floating Icon */}
                <div className="absolute top-6 left-6 lg:top-8 lg:left-8 bg-ees-red p-4 rounded-xl shadow-lg transform group-hover:-translate-y-1 transition-transform duration-300">
                  {service.icon}
                </div>
              </div>

              {/* Content Section */}
              <div className="lg:w-1/2 p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
                <p className="text-ees-red font-semibold tracking-wider uppercase text-sm mb-2">
                  {service.short}
                </p>
                <h2 className="text-3xl font-bold text-ees-navy mb-6">
                  {service.title}
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                  {service.description}
                </p>
                
                <div className="space-y-3">
                  {service.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-ees-red flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
