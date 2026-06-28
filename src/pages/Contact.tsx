import { MapPin, Phone, Mail } from 'lucide-react';

const Contact = () => {
  return (
    <section className="py-20 lg:py-32 bg-white min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-ees-navy mb-4">Contact Us</h1>
          <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Get in touch with us to discuss your security and facility management requirements.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-8 bg-ees-light p-10 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-ees-navy mb-6">Reach Out Directly</h2>

            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-4 rounded-full text-ees-red mt-1">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-ees-navy text-xl mb-2">Office Address</h4>
                <p className="text-gray-600 leading-relaxed text-lg">
                  House No-204, A-block, Sec-13,<br />
                  Landmark Power House,<br />
                  New Moradabad 244001 U.P
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-4 rounded-full text-ees-red mt-1">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-ees-navy text-xl mb-2">Phone</h4>
                <p className="text-gray-600 text-lg">+91-8192005876</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-4 rounded-full text-ees-red mt-1">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-ees-navy text-xl mb-2">Email</h4>
                <p className="text-gray-600 text-lg">admin.eagleeyesecurity@gmail.com</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 mt-8">
              <p className="text-lg">
                <span className="font-bold text-ees-navy">Director:</span> Sunil Kumar Gupta
              </p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-ees-navy mb-6">Request a Free Quote</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ees-red focus:border-ees-red outline-none transition-all" placeholder="Rahul Kapoor" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ees-red focus:border-ees-red outline-none transition-all" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Required</label>
                <select className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ees-red focus:border-ees-red outline-none transition-all bg-white">
                  <option>Guarding Services</option>
                  <option>Housekeeping & IFM</option>
                  <option>Bouncers & Event Security</option>
                  <option>Investigation</option>
                  <option>Other</option>
                </select>
              </div>
              <button type="button" className="w-full bg-ees-red hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors text-lg shadow-md hover:shadow-lg">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
