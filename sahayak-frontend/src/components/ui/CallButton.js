// src/components/ui/CallButton.js
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, PhoneCall, Loader, CheckCircle, XCircle } from 'lucide-react';
import { ElevenLabsService } from '@/services/elevenlabs';

export default function CallButton({ 
  phoneNumber = "+917019316634", 
  className = "", 
  variant = "primary" 
}) {
  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, success, error
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

  const getButtonStyle = () => {
    const baseStyle = "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 shadow-lg hover:shadow-xl`;
      case 'secondary':
        return `${baseStyle} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-blue-500 shadow-md hover:shadow-lg`;
      default:
        return `${baseStyle} bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 shadow-lg hover:shadow-xl`;
    }
  };

  const getIcon = () => {
    switch (callStatus) {
      case 'calling':
        return <Loader size={20} className="animate-spin" />;
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      default:
        return <PhoneCall size={20} />;
    }
  };

  const getButtonText = () => {
    switch (callStatus) {
      case 'calling':
        return 'Calling...';
      case 'success':
        return 'Call Initiated';
      case 'error':
        return 'Call Failed';
      default:
        return 'Call Now';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        onClick={handleCall}
        disabled={callStatus === 'calling'}
        className={`${getButtonStyle()} ${className}`}
        whileHover={{ scale: callStatus === 'calling' ? 1 : 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {getIcon()}
        {getButtonText()}
      </motion.button>
      
      {message && (
        <motion.p 
          className={`text-sm ${
            callStatus === 'success' ? 'text-green-600' : 
            callStatus === 'error' ? 'text-red-600' : 
            'text-blue-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}