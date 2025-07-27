// src/components/ui/ChatBubble.js
'use client';
import { useState } from 'react';
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
  Bot
} from 'lucide-react';
import { ElevenLabsService } from '@/services/elevenlabs';

export default function ChatBubble({ 
  phoneNumber = "+917019316634",
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleCall = async () => {
    setCallStatus('calling');
    setMessage('Initiating call...');

    try {
      const result = await ElevenLabsService.makeOutboundCall(phoneNumber);
      
      if (result.success) {
        setCallStatus('success');
        setMessage('Call initiated successfully!');
        setTimeout(() => {
          setCallStatus('idle');
          setMessage('');
        }, 3000);
      } else {
        setCallStatus('error');
        setMessage(`Call failed: ${result.error}`);
        setTimeout(() => {
          setCallStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setCallStatus('error');
      setMessage('Failed to initiate call');
      setTimeout(() => {
        setCallStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  const toggleChat = () => {
    console.log('Chat bubble clicked!'); // Debug log
    setIsOpen(!isOpen);
  };

  const getCallIcon = () => {
    switch (callStatus) {
      case 'calling':
        return <Loader size={18} className="animate-spin" />;
      case 'success':
        return <CheckCircle size={18} />;
      case 'error':
        return <XCircle size={18} />;
      default:
        return <PhoneCall size={18} />;
    }
  };

  const getCallButtonText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Calling...';
      case 'success':
        return 'Call Initiated';
      case 'error':
        return 'Call Failed';
      default:
        return 'Start Voice Call';
    }
  };

  const getCallButtonStyle = () => {
    switch (callStatus) {
      case 'calling':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700';
    }
  };

  return (
    <>
      {/* Chat Window - Positioned separately to avoid z-index issues */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-20 right-6 z-[9999]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sahayak AI Assistant</h3>
                      <p className="text-xs opacity-90">Always here to help</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleChat}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {/* Welcome Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-700 mb-2">
                        Hi! I'm your AI teaching assistant. I can help you with:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Creating educational content</li>
                        <li>• Lesson planning assistance</li>
                        <li>• Teaching strategies</li>
                        <li>• Instant concept explanations</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>

                {/* Call Option */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Phone size={16} className="text-green-600" />
                    <h4 className="font-semibold text-green-800 text-sm">Voice Assistant</h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Get instant help through AI voice call. Perfect for quick questions and explanations!
                  </p>
                  
                  <button
                    onClick={handleCall}
                    disabled={callStatus === 'calling'}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-semibold text-sm transition-all duration-300 ${getCallButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg`}
                  >
                    {getCallIcon()}
                    {getCallButtonText()}
                  </button>

                  {message && (
                    <motion.p 
                      className={`text-xs mt-2 text-center ${
                        callStatus === 'success' ? 'text-green-600' : 
                        callStatus === 'error' ? 'text-red-600' : 
                        'text-blue-600'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {message}
                    </motion.p>
                  )}
                </motion.div>

                {/* Quick Tips */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                >
                  <h4 className="font-semibold text-gray-800 text-sm mb-2">💡 Quick Tip</h4>
                  <p className="text-xs text-gray-600">
                    Try asking: "Create a story about water cycle for grade 5" or "Help me plan a math lesson on fractions"
                  </p>
                </motion.div>
              </div>

              {/* Chat Footer */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">
                  Available 24/7 • Powered by Sahayak AI
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Bubble Button - Separate positioning */}
      <div className={`fixed bottom-6 right-6 z-[9999] ${className}`}>
        <div className="relative">
          {/* Pulsing ring animation when closed */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 border-2 border-blue-400 rounded-full pointer-events-none"
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

          <motion.button
            onClick={toggleChat}
            className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group overflow-hidden cursor-pointer select-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              animate={{
                background: [
                  "linear-gradient(45deg, #3B82F6, #8B5CF6)",
                  "linear-gradient(45deg, #8B5CF6, #3B82F6)",
                  "linear-gradient(45deg, #3B82F6, #8B5CF6)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Icon */}
            <div className="relative z-10">
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
                    {/* Notification dot */}
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </div>
      </div>
    </>
  );
}