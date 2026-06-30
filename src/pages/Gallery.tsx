import { Camera, MapPin } from 'lucide-react';

const Gallery = () => {
  const images = [
    {
      src: "https://res.cloudinary.com/dhqqj1ehx/image/upload/v1782734999/887168c8-0619-4c26-8642-b8d20aefb6fe.png",
      alt: "Perimeter Security Guarding",
      client: "Tata Motors Plant",
      className: "md:col-span-2 md:row-span-2 h-[300px] md:h-[416px]"
    },
    {
      src: "https://res.cloudinary.com/dhqqj1ehx/image/upload/v1782735085/02168ad0-f6ee-4f67-ae6f-4140d81d49ca.png",
      alt: "Skilled Security Guards",
      client: "Tata Motors Plant",
      className: "md:col-span-1 md:row-span-2 h-[300px] md:h-[416px]"
    },
    {
      src: "https://res.cloudinary.com/dhqqj1ehx/image/upload/v1782735832/34bddb7a-99f6-4663-8166-09fafa5b161f.png",
      alt: "Security at Schools",
      client: "SDM School",
      className: "md:col-span-1 md:row-span-2 h-[300px] md:h-[416px]"
    },
    {
      src: "https://res.cloudinary.com/dhqqj1ehx/image/upload/v1782736118/72f8fdc1-c4cf-41e0-9519-6892a5441e66.png",
      alt: "Housekeeping and facility management",
      client: "SPS Hospital",
      className: "md:col-span-1 h-[200px]"
    },
    {
      src: "https://res.cloudinary.com/dhqqj1ehx/image/upload/v1782735284/e741d607-37bf-4a2c-98ff-b2715576d99e.png",
      alt: "Event Security & Crowd Control",
      client: "Sunburn Festival",
      className: "md:col-span-2 md:row-span-2 h-[300px] md:h-[416px]"
    },
    {
      src: "https://images.unsplash.com/photo-1621360841013-c76831f1db89?auto=format&fit=crop&q=80",
      alt: "24/7 Command Center",
      client: "Reliance Retail Hub",
      className: "md:col-span-1 h-[200px]"
    },
    {
      src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
      alt: "Commercial Building Patrol",
      client: "Marriott Hotel",
      className: "md:col-span-1 h-[200px]"
    },
    {
      src: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80",
      alt: "Executive Protection",
      client: "Global Business Summit",
      className: "md:col-span-1 md:row-span-2 h-[300px] md:h-[416px]"
    },
    {
      src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80",
      alt: "Corporate Meet Security",
      client: "Tech Mahindra HQ",
      className: "md:col-span-2 md:row-span-2 h-[300px] md:h-[416px]"
    },
    {
      src: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80",
      alt: "Night Patrol Operations",
      client: "Amazon Fulfillment Center",
      className: "md:col-span-2 md:row-span-2 h-[300px] md:h-[416px]"
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 grid-flow-dense auto-rows-min">
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
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-md border border-gray-100 z-10 transition-transform duration-300 group-hover:-translate-y-1">
                <MapPin className="h-3.5 w-3.5 text-ees-red shrink-0" />
                <span className="text-ees-navy text-xs font-bold tracking-wider uppercase">{img.client}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-ees-navy/90 via-ees-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10">
                <span className="text-white font-medium">{img.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
