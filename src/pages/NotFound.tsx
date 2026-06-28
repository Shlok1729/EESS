import { Link } from 'react-router-dom';
import { Search, Home, PhoneCall } from 'lucide-react';

const NotFound = () => {
  return (
    <section className="min-h-[80vh] bg-ees-light flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="flex justify-center animate-fade-in-up">
          <div className="relative">
            <div className="absolute inset-0 bg-ees-navy/5 blur-[50px] rounded-full"></div>
            <Search className="h-32 w-32 text-ees-navy/60 relative z-10" />
          </div>
        </div>
        
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h1 className="text-9xl font-extrabold text-ees-navy tracking-tighter drop-shadow-sm">404</h1>
          <div className="w-24 h-1.5 bg-ees-red mx-auto mt-4 mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Eagle Eyes Couldn't Spot This Page</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            The page you are looking for may have been moved, renamed, or no longer exists. Let's guide you back to secure ground.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Link 
            to="/" 
            className="flex items-center gap-2 bg-ees-red hover:bg-red-700 text-white px-8 py-3.5 rounded-md font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
          >
            <Home className="h-5 w-5" /> Return to Homepage
          </Link>
          <Link 
            to="/contact"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-ees-navy border border-gray-200 px-8 py-3.5 rounded-md font-semibold transition-all shadow-sm hover:shadow w-full sm:w-auto justify-center"
          >
            <PhoneCall className="h-5 w-5" /> Contact Our Team
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
