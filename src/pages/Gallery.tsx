import { Camera } from 'lucide-react';

const Gallery = () => {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1541888086925-ebcfb3952ba6?auto=format&fit=crop&q=80",
      alt: "Security Guards Monitoring",
      className: "md:col-span-2 md:row-span-2 h-[400px] md:h-[416px]"
    },
    {
      src: "https://images.unsplash.com/photo-1585250064295-a4bfa3516584?auto=format&fit=crop&q=80",
      alt: "CCTV Surveillance",
      className: "h-[200px]"
    },
    {
      src: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&q=80",
      alt: "Corporate Security",
      className: "h-[200px]"
    },
    {
      src: "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?auto=format&fit=crop&q=80",
      alt: "Access Control",
      className: "h-[200px]"
    },
    {
      src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80",
      alt: "Event Security",
      className: "md:col-span-2 h-[200px]"
    },
    {
      src: "https://images.unsplash.com/photo-1621360841013-c76831f1db89?auto=format&fit=crop&q=80",
      alt: "Command Center",
      className: "h-[200px]"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Camera className="h-8 w-8 text-ees-red" />
            <h1 className="text-4xl md:text-5xl font-bold text-ees-navy">Media Gallery</h1>
          </div>
          <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            A glimpse into our professional security deployments, training sessions, and events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min">
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className={`relative group overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 ${img.className || 'h-[200px]'}`}
            >
              <img 
                src={img.src} 
                alt={img.alt} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ees-navy/90 via-ees-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-white font-semibold text-lg">{img.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
