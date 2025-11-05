import React from 'react';

const ColorPaletteDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-nav-500 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">RevmoHelp</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-accent-50 transition-colors">Home</a>
              <a href="#" className="text-white hover:text-accent-50 transition-colors">About</a>
              <a href="#" className="text-white hover:text-accent-50 transition-colors">Services</a>
              <a href="#" className="text-white hover:text-accent-50 transition-colors">Contact</a>
            </nav>
            <button className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-secondary-500 mb-6">
            Modern Healthcare Solutions
          </h2>
          <p className="text-xl text-secondary-500 mb-8 max-w-2xl mx-auto">
            Accessible, professional, and user-friendly healthcare platform designed with care for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-soft">
              Get Started
            </button>
            <button className="border-2 border-primary-500 text-primary-500 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-accent-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-secondary-500 text-center mb-12">
            Why Choose Our Platform?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-highlight-50 p-8 rounded-4xl shadow-soft">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-secondary-500 mb-2">Fast & Reliable</h4>
              <p className="text-secondary-500">
                Quick access to healthcare information and professional consultations.
              </p>
            </div>
            <div className="bg-highlight-50 p-8 rounded-4xl shadow-soft">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-secondary-500 mb-2">Accessible Design</h4>
              <p className="text-secondary-500">
                WCAG AA compliant interface ensuring accessibility for all users.
              </p>
            </div>
            <div className="bg-highlight-50 p-8 rounded-4xl shadow-soft">
              <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-secondary-500 mb-2">Expert Team</h4>
              <p className="text-secondary-500">
                Connect with qualified healthcare professionals and specialists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-accent-100 rounded-4xl p-8 shadow-medium">
            <h4 className="text-2xl font-bold text-secondary-500 mb-4">
              Patient Stories
            </h4>
            <div className="space-y-4">
              <div className="border-l-4 border-primary-500 pl-4">
                <p className="text-secondary-500 italic">
                  "This platform helped me find the right specialist quickly and easily. The interface is clean and accessible."
                </p>
                <p className="text-nav-500 font-semibold mt-2">- Sarah M., Patient</p>
              </div>
              <div className="border-l-4 border-primary-500 pl-4">
                <p className="text-secondary-500 italic">
                  "As a healthcare professional, I appreciate the thoughtful design that prioritizes user experience and accessibility."
                </p>
                <p className="text-nav-500 font-semibold mt-2">- Dr. John D., Physician</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-accent-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-secondary-500 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-secondary-500 mb-8">
            Join thousands of users who trust our platform for their healthcare needs.
          </p>
          <button className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-soft">
            Sign Up Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-500 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">RevmoHelp</h5>
              <p className="text-accent-100">
                Modern healthcare solutions with accessibility at the core.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Services</h6>
              <ul className="space-y-2 text-accent-100">
                <li><a href="#" className="hover:text-white transition-colors">Consultations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Patient Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-accent-100">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Connect</h6>
              <div className="flex space-x-4">
                <a href="#" className="text-accent-100 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-accent-100 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-accent-200 mt-8 pt-8 text-center text-accent-100">
            <p>&copy; 2024 RevmoHelp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ColorPaletteDemo;