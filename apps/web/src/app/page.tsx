import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">M-Clinic</div>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#services" className="hover:text-primary transition">Services</a>
            <a href="#about" className="hover:text-primary transition">About Us</a>
            <a href="#contact" className="hover:text-primary transition">Contact</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2.5 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Provider Login
            </Link>
            <button className="px-5 py-2.5 rounded-full bg-primary text-black text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20">
              Download App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-brand-blue text-sm font-bold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
            </span>
            Available Countrywide in Kenya
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
            Healthcare at your <span className="text-primary block mt-2">Doorstep.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            We bring professional, licensed medical care directly to you. Experience personalized, accessible, and affordable healthcare in the comfort of your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-full bg-primary text-black font-bold text-lg hover:opacity-90 transition shadow-xl shadow-primary/25">
              Book a Visit
            </button>
            <button className="px-8 py-4 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50 dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 dark:text-gray-400">Comprehensive care tailored to your needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              title="Medical Home Visits"
              desc="Doctors and nurses come to you for consultations, checkups, and treatment."
              icon="🏠"
            />
            <ServiceCard
              title="Virtual Consultations"
              desc="Connect with specialists instantly via our secure video platform."
              icon="💻"
            />
            <ServiceCard
              title="Medical Evacuation"
              desc="Rapid response and transport for critical medical emergencies."
              icon="🚑"
            />
            <ServiceCard
              title="Caregiver Services"
              desc="Professional home support for elderly and chronic care patients."
              icon="🤝"
            />
            <ServiceCard
              title="Pharmarcy Delivery"
              desc="Prescribed medications delivered quickly to your doorstep."
              icon="💊"
            />
            <ServiceCard
              title="Lab Tests"
              desc="Sample collection at home with digital results sharing."
              icon="🔬"
            />
          </div>
        </div>
      </section>

      {/* App Download / CTA */}
      <section className="py-24 px-6 bg-brand-blue text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Get the M-Clinic App</h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl">
            Download our app to manage appointments, view medical records, and consult with doctors anytime, anywhere.
          </p>
          <div className="flex gap-4">
            <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:opacity-80 transition">
              <div className="text-left">
                <div className="text-[10px] uppercase">Download on the</div>
                <div className="text-lg font-bold leading-none">App Store</div>
              </div>
            </button>
            <button className="bg-black text-white px-6 py-3 rounded-xl flex items-center gap-3 hover:opacity-80 transition">
              <div className="text-left">
                <div className="text-[10px] uppercase">Get it on</div>
                <div className="text-lg font-bold leading-none">Google Play</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-16 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold text-white mb-4">M-Clinic</div>
            <p className="max-w-sm mb-6">
              Transforming healthcare in Kenya through innovation, compassion, and accessibility.
              Reliable medical care, always open.
            </p>
            <div className="flex gap-4">
              {/* Social placeholders */}
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">FB</div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">TW</div>
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">IG</div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li>Applewood Adams, Ngong Rd</li>
              <li>Suite 506, Nairobi, Kenya</li>
              <li className="text-primary">+254 700 448 448</li>
              <li>Info@Mclinic.co.ke</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} M-Clinic Kenya. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="bg-white dark:bg-[#121212] p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold mb-3 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  )
}
