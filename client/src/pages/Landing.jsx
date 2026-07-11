import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiStar, FiCheck, FiMail, FiPhone, FiMapPin, FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const Landing = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSending, setContactSending] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSending(true);
    try {
      const res = await api.post('/contact', {
        name: contactName,
        email: contactEmail,
        message: contactMessage,
      });
      toast.success(res.data.message || 'Message sent successfully!');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setContactSending(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    api.get('/trips/reviews/featured')
      .then(res => setReviews(res.data.data || []))
      .catch(() => {});
  }, []);

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
          {reviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.slice(0, 6).map((review, idx) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-8"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }, (_, i) => (
                      <FiStar key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  {review.title && (
                    <p className="font-semibold text-sm mb-2 text-dark-800 dark:text-dark-200">{review.title}</p>
                  )}
                  <p className="text-dark-600 dark:text-dark-400 mb-6 italic">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                      {review.avatar
                        ? <img src={review.avatar} className="w-full h-full rounded-full object-cover" />
                        : review.name?.charAt(0) || 'T'
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{review.name}</p>
                      <p className="text-xs text-dark-500">{review.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FiMessageCircle className="w-12 h-12 text-dark-300 mx-auto mb-4" />
              <p className="text-dark-400">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
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
              {
                name: 'Free', price: '$0', period: '',
                tagline: 'Perfect for getting started',
                accent: 'from-slate-500 to-gray-500',
                btnStyle: 'border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                icon: '🌱',
                features: [
                  { text: 'Up to 3 Trips', highlight: false },
                  { text: 'Basic Itinerary', highlight: false },
                  { text: 'Expense Tracking', highlight: false },
                  { text: 'Community Support', highlight: false },
                ],
                missingFeatures: ['Destinations', 'Wishlist', 'Invitations'],
                popular: false,
              },
              {
                name: 'Pro', price: '$800', period: '/month',
                tagline: 'Best for avid travelers',
                accent: 'from-primary-500 to-accent-500',
                btnStyle: 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-lg hover:shadow-primary-500/25',
                icon: '🚀',
                features: [
                  { text: 'Unlimited Trips', highlight: true },
                  { text: 'AI-Powered Itinerary', highlight: false },
                  { text: 'Destinations Explorer', highlight: true },
                  { text: 'Wishlist', highlight: true },
                  { text: 'Invitations & Sharing', highlight: true },
                  { text: 'Group Collaboration', highlight: false },
                  { text: 'Priority Support', highlight: false },
                ],
                popular: true,
              },
              {
                name: 'Team', price: '$2500', period: '/month',
                tagline: 'For groups & organizations',
                accent: 'from-violet-500 to-purple-600',
                btnStyle: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/25',
                icon: '👥',
                features: [
                  { text: 'Everything in Pro', highlight: true },
                  { text: '4 Team Members Included', highlight: true },
                  { text: 'Per-Person Data & Settings', highlight: false },
                  { text: 'Team Dashboard', highlight: false },
                  { text: 'Admin Controls', highlight: false },
                  { text: 'API Access', highlight: false },
                  { text: 'Custom Integrations', highlight: false },
                ],
                popular: false,
              },
            ].map((plan, idx) => {
              const isExpanded = expandedPlan === plan.name;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className={`card p-8 cursor-pointer select-none relative overflow-hidden ${
                    plan.popular ? 'ring-2 ring-primary-500 shadow-xl shadow-primary-500/10' : ''
                  }`}
                  onClick={() => setExpandedPlan(isExpanded ? null : plan.name)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${plan.accent} opacity-[0.03] pointer-events-none`} />

                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-semibold rounded-full z-10">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{plan.icon}</span>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronDown className="w-5 h-5 text-dark-400" />
                    </motion.div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-dark-500 dark:text-dark-400">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-dark-400 mb-4">{plan.tagline}</p>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className={`h-px bg-gradient-to-r ${plan.accent} mb-5 opacity-30`} />

                        <ul className="space-y-3 mb-5">
                          {plan.features.map((f) => (
                            <li key={f.text} className={`flex items-center gap-3 text-sm ${
                              f.highlight
                                ? 'text-dark-900 dark:text-white font-semibold'
                                : 'text-dark-600 dark:text-dark-400'
                            }`}>
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                f.highlight
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : plan.popular
                                    ? 'bg-primary-100 dark:bg-primary-900/30'
                                    : 'bg-slate-100 dark:bg-slate-800'
                              }`}>
                                <FiCheck className={`w-3 h-3 ${
                                  f.highlight ? 'text-green-600' : 'text-green-500'
                                }`} />
                              </span>
                              {f.text}
                              {f.highlight && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  plan.name === 'Pro'
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                    : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600'
                                }`}>Popular</span>
                              )}
                            </li>
                          ))}
                        </ul>

                        {plan.missingFeatures && plan.missingFeatures.length > 0 && (
                          <div className="mb-6">
                            <p className="text-xs text-dark-400 font-medium mb-2 uppercase tracking-wide">Not included:</p>
                            <ul className="space-y-2">
                              {plan.missingFeatures.map((f) => (
                                <li key={f} className="flex items-center gap-3 text-sm text-dark-400 dark:text-dark-500">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center flex-shrink-0">
                                    <span className="text-slate-400 text-xs">✕</span>
                                  </span>
                                  {f}
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium">Upgrade</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/auth/register?plan=${plan.name}`);
                          }}
                          className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${plan.btnStyle}`}
                        >
                          {plan.name === 'Free' ? 'Start Free' : `Subscribe to ${plan.name}`}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isExpanded && (
                    <p className="text-xs text-primary-500 font-medium mt-3">Click to see features →</p>
                  )}
                </motion.div>
              );
            })}
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
                { icon: <FiMail className="w-6 h-6" />, label: 'Email', value: 'pushkicvn2@gmail.com' },
                { icon: <FiPhone className="w-6 h-6" />, label: 'Phone', value: '+91 9156686161' },
                { icon: <FiMapPin className="w-6 h-6" />, label: 'Location', value: 'Pune, Maharashtra' },
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
              <form onSubmit={handleContactSubmit} className="grid md:grid-cols-2 gap-6">
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your Name" required className="input-field" />
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Your Email" required className="input-field" />
                <div className="md:col-span-2">
                  <textarea rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Your Message" required className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" disabled={contactSending} className="btn-primary w-full">{contactSending ? 'Sending...' : 'Send Message'}</button>
                </div>
              </form>
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
