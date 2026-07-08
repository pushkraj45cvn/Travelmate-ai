import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiCheck, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const Landing = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 dark:border-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-primary-500/25">
                ✈️
              </div>
              <span className="text-xl font-bold gradient-text">TravelMate AI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo('features')} className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors">Features</button>
              <button onClick={() => scrollTo('destinations')} className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors">Destinations</button>
              <button onClick={() => scrollTo('pricing')} className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors">Pricing</button>
              <button onClick={() => scrollTo('faq')} className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-500 transition-colors">FAQ</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                {isDarkMode ? <FiSun className="w-5 h-5 text-yellow-500" /> : <FiMoon className="w-5 h-5 text-dark-500" />}
              </button>
              <Link to="/auth/login" className="btn-secondary text-sm !py-2 !px-4">Sign In</Link>
              <Link to="/auth/register" className="btn-primary text-sm !py-2 !px-4">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <FiStar className="w-4 h-4" /> AI-Powered Travel Planning
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Plan Your Perfect{' '}
                <span className="gradient-text">Trip</span>
                <br />
                With AI Assistance
              </h1>
              <p className="text-lg md:text-xl text-dark-600 dark:text-dark-400 mb-10 max-w-2xl mx-auto">
                TravelMate AI helps you create detailed itineraries, track expenses, 
                collaborate with travel buddies, and explore destinations — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth/register" className="btn-primary text-lg px-8 py-4">
                  Start Planning Free
                  <FiArrowRight className="ml-2 inline-block" />
                </Link>
                <button onClick={() => scrollTo('features')} className="btn-secondary text-lg px-8 py-4">
                  Explore Features
                </button>
              </div>
            </motion.div>

            {/* Hero Image / Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-16 relative"
            >
              <div className="glass-card p-2 max-w-5xl mx-auto">
                <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary-500 to-accent-500 p-1">
                  <div className="bg-white dark:bg-dark-800 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-4">
                        {['Paris', 'Tokyo', 'Bali'].map((city) => (
                          <div key={city} className="rounded-xl overflow-hidden">
                            <div className="h-32 bg-gradient-to-br from-primary-200 to-accent-200 dark:from-primary-900 dark:to-accent-900 flex items-center justify-center text-4xl">
                              {city === 'Paris' ? '🗼' : city === 'Tokyo' ? '🗾' : '🏝️'}
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-dark-700">
                              <p className="text-sm font-semibold">{city}</p>
                              <p className="text-xs text-dark-500">{city === 'Paris' ? 'France' : city === 'Tokyo' ? 'Japan' : 'Indonesia'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Travel Smart</span>
            </h2>
            <p className="text-lg text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
              Powerful tools to plan, organize, and enjoy your trips with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🗺️', title: 'Smart Itinerary', desc: 'AI-powered day-by-day planning with drag-and-drop, time management, and activity suggestions.' },
              { icon: '💰', title: 'Expense Tracking', desc: 'Track every dollar with categories, split bills, and get real-time budget insights with charts.' },
              { icon: '👥', title: 'Group Collaboration', desc: 'Invite friends, assign roles, chat in real-time, and plan together seamlessly.' },
              { icon: '📦', title: 'Packing Lists', desc: 'Smart packing lists by category with progress tracking and priority levels.' },
              { icon: '📍', title: 'Interactive Maps', desc: 'Visualize destinations, routes, and nearby attractions with OpenStreetMap integration.' },
              { icon: '🔔', title: 'Smart Notifications', desc: 'Real-time alerts for invites, expenses, updates, and trip reminders.' },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card p-8 hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-dark-500 dark:text-dark-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section id="destinations" className="py-20 bg-gray-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Explore <span className="gradient-text">Popular Destinations</span>
            </h2>
            <p className="text-lg text-dark-500 dark:text-dark-400">Discover amazing places around the world.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Paris', country: 'France', icon: '🗼', gradient: 'from-blue-400 to-purple-500' },
              { name: 'Tokyo', country: 'Japan', icon: '🗾', gradient: 'from-red-400 to-orange-500' },
              { name: 'Bali', country: 'Indonesia', icon: '🏝️', gradient: 'from-green-400 to-teal-500' },
              { name: 'Dubai', country: 'UAE', icon: '🏙️', gradient: 'from-yellow-400 to-orange-500' },
            ].map((dest, idx) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className={`rounded-2xl overflow-hidden bg-gradient-to-br ${dest.gradient} p-1`}>
                  <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 h-full">
                    <div className="text-5xl mb-4">{dest.icon}</div>
                    <h3 className="text-xl font-bold mb-1">{dest.name}</h3>
                    <p className="text-dark-500 dark:text-dark-400 text-sm">{dest.country}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by <span className="gradient-text">Travelers</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Frequent Traveler', text: 'TravelMate AI completely transformed how I plan trips. The itinerary planner is incredible!', rating: 5 },
              { name: 'Mike Chen', role: 'Backpacker', text: 'The expense splitting feature is a lifesaver for group trips. No more awkward calculations!', rating: 5 },
              { name: 'Emma Williams', role: 'Digital Nomad', text: 'I use it for all my travels. The packing lists and document storage are game-changers.', rating: 5 },
            ].map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <FiStar key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-dark-600 dark:text-dark-400 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-dark-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple <span className="gradient-text">Pricing</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Free', price: '$0', features: ['3 Trips', 'Basic Itinerary', 'Expense Tracking', 'Community Support'], popular: false },
              { name: 'Pro', price: '$9', period: '/month', features: ['Unlimited Trips', 'AI Itinerary', 'Advanced Analytics', 'Priority Support', 'Group Collaboration'], popular: true },
              { name: 'Team', price: '$19', period: '/month', features: ['Everything in Pro', 'Team Dashboard', 'Admin Controls', 'API Access', 'Custom Integrations'], popular: false },
            ].map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`card p-8 ${plan.popular ? 'ring-2 ring-primary-500 relative' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-dark-500 dark:text-dark-400">{plan.period}</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-dark-600 dark:text-dark-400">
                      <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'Is TravelMate AI free to use?', a: 'Yes! We offer a generous free tier with up to 3 trips. Upgrade to Pro for unlimited trips and advanced features.' },
              { q: 'Can I collaborate with friends?', a: 'Absolutely! You can invite friends to your trips, assign roles, share expenses, and chat in real-time.' },
              { q: 'How does expense splitting work?', a: 'Our Splitwise-like system supports equal, percentage, and custom splits. It automatically calculates who owes whom.' },
              { q: 'Is my data secure?', a: 'Yes. We use JWT authentication, bcrypt encryption, and follow industry best practices for data security.' },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-dark-500 dark:text-dark-400 text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 dark:bg-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Get In <span className="gradient-text">Touch</span>
              </h2>
              <p className="text-dark-500 dark:text-dark-400">Have questions? We'd love to hear from you.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: <FiMail className="w-6 h-6" />, label: 'Email', value: 'hello@travelmate-ai.com' },
                { icon: <FiPhone className="w-6 h-6" />, label: 'Phone', value: '+1 (555) 123-4567' },
                { icon: <FiMapPin className="w-6 h-6" />, label: 'Location', value: 'San Francisco, CA' },
              ].map((item, idx) => (
                <div key={idx} className="card p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 mx-auto mb-3">
                    {item.icon}
                  </div>
                  <p className="text-sm text-dark-500 dark:text-dark-400">{item.label}</p>
                  <p className="font-semibold text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="card p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <input type="text" placeholder="Your Name" className="input-field" />
                <input type="email" placeholder="Your Email" className="input-field" />
                <div className="md:col-span-2">
                  <textarea rows={4} placeholder="Your Message" className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <button className="btn-primary w-full">Send Message</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✈️</span>
                <span className="text-lg font-bold gradient-text">TravelMate AI</span>
              </div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Smart travel planning powered by AI.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'FAQ', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-dark-500 dark:text-dark-400 hover:text-primary-500 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-dark-700 text-center">
            <p className="text-sm text-dark-500 dark:text-dark-400">
              &copy; {new Date().getFullYear()} TravelMate AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
