// src/components/ContentGenerator.js
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PenTool, Wand2, Download, Eye, Sparkles, FileText, Gamepad2, 
  BookOpen, Zap, Copy, RefreshCw, Settings, ChevronDown,
  Play, Pause, Volume2, VolumeX, ExternalLink, Share2,
  CheckCircle, Clock, Star, Globe, Users, Target,
  Lightbulb, Palette, Music, Video
} from 'lucide-react';
import api from '@/lib/api';
import Image from 'next/image';

export default function ContentGenerator({ teacherId }) {
  const [activeTab, setActiveTab] = useState('story');
  const [formData, setFormData] = useState({
    topic: '',
    language: 'hi',
    cultural_context: 'Indian rural',
    content_type: 'story',
    grade_level: 5,
    include_visual: false,
    tone: 'friendly',
    length: 'medium'
  });
  const [gameData, setGameData] = useState({
    topic: '',
    grade_level: 5,
    language: 'hi',
    game_type: 'quiz',
    difficulty: 'medium'
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const languages = {
    hi: { name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    en: { name: 'English', flag: '🇺🇸' },
    mr: { name: 'मराठी (Marathi)', flag: '🇮🇳' },
    bn: { name: 'বাংলা (Bengali)', flag: '🇧🇩' },
    te: { name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    ta: { name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    gu: { name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    kn: { name: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳' },
    ml: { name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    pa: { name: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳' }
  };

  const contentTypes = {
    story: { name: 'Educational Story', icon: BookOpen, color: 'blue', desc: 'Engaging narratives with learning objectives' },
    worksheet: { name: 'Interactive Worksheet', icon: FileText, color: 'green', desc: 'Practice exercises and activities' },
    activity: { name: 'Learning Activity', icon: Lightbulb, color: 'yellow', desc: 'Hands-on educational experiences' },
    assessment: { name: 'Quick Assessment', icon: Target, color: 'purple', desc: 'Evaluation tools and quizzes' }
  };

  const gameTypes = {
    quiz: { name: 'Interactive Quiz', icon: Target, color: 'purple' },
    puzzle: { name: 'Educational Puzzle', icon: Lightbulb, color: 'yellow' },
    memory: { name: 'Memory Game', icon: Star, color: 'pink' },
    adventure: { name: 'Learning Adventure', icon: Gamepad2, color: 'blue' }
  };

  const culturalContexts = {
    'Indian rural': { name: 'Indian Rural Context', icon: '🏡', desc: 'Village settings, traditional values' },
    'Indian urban': { name: 'Indian Urban Context', icon: '🏢', desc: 'City life, modern scenarios' },
    'Indian tribal': { name: 'Indian Tribal Context', icon: '🌿', desc: 'Indigenous culture, nature-based' },
    'General': { name: 'Universal Context', icon: '🌍', desc: 'Globally relevant content' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        teacher_id: teacherId
      };

      const response = await api.generateContent(payload);
      
      if (response.success) {
        setGeneratedContent(response.data);
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGameGeneration = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...gameData,
        teacher_id: teacherId
      };

      const response = await api.generateGame(payload);
      
      if (response.success) {
        setGeneratedContent(response.data);
      }
    } catch (error) {
      console.error('Game generation failed:', error);
      alert('Failed to generate game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (activeTab === 'story') {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else {
      setGameData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          className="text-center py-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center justify-center gap-4 mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <PenTool className="text-white" size={32} />
            </div>
            <div className="text-left">
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Content Studio
              </h1>
              <p className="text-lg text-gray-600 mt-2">Create personalized educational content with advanced AI</p>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="flex items-center justify-center gap-8 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-500" />
              <span>10+ Languages</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} className="text-green-500" />
              <span>All Grade Levels</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-yellow-500" />
              <span>AI-Powered</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div 
          className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50">
            <motion.button
              onClick={() => setActiveTab('story')}
              className={`flex-1 px-8 py-6 font-bold text-lg transition-all duration-300 relative ${
                activeTab === 'story'
                  ? 'text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-3">
                <FileText size={24} />
                <div className="text-left">
                  <div>Educational Content</div>
                  <div className="text-xs font-normal text-gray-500">Stories, worksheets & activities</div>
                </div>
              </div>
              {activeTab === 'story' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  layoutId="activeTab"
                />
              )}
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('game')}
              className={`flex-1 px-8 py-6 font-bold text-lg transition-all duration-300 relative ${
                activeTab === 'game'
                  ? 'text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-center gap-3">
                <Gamepad2 size={24} />
                <div className="text-left">
                  <div>Educational Games</div>
                  <div className="text-xs font-normal text-gray-500">Interactive learning experiences</div>
                </div>
              </div>
              {activeTab === 'game' && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"
                  layoutId="activeTab"
                />
              )}
            </motion.button>
          </div>

          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
              {/* Enhanced Form Section */}
              <motion.div 
                className="xl:col-span-2 space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {activeTab === 'story' ? 'Content Creator' : 'Game Builder'}
                  </h2>
                  <motion.button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Settings size={16} />
                    Advanced
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
                    />
                  </motion.button>
                </div>
                
                <form onSubmit={activeTab === 'story' ? handleSubmit : handleGameGeneration} className="space-y-6">
                  {/* Topic Input with Enhanced Design */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Lightbulb size={16} className="text-yellow-500" />
                      Topic
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="topic"
                        value={activeTab === 'story' ? formData.topic : gameData.topic}
                        onChange={handleInputChange}
                        placeholder="e.g., Solar System, Photosynthesis, Addition & Subtraction"
                        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-lg font-medium shadow-sm"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Sparkles size={20} className="text-purple-400" />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Language Selector */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Globe size={16} className="text-blue-500" />
                        Language
                      </label>
                      <select
                        name="language"
                        value={activeTab === 'story' ? formData.language : gameData.language}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 font-medium shadow-sm"
                      >
                        {Object.entries(languages).map(([code, lang]) => (
                          <option key={code} value={code}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Grade Level */}
                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Users size={16} className="text-green-500" />
                        Grade Level
                      </label>
                      <select
                        name="grade_level"
                        value={activeTab === 'story' ? formData.grade_level : gameData.grade_level}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 font-medium shadow-sm"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                          <option key={grade} value={grade}>Grade {grade}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Content Type Selection with Cards */}
                  {activeTab === 'story' && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Palette size={16} className="text-pink-500" />
                        Content Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(contentTypes).map(([type, details]) => {
                          const Icon = details.icon;
                          const isSelected = formData.content_type === type;
                          return (
                            <motion.button
                              key={type}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, content_type: type }))}
                              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                                isSelected 
                                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon size={20} className={`mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`} />
                              <div className={`font-medium text-sm ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>
                                {details.name}
                              </div>
                              <div className={`text-xs mt-1 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                                {details.desc}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Game Type Selection */}
                  {activeTab === 'game' && (
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Gamepad2 size={16} className="text-blue-500" />
                        Game Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(gameTypes).map(([type, details]) => {
                          const Icon = details.icon;
                          const isSelected = gameData.game_type === type;
                          return (
                            <motion.button
                              key={type}
                              type="button"
                              onClick={() => setGameData(prev => ({ ...prev, game_type: type }))}
                              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                                isSelected 
                                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                                  : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Icon size={20} className={`mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-500'}`} />
                              <div className={`font-medium text-sm ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>
                                {details.name}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Advanced Options */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6"
                      >
                        {activeTab === 'story' && (
                          <>
                            {/* Cultural Context */}
                            <div className="space-y-4">
                              <label className="block text-sm font-bold text-gray-700">Cultural Context</label>
                              <div className="grid grid-cols-2 gap-3">
                                {Object.entries(culturalContexts).map(([context, details]) => {
                                  const isSelected = formData.cultural_context === context;
                                  return (
                                    <button
                                      key={context}
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, cultural_context: context }))}
                                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-left text-sm ${
                                        isSelected 
                                          ? 'border-purple-500 bg-purple-50' 
                                          : 'border-gray-200 bg-white hover:border-purple-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span>{details.icon}</span>
                                        <span className="font-medium">{details.name}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">{details.desc}</div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Visual Aid Toggle */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Palette size={20} className="text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-blue-800">AI Visual Generation</div>
                                    <div className="text-sm text-blue-600">Include custom illustrations and diagrams</div>
                                  </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    name="include_visual"
                                    checked={formData.include_visual}
                                    onChange={handleInputChange}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Enhanced Generate Button */}
                  <motion.button
                    type="submit"
                    disabled={loading || (activeTab === 'story' ? !formData.topic : !gameData.topic)}
                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>AI is creating magic...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={24} />
                        <span>Generate {activeTab === 'story' ? 'Content' : 'Game'}</span>
                        <Sparkles size={20} />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>

              {/* Enhanced Preview Section */}
              <motion.div 
                className="xl:col-span-3 space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Eye size={24} className="text-purple-600" />
                    Generated Content
                  </h2>
                  {generatedContent && (
                    <div className="flex gap-3">
                      <motion.button 
                        onClick={() => copyToClipboard(generatedContent.content || generatedContent.game_content)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Copy size={16} />
                        Copy
                      </motion.button>
                      <motion.button 
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download size={16} />
                        Export
                      </motion.button>
                      <motion.button 
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Share2 size={16} />
                        Share
                      </motion.button>
                    </div>
                  )}
                </div>
                
                {generatedContent ? (
                  <motion.div 
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                          <CheckCircle className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-green-800">Content Generated Successfully!</h3>
                          <p className="text-green-600">Your AI-powered educational content is ready to use</p>
                        </div>
                      </div>
                    </div>

                    {/* Content Display */}
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={20} />
                            Generated Content
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock size={14} />
                              <span>Just now</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="prose prose-lg max-w-none">
                          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                            <pre className="whitespace-pre-wrap text-gray-800 font-medium leading-relaxed text-base">
                              {generatedContent.content || generatedContent.game_content}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Visual Aid */}
                    {generatedContent.visual && (
                      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-200">
                          <h3 className="font-bold text-purple-800 flex items-center gap-2">
                            <Palette size={20} />
                            AI-Generated Visual Aid
                          </h3>
                        </div>
                        <div className="p-6">
                          <div className="relative rounded-xl overflow-hidden shadow-lg">
                            <Image
                              src={`data:image/png;base64,${generatedContent.visual}`}
                              alt="Generated visual aid"
                              width={800}
                              height={600}
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {generatedContent.metadata && (
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                        <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
                          <Settings size={20} />
                          Content Details
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-sm font-medium text-gray-500">Topic</div>
                            <div className="text-lg font-bold text-gray-800">{generatedContent.metadata.topic}</div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-sm font-medium text-gray-500">Language</div>
                            <div className="text-lg font-bold text-gray-800">
                              {languages[generatedContent.metadata.language]?.flag} {languages[generatedContent.metadata.language]?.name.split(' ')[0]}
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-sm font-medium text-gray-500">Grade Level</div>
                            <div className="text-lg font-bold text-gray-800">Grade {generatedContent.metadata.grade_level}</div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="text-sm font-medium text-gray-500">Type</div>
                            <div className="text-lg font-bold text-gray-800 capitalize">{generatedContent.metadata.content_type}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-xl border-2 border-gray-100">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <PenTool size={80} className="mx-auto mb-6 text-purple-300" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Ready to Create Amazing Content!</h3>
                    <p className="text-lg text-gray-600 mb-2">Your AI-generated educational material will appear here</p>
                    <p className="text-sm text-gray-400">Fill out the form and click "Generate" to get started with AI magic ✨</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}