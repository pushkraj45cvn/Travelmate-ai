import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSend, FiSmile } from 'react-icons/fi';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import { useSelector } from 'react-redux';
import { formatDateTime } from '../utils/formatters';

const Chat = () => {
  const { id: tripId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();
  const { user } = useSelector((state) => state.auth);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChat();
  }, [tripId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket && chat) {
      socket.emit('join-trip', tripId);

      socket.on('new-message', (message) => {
        if (message.chat === chat._id || message.chat?._id === chat._id) {
          setMessages((prev) => [...prev, message]);
        }
      });

      return () => {
        socket.emit('leave-trip', tripId);
        socket.off('new-message');
      };
    }
  }, [socket, chat, tripId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    try {
      const chatData = await api.get(`/trips/${tripId}/chat`);
      setChat(chatData.data.data);
      const msgRes = await api.get(`/trips/${chatData.data.data._id}/messages?limit=50`);
      setMessages(msgRes.data.data || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (socket && isConnected) {
      socket.emit('send-message', {
        chatId: chat._id,
        content: newMessage,
      });
    } else {
      // Fallback to REST
      try {
        const res = await api.post(`/trips/${chat._id}/messages`, { content: newMessage });
        setMessages((prev) => [...prev, res.data.data]);
      } catch (err) {}
    }
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <Link to={`/trips/${tripId}`} className="flex items-center gap-2 text-dark-500 dark:text-dark-400 hover:text-primary-500 mb-4 text-sm">
        <FiArrowLeft className="w-4 h-4" /> Back to Trip
      </Link>

      <div className="card flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-dark-700 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="font-semibold">Trip Chat</span>
          <span className="text-xs text-dark-400">{isConnected ? 'Connected' : 'Offline'}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => {
            const isOwn = msg.sender?._id === user?.id || msg.sender === user?.id;
            return (
              <motion.div key={msg._id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${isOwn ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-dark-700'} rounded-2xl px-4 py-2.5`}>
                  {!isOwn && <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender?.name}</p>}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-dark-400'}`}>{formatDateTime(msg.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <button type="button" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <FiSmile className="w-5 h-5 text-dark-400" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="input-field flex-1"
              placeholder="Type a message..."
            />
            <button type="submit" disabled={!newMessage.trim()} className="btn-primary !p-3">
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
