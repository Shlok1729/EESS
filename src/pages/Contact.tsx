import { MapPin, Phone, Mail } from 'lucide-react';

const WHATSAPP_NUMBER = '919557765998';

const Contact = () => {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('fullName') as string;
    const phone = formData.get('phoneNumber') as string;
    const service = formData.get('serviceRequired') as string;

    const message =
      `Hello Eagle Eye Security! 🛡️\n\nI would like to request a free quote.\n\n*Name:* ${name}\n*Phone:* ${phone}\n*Service Required:* ${service}\n\nPlease get in touch with me.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };
  return (
    <section className="py-12 lg:py-24 bg-white min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-ees-navy mb-4">Contact Us</h1>
          <div className="w-20 h-1.5 bg-ees-red mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Get in touch with us to discuss your security and facility management requirements.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20">
          <div className="space-y-6 bg-ees-light p-6 sm:p-8 lg:p-10 rounded-2xl border border-gray-100">
            <h2 className="text-2xl font-bold text-ees-navy mb-6">Reach Out Directly</h2>

            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-4 rounded-full text-ees-red mt-1">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-ees-navy text-xl mb-2">Office Address</h4>
                <p className="text-gray-600 leading-relaxed">
                  Mandi Samiti Road, Majhola,<br />
                  Moradabad, Uttar Pradesh 244001
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-4 rounded-full text-ees-red mt-1">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-ees-navy text-xl mb-2">Phone</h4>
                <p className="text-gray-600">+91-8192005876</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-red-50 p-4 rounded-full text-ees-red mt-1">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-ees-navy text-xl mb-2">Email</h4>
                <p className="text-gray-600">admin.eagleeye@gmail.com</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 mt-8">
              <p className="text-lg">
                <span className="font-bold text-ees-navy">Director:</span> Sunil Kumar Gupta
              </p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-ees-navy mb-6">Request a Free Quote</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ees-red focus:border-ees-red outline-none transition-all"
                  placeholder="Rahul Kapoor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ees-red focus:border-ees-red outline-none transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Required</label>
                <select
                  name="serviceRequired"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ees-red focus:border-ees-red outline-none transition-all bg-white"
                >
                  <option>Guarding Services</option>
                  <option>Housekeeping &amp; IFM</option>
                  <option>Bouncers &amp; Event Security</option>
                  <option>Investigation</option>
                  <option>Other</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-ees-red hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-colors text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.532 5.854L.057 23.6a.5.5 0 0 0 .61.611l5.79-1.474A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.9 9.9 0 0 1-5.031-1.369l-.361-.214-3.735.951.984-3.637-.235-.374A9.861 9.861 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/></svg>
                Send via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
