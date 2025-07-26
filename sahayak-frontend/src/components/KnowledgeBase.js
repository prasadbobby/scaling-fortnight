'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Search, Lightbulb, BookOpen, HelpCircle, Sparkles } from 'lucide-react';
import api from '@/lib/api';

export default function KnowledgeBase({ teacherId }) {
  const [question, setQuestion] = useState('');
  const [gradeLevel, setGradeLevel] = useState(5);
  const [language, setLanguage] = useState('hi');
  const [explanation, setExplanation] = useState(null);
  const [quickAnswer, setQuickAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('explain');

  const languages = {
    hi: 'हिंदी (Hindi)',
    en: 'English',
    mr: 'मराठी (Marathi)',
    bn: 'বাংলা (Bengali)',
    te: 'తెలుగు (Telugu)',
    ta: 'தமிழ் (Tamil)',
    gu: 'ગુજરાતી (Gujarati)'
  };

  const sampleQuestions = [
    "Why is the sky blue?",
    "How do plants make food?",
    "What causes earthquakes?",
    "Why do we have seasons?",
    "How does the heart work?",
    "What is photosynthesis?",
    "Why do objects fall down?",
    "How do magnets work?"
  ];

  const handleExplainConcept = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await api.explainConcept({
        question: question.trim(),
        grade_level: gradeLevel,
        language: language
      });

      if (response.success) {
        setExplanation(response.data);
      }
    } catch (error) {
      console.error('Failed to get explanation:', error);
      alert('Failed to get explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAnswer = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const response = await api.getQuickAnswer({
        question: question.trim(),
        language: language
      });

      if (response.success) {
        setQuickAnswer(response.data);
      }
    } catch (error) {
      console.error('Failed to get quick answer:', error);
      alert('Failed to get quick answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'explain') {
      handleExplainConcept();
    } else {
      handleQuickAnswer();
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
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Brain className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Get instant AI-powered explanations for any question</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('explain')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'explain'
                ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Lightbulb size={16} className="inline mr-2" />
            Concept Explanation
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'quick'
                ? 'bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-600 border-b-2 border-cyan-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <HelpCircle size={16} className="inline mr-2" />
            Quick Answer
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-800">
                {activeTab === 'explain' ? 'Ask for Detailed Explanation' : 'Get Quick Answer'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Question</label>
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-4 text-gray-400" />
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask any question you need help with..."
                      className="textarea-field pl-12"
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="select-field"
                    >
                      {Object.entries(languages).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {activeTab === 'explain' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Grade Level</label>
                      <select
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(parseInt(e.target.value))}
                        className="select-field"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                          <option key={grade} value={grade}>Grade {grade}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="btn btn-primary w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="loading"></div>
                      Getting AI Answer...
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      {activeTab === 'explain' ? 'Get Explanation' : 'Get Quick Answer'}
                      <Sparkles size={16} className="ml-1" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Sample Questions */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-3">Sample Questions</h3>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.slice(0, 6).map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(sample)}
                      className="text-xs px-3 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Answer Section */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-800">AI Response</h2>
              
              {(explanation || quickAnswer) ? (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <Lightbulb className="text-green-600" size={20} />
                    <span className="font-semibold text-green-800">Answer Generated Successfully!</span>
                  </div>

                  <div className="glass-card p-6">
                    <div className="prose prose-sm max-w-none">
                      <h3 className="font-semibold text-gray-800 mb-3">
                        {activeTab === 'explain' ? explanation?.question : quickAnswer?.question}
                      </h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {activeTab === 'explain' ? explanation?.explanation : quickAnswer?.answer}
                      </div>
                    </div>
                  </div>

                  {explanation && (
                    <div className="glass-card p-6 bg-gradient-to-r from-cyan-50 to-blue-50">
                      <h3 className="font-semibold mb-4 text-cyan-800">Explanation Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Grade Level:</span> 
                          <span className="text-gray-800">Grade {explanation.grade_level}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Language:</span> 
                          <span className="text-gray-800">{languages[explanation.language]}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="text-center text-gray-500 py-16 glass-card">
                  <Brain size={64} className="mx-auto mb-6 text-gray-300" />
                  <h3 className="text-lg font-semibold mb-2">Ask Anything!</h3>
                  <p className="text-sm mb-4">Get instant AI-powered explanations</p>
                  <p className="text-xs text-gray-400">Type your question above and get started</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 via-cyan-50 to-purple-50 rounded-2xl p-8 border border-blue-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
          <BookOpen size={20} />
          Tips for Better Answers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-700">
          <div>
            <h4 className="font-semibold mb-2">For Concept Explanations:</h4>
            <ul className="space-y-1">
              <li>• Be specific about the concept</li>
              <li>• Choose appropriate grade level</li>
              <li>• Ask for examples or analogies</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">For Quick Answers:</h4>
            <ul className="space-y-1">
              <li>• Ask direct questions</li>
              <li>• Be clear and concise</li>
              <li>• Specify if you need examples</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Use your preferred language</li>
              <li>• Ask follow-up questions</li>
              <li>• Save useful explanations</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}