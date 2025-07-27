// src/components/QuizBuilder.js
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, FileText, Clock, Users, Target, ArrowRight, 
  Copy, ExternalLink, Download, Settings, Check, 
  ChevronDown, ChevronUp, Play, BookOpen, Zap,
  AlertTriangle, Info, Star, Award
} from 'lucide-react';

export default function QuizBuilder({ teacherId }) {
  const [formData, setFormData] = useState({
    subject: '',
    grade_level: '',
    topic: '',
    num_questions: 10,
    difficulty_level: 'medium',
    language: 'en',
    quiz_type: 'adaptive'
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1);
  const [showFullGuide, setShowFullGuide] = useState(false);
  const [showAppsScript, setShowAppsScript] = useState(false);
  const [copied, setCopied] = useState('');

  const subjects = [
    'Mathematics', 'Science', 'Hindi', 'English', 'Social Studies',
    'Physics', 'Chemistry', 'Biology', 'History', 'Geography',
    'Computer Science', 'Environmental Science', 'Economics'
  ];

  const difficultyLevels = [
    { value: 'easy', label: 'Easy', color: 'green', description: 'Basic concepts, simple questions' },
    { value: 'medium', label: 'Medium', color: 'yellow', description: 'Standard level, mixed difficulty' },
    { value: 'hard', label: 'Hard', color: 'red', description: 'Advanced concepts, challenging questions' }
  ];

  const languages = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { value: 'mr', label: 'Marathi', flag: '🇮🇳' },
    { value: 'bn', label: 'Bengali', flag: '🇮🇳' },
    { value: 'te', label: 'Telugu', flag: '🇮🇳' },
    { value: 'ta', label: 'Tamil', flag: '🇮🇳' }
  ];

  const quizTypes = [
    { value: 'adaptive', label: 'Adaptive Mix', description: 'Mixed question types for comprehensive assessment' },
    { value: 'multiple_choice', label: 'Multiple Choice Only', description: 'Quick to grade, good for facts' },
    { value: 'short_answer', label: 'Short Answer Focus', description: 'Tests understanding and explanation skills' },
    { value: 'true_false', label: 'True/False Focus', description: 'Simple yes/no concepts' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateQuiz = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8080/api/quiz-builder/create-google-form-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          teacher_id: teacherId
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setStep(3);
      } else {
        throw new Error(data.error || 'Quiz generation failed');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type = '') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const downloadManualGuide = (result) => {
    const blob = new Blob([result.manual_guide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.quiz_preview?.title || 'quiz'}-creation-guide.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAppsScript = (result) => {
    const blob = new Blob([result.apps_script_code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.quiz_preview?.title || 'quiz'}-script.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadQuizGuide = (result) => {
    const guide = `
Quiz Information
================

Title: ${result.quiz_preview?.title}
Questions: ${result.quiz_preview?.num_questions}
Estimated Time: ${result.quiz_preview?.estimated_time}
Total Points: ${result.quiz_preview?.total_points}

URLs:
Form URL: ${result.form_url || 'Create manually using provided guide'}
Edit URL: ${result.edit_url || 'Available after creation'}

Created by: Sahayak AI Teaching Assistant
Created on: ${new Date().toLocaleDateString()}

Instructions:
1. Share the Form URL with students
2. Use Edit URL to modify questions
3. Check responses in Google Forms
4. Download results as needed
`;

    const blob = new Blob([guide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.quiz_preview?.title || 'quiz'}-info.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setStep(1);
    setResult(null);
    setCopied('');
    setShowFullGuide(false);
    setShowAppsScript(false);
    setFormData({
      subject: '',
      grade_level: '',
      topic: '',
      num_questions: 10,
      difficulty_level: 'medium',
      language: 'en',
      quiz_type: 'adaptive'
    });
  };

  const isFormValid = () => {
    return formData.subject && formData.grade_level && formData.topic;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
            <Brain className="text-white" size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">AI Quiz Builder</h1>
            <p className="text-gray-600 text-lg">Generate Google Forms quizzes automatically with AI</p>
          </div>
        </div>

        {/* Features Banner */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <Zap size={16} />
              <span>AI-Powered Questions</span>
            </div>
            <div className="flex items-center gap-2 text-purple-700">
              <Target size={16} />
              <span>Auto-Graded</span>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <BookOpen size={16} />
              <span>Multi-Language</span>
            </div>
            <div className="flex items-center gap-2 text-orange-700">
              <Award size={16} />
              <span>Curriculum Aligned</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8 mb-8">
        {[
          { num: 1, label: 'Configure', icon: Settings },
          { num: 2, label: 'Generate', icon: Brain },
          { num: 3, label: 'Deploy', icon: Check }
        ].map((stepItem, index) => (
          <div key={index} className="flex items-center">
            <motion.div 
              className={`
                w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all duration-300
                ${step >= stepItem.num 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500 text-white shadow-lg' 
                  : 'border-gray-300 text-gray-400 bg-white'
                }
              `}
              whileHover={{ scale: 1.05 }}
              animate={{ scale: step === stepItem.num ? 1.1 : 1 }}
            >
              <stepItem.icon size={24} />
            </motion.div>
            <div className="ml-3">
              <div className={`font-bold ${step >= stepItem.num ? 'text-blue-600' : 'text-gray-400'}`}>
                Step {stepItem.num}
              </div>
              <div className={`text-sm ${step >= stepItem.num ? 'text-gray-700' : 'text-gray-400'}`}>
                {stepItem.label}
              </div>
            </div>
            {index < 2 && (
              <ArrowRight 
                className={`mx-6 ${step > stepItem.num ? 'text-blue-500' : 'text-gray-300'}`} 
                size={24} 
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Quiz Configuration */}
      {step === 1 && (
        <motion.div 
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Settings className="text-blue-600" size={36} />
            Configure Your Quiz
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Subject Selection */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                  required
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Grade Level */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Grade Level *
                </label>
                <select
                  value={formData.grade_level}
                  onChange={(e) => handleInputChange('grade_level', parseInt(e.target.value))}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                  required
                >
                  <option value="">Select grade...</option>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Topic/Chapter *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder="e.g., Fractions, Water Cycle, Indian Independence"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">Be specific for better question generation</p>
              </div>

              {/* Language */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Language
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => handleInputChange('language', lang.value)}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                        ${formData.language === lang.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-semibold">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Number of Questions */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Number of Questions
                </label>
                <div className="bg-gray-50 rounded-xl p-6">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={formData.num_questions}
                    onChange={(e) => handleInputChange('num_questions', parseInt(e.target.value))}
                    className="w-full h-3 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>5 questions</span>
                    <span className="font-bold text-2xl text-blue-600">{formData.num_questions}</span>
                    <span>50 questions</span>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Estimated time: {Math.ceil(formData.num_questions * 1.5)} minutes
                  </p>
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Difficulty Level
                </label>
                <div className="space-y-3">
                  {difficultyLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => handleInputChange('difficulty_level', level.value)}
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all text-left
                        ${formData.difficulty_level === level.value
                          ? `border-${level.color}-500 bg-${level.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-bold text-lg ${
                            formData.difficulty_level === level.value 
                              ? `text-${level.color}-700` 
                              : 'text-gray-700'
                          }`}>
                            {level.label}
                          </div>
                          <div className="text-sm text-gray-600">{level.description}</div>
                        </div>
                        {formData.difficulty_level === level.value && (
                          <Check className={`text-${level.color}-600`} size={24} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Type */}
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  Quiz Type
                </label>
                <select
                  value={formData.quiz_type}
                  onChange={(e) => handleInputChange('quiz_type', e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                >
                  {quizTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end mt-8">
            <motion.button
              onClick={() => setStep(2)}
              disabled={!isFormValid()}
              className={`
                px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all
                ${isFormValid()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
              whileHover={isFormValid() ? { scale: 1.05 } : {}}
              whileTap={isFormValid() ? { scale: 0.95 } : {}}
            >
              Continue to Generate
              <ArrowRight size={24} />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Generation */}
      {step === 2 && (
        <motion.div 
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="space-y-8">
            <motion.div 
              className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl"
              animate={{ 
                rotate: loading ? [0, 360] : 0,
                scale: loading ? [1, 1.1, 1] : 1
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Brain className="text-white" size={48} />
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-bold mb-4">Ready to Generate Your Quiz?</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                AI will create a {formData.num_questions}-question quiz about <strong>"{formData.topic}"</strong> 
                for Grade {formData.grade_level} students in {languages.find(l => l.value === formData.language)?.label}
              </p>
            </div>

            {/* Quiz Preview Card */}
            <motion.div 
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-xl mb-6 text-gray-800">📋 Quiz Preview</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-bold text-blue-600">{formData.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grade:</span>
                    <span className="font-bold text-purple-600">{formData.grade_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Topic:</span>
                    <span className="font-bold text-green-600">{formData.topic}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-bold text-orange-600">{formData.num_questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-bold text-red-600 capitalize">{formData.difficulty_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-bold text-indigo-600">
                      {languages.find(l => l.value === formData.language)?.flag} {languages.find(l => l.value === formData.language)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-6 justify-center">
              <motion.button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Back to Edit
              </motion.button>
              
              <motion.button
                onClick={generateQuiz}
                disabled={loading}
                className={`
                  px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  } text-white
                `}
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? (
                  <>
                    <motion.div 
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Play size={24} />
                    Generate Quiz with AI
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <motion.div 
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <motion.div 
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Check className="text-white" size={40} />
            </motion.div>
            <h2 className="text-3xl font-bold text-green-600 mb-3">🎉 Quiz Generated Successfully!</h2>
            <p className="text-gray-600 text-lg">
              {result.creation_method === 'manual_guided' 
                ? 'Your quiz is ready - follow the guide below to create it in Google Forms'
                : 'Your Google Forms quiz is ready to use immediately'
              }
            </p>
          </div>

          {/* Quiz Info Card */}
          <motion.div 
            className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-bold text-xl text-blue-800 mb-4 flex items-center gap-2">
              <FileText size={24} />
              {result.quiz_preview?.title}
            </h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-700">
                <FileText size={16} />
                <span>{result.quiz_preview?.num_questions} Questions</span>
              </div>
              <div className="flex items-center gap-2 text-purple-700">
                <Clock size={16} />
                <span>{result.quiz_preview?.estimated_time}</span>
              </div>
              <div className="flex items-center gap-2 text-green-700">
                <Target size={16} />
                <span>{result.quiz_preview?.total_points} Points</span>
              </div>
              <div className="flex items-center gap-2 text-orange-700">
                <Award size={16} />
                <span>Auto-Graded</span>
              </div>
            </div>
          </motion.div>

          {/* Method-specific content */}
          {result.creation_method === 'manual_guided' ? (
            // Alternative method UI
            <div className="space-y-6">
              <motion.div 
                className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-2">📝 Manual Creation Required</h4>
                    <p className="text-yellow-700">
                      Google Forms API is temporarily unavailable. Choose one of these methods to create your quiz:
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Method 1: Apps Script */}
                <motion.div 
                  className="border-2 border-green-200 rounded-2xl p-6 bg-green-50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Zap className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 text-lg">🚀 Method 1: Automated Script</h4>
                      <p className="text-green-600 text-sm">Recommended - Creates quiz automatically</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-green-700 mb-6">
                    Use Google Apps Script to create the quiz automatically in seconds. Just copy, paste, and run!
                  </p>
                  
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => copyToClipboard(result.apps_script_code, 'script')}
                      className="btn btn-success w-full flex items-center justify-center gap-2 font-bold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {copied === 'script' ? <Check size={18} /> : <Copy size={18} />}
                      {copied === 'script' ? 'Copied!' : 'Copy Apps Script Code'}
                    </motion.button>
                    
                    <div className="flex gap-2">
                      <a
                        href="https://script.google.com/create"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={18} />
                        Open Apps Script
                      </a>
                      
                      <button
                        onClick={() => downloadAppsScript(result)}
                        className="btn btn-secondary flex items-center justify-center gap-2 px-4"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setShowAppsScript(!showAppsScript)}
                      className="w-full text-green-700 hover:text-green-800 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {showAppsScript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {showAppsScript ? 'Hide' : 'Show'} Script Preview
                    </button>
                  </div>
                  
                  {showAppsScript && (
                    <motion.div 
                      className="mt-4 bg-green-100 rounded-xl p-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <pre className="text-xs text-green-800 bg-white p-3 rounded border max-h-48 overflow-y-auto">
                        {result.apps_script_code?.substring(0, 500)}...
                      </pre>
                    </motion.div>
                  )}
                  
                  <div className="mt-4 text-xs text-green-700 bg-green-100 p-3 rounded-xl">
                    <strong>Quick Steps:</strong> 
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Copy the script code above</li>
                      <li>Open Google Apps Script</li>
                      <li>Paste code and click "Run"</li>
                      <li>Check console for form URLs</li>
                    </ol>
                  </div>
                </motion.div>

                {/* Method 2: Manual */}
                <motion.div 
                  className="border-2 border-blue-200 rounded-2xl p-6 bg-blue-50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-800 text-lg">📋 Method 2: Manual Creation</h4>
                      <p className="text-blue-600 text-sm">Step-by-step guide for manual setup</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-blue-700 mb-6">
                    Follow our detailed step-by-step guide to create the quiz manually in Google Forms.
                  </p>
                  
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => downloadManualGuide(result)}
                      className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Download size={18} />
                      Download Complete Guide
                    </motion.button>
                    
                    <a
                      href="https://forms.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Open Google Forms
                    </a>
                    
                    <button
                      onClick={() => setShowFullGuide(!showFullGuide)}
                      className="w-full text-blue-700 hover:text-blue-800 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      {showFullGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {showFullGuide ? 'Hide' : 'Show'} Guide Preview
                    </button>
                  </div>
                  
                  <div className="mt-4 text-xs text-blue-700 bg-blue-100 p-3 rounded-xl">
                    <strong>Manual Steps:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Download the complete guide</li>
                      <li>Go to Google Forms</li>
                      <li>Follow step-by-step instructions</li>
                      <li>Enable quiz mode and scoring</li>
                    </ol>
                  </div>
                </motion.div>
              </div>

              {/* Manual Guide Preview */}
              {showFullGuide && (
                <motion.div 
                  className="bg-gray-50 rounded-2xl p-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <Info size={20} />
                      📖 Creation Guide Preview
                    </h4>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                    <pre className="text-sm text-gray-700 max-h-96 overflow-y-auto whitespace-pre-wrap">
                      {result.manual_guide}
                    </pre>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            // Direct API method UI (when API works)
            <motion.div 
              className="grid lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <Users size={20} />
                  For Students
                </h4>
                <motion.button
                  onClick={() => copyToClipboard(result.form_url, 'url')}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 font-bold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied === 'url' ? <Check size={18} /> : <Copy size={18} />}
                  {copied === 'url' ? 'Link Copied!' : 'Copy Quiz Link'}
                </motion.button>
                <a
                  href={result.form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  Open Quiz
                </a>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <Settings size={20} />
                  For Teachers
                </h4>
                <a
                  href={result.edit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success w-full flex items-center justify-center gap-2 font-bold"
                >
                  <Settings size={18} />
                  Edit Quiz
                </a>
                <button
                  onClick={() => downloadQuizGuide(result)}
                  className="btn btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Info
                </button>
              </div>
            </motion.div>
          )}

          {/* Success Tips */}
          <motion.div 
            className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star size={20} />
              💡 Pro Tips for Using Your Quiz
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Share the quiz link with students via email or classroom apps</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Set a deadline using Google Forms' response settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Monitor responses in real-time through the responses tab</span>
                </li>
              </ul>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Export results to Google Sheets for detailed analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Use the automatic grading feature to save time</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Customize feedback messages for correct/incorrect answers</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <motion.button
              onClick={resetForm}
              className="btn btn-secondary flex items-center justify-center gap-2 px-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              Create Another Quiz
            </motion.button>
            
            <motion.button
              onClick={() => window.open('https://forms.google.com', '_blank')}
              className="btn btn-primary flex items-center justify-center gap-2 px-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink size={20} />
              Manage All Quizzes
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}