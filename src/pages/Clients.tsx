import TestimonialsCarousel from '../components/Testimonials';

const Clients = () => {
  const clientCategories = [
    {
      sector: "Aviation & Government",
      clients: ["Moradabad Airport"]
    },
    {
      sector: "Healthcare & Medical",
      clients: ["G.K. Hospital"]
    },
    {
      sector: "Industrial & Export",
      clients: ["Tata Motors CNG", "Eastwood International Export"]
    },
    {
      sector: "Education",
      clients: ["SDM Inter College"]
    },
    {
      sector: "Hospitality & Entertainment",
      clients: ["Jungle Safari Water Park"]
    }
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
          {clientCategories.map((category, idx) => (
            <div key={idx}>
              <h3 className="text-2xl font-bold text-ees-navy mb-6 border-b border-gray-200 pb-2">
                {category.sector}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.clients.map((client, cIdx) => (
                  <div
                    key={cIdx}
                    className="w-full bg-ees-light py-8 px-4 rounded-lg text-center font-bold text-gray-600 hover:text-ees-navy hover:bg-gray-100 transition-colors cursor-default text-lg shadow-sm border border-gray-100"
                  >
                    {client}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <TestimonialsCarousel />


    </>
  );
};

export default Clients;
