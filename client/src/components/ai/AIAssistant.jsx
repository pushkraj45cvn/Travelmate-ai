import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiTrash2, FiChevronDown, FiCpu } from 'react-icons/fi';
import api from '../../services/api';

const SUGGESTIONS = [
  'What should I pack for a beach trip?',
  'Give me a 5-day Paris itinerary',
  'How much should I budget for Japan?',
  'Tips for traveling to Thailand',
  'Best time to visit Bali',
  'What to eat in Italy?',
];

const AiAssistant = ({ tripContext }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    setShowSuggestions(false);

    // Add user message to UI
    const userMsg = { role: 'user', content: messageText.trim(), _id: `user-${Date.now()}` };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: messageText.trim(),
        tripId: tripContext?.tripId || null,
        context: tripContext?.context || null,
      });

      const aiMsg = {
        role: 'assistant',
        content: res.data.data.reply,
        _id: `ai-${Date.now()}`,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setChatId(res.data.data._id);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble connecting. Please try again! 😊',
          _id: `ai-error-${Date.now()}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatId(null);
    setShowSuggestions(true);
  };

  const formatMessage = (content) => {
    // Convert markdown-like formatting to JSX
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-sm mb-1">{line.replace(/\*\*/g, '')}</p>;
      }
      // Bullet points
      if (line.startsWith('• ')) {
        return <p key={i} className="text-sm pl-3 flex items-start gap-1"><span className="text-primary-400">•</span><span>{line.substring(2)}</span></p>;
      }
      // Emoji lines
      if (line.match(/^[😊🌍🧳💰🗺️🍽️🚗🏨🛡️🌤️🌟❄️🏖️🏙️🚄🚆🌸☀️🍂]/)) {
        return <p key={i} className="text-sm">{line}</p>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm">{line}</p>;
    });
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 transition-all duration-200 flex items-center justify-center"
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[560px] max-h-[calc(100vh-10rem)] bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <FiCpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">TravelMate AI</p>
                  <p className="text-[10px] text-white/70">Your travel planning assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  title="New chat"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors lg:hidden"
                >
                  <FiChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-dark-900/50">
              {messages.length === 0 && !loading && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center mx-auto mb-4">
                    <FiCpu className="w-8 h-8 text-primary-500" />
                  </div>
                  <p className="text-sm font-semibold text-dark-800 dark:text-dark-200 mb-1">
                    How can I help you plan?
                  </p>
                  <p className="text-xs text-dark-400 mb-4">
                    Ask me anything about travel!
                  </p>

                  {showSuggestions && (
                    <div className="space-y-2 px-2">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(s)}
                          className="w-full text-left text-xs px-3 py-2 rounded-xl bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-500 text-dark-600 dark:text-dark-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                        >
                          💬 {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                        : 'bg-white dark:bg-dark-700 border border-gray-100 dark:border-dark-600 text-dark-800 dark:text-dark-200'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="text-sm leading-relaxed space-y-0.5">
                        {formatMessage(msg.content)}
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-dark-700 border border-gray-100 dark:border-dark-600 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 flex-shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about travel..."
                  className="input-field flex-1 text-sm py-2.5"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-dark-400 text-center mt-1.5">
                Powered by TravelMate AI • Smart Travel Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistant;
