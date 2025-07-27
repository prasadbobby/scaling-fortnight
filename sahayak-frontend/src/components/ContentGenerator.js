'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Wand2, Download, Eye, Sparkles, FileText, Gamepad2 } from 'lucide-react';
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
    include_visual: false
  });
  const [gameData, setGameData] = useState({
    topic: '',
    grade_level: 5,
    language: 'hi'
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const languages = {
    hi: 'हिंदी (Hindi)',
    en: 'English',
    mr: 'मराठी (Marathi)',
    bn: 'বাংলা (Bengali)',
    te: 'తెలుగు (Telugu)',
    ta: 'தமிழ் (Tamil)',
    gu: 'ગુજરાતી (Gujarati)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ml: 'മലയാളം (Malayalam)',
    pa: 'ਪੰਜਾਬੀ (Punjabi)'
  };

  const contentTypes = {
    story: 'Educational Story',
    worksheet: 'Interactive Worksheet',
    activity: 'Learning Activity',
    assessment: 'Quick Assessment'
  };

  const culturalContexts = {
    'Indian rural': 'Indian Rural Context',
    'Indian urban': 'Indian Urban Context',
    'Indian tribal': 'Indian Tribal Context',
    'General': 'General Context'
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
          <PenTool className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Generator</h1>
          <p className="text-gray-600">Create personalized educational content with AI</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('story')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'story'
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Educational Content
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'game'
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Gamepad2 size={16} className="inline mr-2" />
            Educational Games
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'story' ? 'Create Educational Content' : 'Generate Educational Game'}
              </h2>
              
              <form onSubmit={activeTab === 'story' ? handleSubmit : handleGameGeneration} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Topic</label>
                  <input
                    type="text"
                    name="topic"
                    value={activeTab === 'story' ? formData.topic : gameData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., Solar System, Photosynthesis, Addition & Subtraction"
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                    <select
                      name="language"
                      value={activeTab === 'story' ? formData.language : gameData.language}
                      onChange={handleInputChange}
                      className="select-field"
                    >
                      {Object.entries(languages).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Grade Level</label>
                    <select
                      name="grade_level"
                      value={activeTab === 'story' ? formData.grade_level : gameData.grade_level}
                      onChange={handleInputChange}
                      className="select-field"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                        <option key={grade} value={grade}>Grade {grade}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeTab === 'story' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Content Type</label>
                      <select
                        name="content_type"
                        value={formData.content_type}
                        onChange={handleInputChange}
                        className="select-field"
                      >
                        {Object.entries(contentTypes).map(([type, name]) => (
                          <option key={type} value={type}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Cultural Context</label>
                      <select
                        name="cultural_context"
                        value={formData.cultural_context}
                        onChange={handleInputChange}
                        className="select-field"
                      >
                        {Object.entries(culturalContexts).map(([context, name]) => (
                          <option key={context} value={context}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <input
                        type="checkbox"
                        name="include_visual"
                        checked={formData.include_visual}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-semibold text-blue-800">Include AI-Generated Visual Aid</label>
                    </div>
                  </>
                )}

                <motion.button
                  type="submit"
                  disabled={loading || (activeTab === 'story' ? !formData.topic : !gameData.topic)}
                  className="btn btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="loading"></div>
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Wand2 size={20} />
                      Generate {activeTab === 'story' ? 'Content' : 'Game'}
                      <Sparkles size={16} className="ml-1" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Preview Section */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Generated Content</h2>
                {generatedContent && (
                  <button className="btn btn-secondary">
                    <Download size={16} />
                    Export
                  </button>
                )}
              </div>
              
              {generatedContent ? (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <Eye className="text-green-600" size={20} />
                    <span className="font-semibold text-green-800">Content Generated Successfully!</span>
                  </div>

                  <div className="glass-card p-6 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                      {generatedContent.content || generatedContent.game_content}
                    </pre>
                  </div>

                  {generatedContent.visual && (
                    <div className="glass-card p-6">
                      <h3 className="font-semibold mb-4 text-gray-800">Generated Visual Aid</h3>
                      <Image
                        src={`data:image/png;base64,${generatedContent.visual}`}
                        alt="Generated visual aid"
                        className="w-full h-auto rounded-xl shadow-md"
                      />
                    </div>
                  )}

                  {generatedContent.metadata && (
                    <div className="glass-card p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                      <h3 className="font-semibold mb-4 text-blue-800">Content Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Topic:</span> 
                          <span className="text-gray-800">{generatedContent.metadata.topic}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Language:</span> 
                          <span className="text-gray-800">{languages[generatedContent.metadata.language]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Grade:</span> 
                          <span className="text-gray-800">Grade {generatedContent.metadata.grade_level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Type:</span> 
                          <span className="text-gray-800 capitalize">{generatedContent.metadata.content_type}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 py-16 glass-card">
                  <PenTool size={64} className="mx-auto mb-6 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Create!</h3>
                  <p className="text-sm mb-4">Your AI-generated content will appear here</p>
                   <p className="text-xs text-gray-400">Fill out the form and click &ldquo;Generate&rdquo; to get started</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}