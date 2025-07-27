// src/components/ui/EnhancedChatBubble.js
'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Phone, 
  PhoneCall, 
  Loader, 
  CheckCircle, 
  XCircle,
  Sparkles,
  Bot,
  Send,
  Mic,
  MicOff
} from 'lucide-react';
import { ElevenLabsService } from '@/services/elevenlabs';

export default function EnhancedChatBubble({ 
  phoneNumber = "+917019316634",
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI teaching assistant. I can help you with creating content, lesson planning, and answering teaching questions. Would you like to start with a voice call?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleCall = async () => {
    setCallStatus('calling');
    setMessage('Initiating call...');

    // Add call message to chat
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      content: 'Initiating AI voice call...',
      timestamp: new Date()
    }]);

    try {
      const result = await ElevenLabsService.makeOutboundCall(phoneNumber);
      
      if (result.success) {
        setCallStatus('success');
        setMessage('Call initiated successfully!');
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          content: '✅ Voice call initiated! You should receive a call shortly.',
          timestamp: new Date()
        }]);
        setTimeout(() => {
          setCallStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setCallStatus('error');
        setMessage(`Call failed: ${result.error}`);
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          content: `❌ Call failed: ${result.error}`,
          timestamp: new Date()
        }]);
        setTimeout(() => {
          setCallStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setCallStatus('error');
      setMessage('Failed to initiate call');
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        content: '❌ Failed to initiate call. Please try again.',
        timestamp: new Date()
      }]);
      setTimeout(() => {
        setCallStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }]);

    // Clear input
    setInputValue('');

    // Simulate AI response (you can integrate with your actual AI service)
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: "I understand you need help with that. For the best assistance, I recommend starting a voice call where I can provide detailed explanations and walk you through the process step by step. Would you like me to call you?",
        timestamp: new Date()
      }]);
    }, 1000);
  };

  const getCallIcon = () => {
    switch (callStatus) {
      case 'calling':
        return <Loader size={16} className="animate-spin" />;
      case 'success':
        return <CheckCircle size={16} />;
      case 'error':
        return <XCircle size={16} />;
      default:
        return <PhoneCall size={16} />;
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Sahayak AI</h3>
                    <div className="flex items-center gap-1 text-xs opacity-90">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Online
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-xl p-3 ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : msg.type === 'system'
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-white opacity-75' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <button
                onClick={handleCall}
                disabled={callStatus === 'calling'}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-semibold transition-all duration-300 ${
                  callStatus === 'calling' ? 'bg-blue-500' :
                  callStatus === 'success' ? 'bg-green-500' :
                  callStatus === 'error' ? 'bg-red-500' :
                  'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
              >
                {getCallIcon()}
                {callStatus === 'calling' ? 'Calling...' : 
                 callStatus === 'success' ? 'Call Initiated' :
                 callStatus === 'error' ? 'Call Failed' :
                 'Start Voice Call'}
              </button>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about teaching..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Bubble Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group relative overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle size={24} />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {!isOpen && (
        <motion.div
          className="absolute inset-0 border-2 border-blue-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
}