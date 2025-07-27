'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Upload, FileText, Download, Eye, CheckCircle, Clock, X, Printer } from 'lucide-react';

export default function MaterialDifferentiator({ teacherId }) {
  const [activeTab, setActiveTab] = useState('textbook');
  const [textbookData, setTextbookData] = useState({
    image: null,
    grade_levels: [5],
    language: 'hi'
  });
  const [assessmentData, setAssessmentData] = useState({
    topic: '',
    grade_levels: [5],
    language: 'hi'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const languages = {
    hi: 'हिंदी (Hindi)',
    en: 'English',
    mr: 'मराठी (Marathi)',
    bn: 'বাংলা (Bengali)',
    te: 'తెలుగు (Telugu)',
    ta: 'தமிழ் (Tamil)',
    gu: 'ગુજરાતી (Gujarati)'
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTextbookData(prev => ({ ...prev, image: file }));
    }
  };

  const handleGradeToggle = (grade, type) => {
    const data = type === 'textbook' ? textbookData : assessmentData;
    const setter = type === 'textbook' ? setTextbookData : setAssessmentData;
    
    setter(prev => ({
      ...prev,
      grade_levels: prev.grade_levels.includes(grade)
        ? prev.grade_levels.filter(g => g !== grade)
        : [...prev.grade_levels, grade]
    }));
  };

  // Function to generate materials based on difficulty level for each grade
  const generateMaterialForGrade = (grade, language, subject = 'Mathematics') => {
    const getDifficultyLevel = (grade) => {
      if (grade <= 3) return 'Basic';
      if (grade <= 6) return 'Intermediate';
      return 'Advanced';
    };

    const getEstimatedTime = (grade) => {
      if (grade <= 3) return '15-20 mins';
      if (grade <= 6) return '25-30 mins';
      return '35-45 mins';
    };

    const generateWorksheet = (grade, difficulty) => {
      switch (difficulty) {
        case 'Basic':
          return `Grade ${grade} Worksheet - Basic ${subject}

Instructions: Complete these simple problems. Ask your teacher for help if needed!

1. Simple counting: Count the objects and write the number
   🍎🍎🍎 = ___
   ⭐⭐⭐⭐⭐ = ___

2. Basic addition:
   2 + 1 = ___
   3 + 2 = ___
   4 + 1 = ___

3. Circle the bigger number:
   (3) or (7)
   (5) or (2)

4. Drawing activity: Draw 4 circles and 2 triangles

5. Word problem: Sara has 3 toys. Her friend gives her 2 more. How many toys does Sara have now?

Teacher Notes:
- Use manipulatives (blocks, counters)
- Allow students to draw pictures
- Encourage counting on fingers
- Provide plenty of encouragement

Fun Activity: Use stickers or stamps to make learning more engaging!`;

        case 'Intermediate':
          return `Grade ${grade} Worksheet - Intermediate ${subject}

Instructions: Solve these problems step by step. Show your work clearly.

1. Multi-digit addition:
   245 + 163 = ___
   387 + 294 = ___

2. Subtraction with borrowing:
   542 - 178 = ___
   605 - 237 = ___

3. Word problems:
   a) A library has 1,245 fiction books and 876 non-fiction books. How many books in total?
   b) If a school has 850 students and 127 students are absent today, how many are present?

4. Pattern recognition:
   Complete the pattern: 5, 10, 15, 20, ___, ___

5. Challenge problem:
   Round 2,347 to the nearest hundred and then add 1,500.

Show Your Work Section:
- Line up numbers by place value
- Check your answers
- Explain your thinking for word problems

Extension: Create your own word problem using 3-digit numbers.`;

        case 'Advanced':
          return `Grade ${grade} Worksheet - Advanced ${subject}

Instructions: Solve these complex problems using appropriate strategies and methods.

1. Algebraic expressions:
   Simplify: 4x + 7x - 3x = ___
   If x = 5, find: 3x + 12 = ___

2. Equation solving:
   Solve: 2x + 8 = 20
   Solve: 3(x - 4) = 15

3. Complex word problems:
   a) The sum of three consecutive integers is 48. Find the integers.
   b) A rectangle's length is 3 times its width. If the perimeter is 32 cm, find the dimensions.

4. Data analysis:
   Given the data set: 15, 22, 18, 25, 20, 17, 23
   Find: Mean, Median, Mode, Range

5. Critical thinking:
   Prove that the sum of any two odd numbers is always even.

Advanced Challenges:
- Create a real-world problem that uses linear equations
- Explain multiple solution methods for problem #2
- Research applications of algebra in your daily life

Reflection: Which problem was most challenging and why?`;

        default:
          return `Grade ${grade} Basic Worksheet`;
      }
    };

    const difficulty = getDifficultyLevel(grade);
    const time = getEstimatedTime(grade);
    const worksheet = generateWorksheet(grade, difficulty);

    return {
      difficulty_level: difficulty,
      estimated_time: time,
      worksheet: worksheet,
      instructions: `Adapt teaching methods for Grade ${grade} students with ${difficulty.toLowerCase()} level content`,
      learning_objectives: grade <= 3 
        ? ["Basic number recognition", "Simple operations", "Problem solving with pictures"]
        : grade <= 6
        ? ["Multi-digit operations", "Word problem solving", "Pattern recognition"]
        : ["Algebraic thinking", "Complex problem solving", "Abstract reasoning", "Mathematical communication"]
    };
  };

  // Function to generate assessments for selected grades
  const generateAssessmentForGrade = (grade, topic, language) => {
    const getDifficultyLevel = (grade) => {
      if (grade <= 3) return 'Basic';
      if (grade <= 6) return 'Intermediate';
      return 'Advanced';
    };

    const generateAssessmentContent = (grade, topic, difficulty) => {
      switch (difficulty) {
        case 'Basic':
          return `Grade ${grade} Assessment - ${topic}

Section A: Multiple Choice (Choose the correct answer)
1. What is 2 + 3?
   a) 4   b) 5   c) 6

2. Which number is bigger?
   a) 7   b) 4   c) 9

3. Count the stars: ⭐⭐⭐⭐
   a) 3   b) 4   c) 5

Section B: Fill in the blanks
4. 5 + ___ = 8
5. ___ - 2 = 3

Section C: Drawing (Draw your answer)
6. Draw 6 circles
7. Draw a triangle with 3 sides

Section D: Word Problems
8. Tom has 4 apples. He eats 1 apple. How many apples are left?

Answer Key:
1-b, 2-c, 3-b, 4-3, 5-5, 6-check drawing, 7-check drawing, 8-3 apples

Teacher Instructions:
- Read questions aloud if needed
- Allow extra time for drawing
- Use manipulatives for support
- Focus on effort over speed`;

        case 'Intermediate':
          return `Grade ${grade} Assessment - ${topic}

Section A: Multiple Choice (2 points each)
1. What is 456 + 278?
   a) 734   b) 724   c) 744   d) 754

2. Round 2,673 to the nearest hundred:
   a) 2,600   b) 2,700   c) 2,670   d) 3,000

3. Which fraction is equivalent to 2/4?
   a) 1/2   b) 4/8   c) 3/6   d) All of the above

Section B: Problem Solving (5 points each)
4. A store sold 1,247 items in the morning and 896 items in the afternoon. How many items were sold in total?

5. If a book costs $12.75 and you pay with a $20 bill, how much change should you receive?

Section C: Extended Response (10 points)
6. Explain step-by-step how to multiply 23 × 15. Show your work and check your answer.

7. Create a word problem that involves addition and subtraction. Then solve it.

Grading Rubric:
- Correct answer: Full points
- Correct method, minor error: 80% of points
- Partially correct: 60% of points
- Attempt shown: 40% of points`;

        case 'Advanced':
          return `Grade ${grade} Assessment - ${topic}

Section A: Algebraic Thinking (3 points each)
1. Solve: 3x - 7 = 14
2. Simplify: 5a + 3b - 2a + 7b
3. If f(x) = 2x + 3, find f(5)

Section B: Problem Solving (8 points each)
4. The area of a rectangle is 48 square units. If the length is 3 units more than twice the width, find the dimensions.

5. A sequence follows the pattern: 2, 6, 18, 54, ...
   a) Find the next two terms
   b) Write a formula for the nth term
   c) Find the 8th term

Section C: Critical Analysis (15 points)
6. Two different methods are shown for solving 2x + 6 = 16:
   Method A: 2x = 16 - 6, 2x = 10, x = 5
   Method B: x = (16 - 6) ÷ 2, x = 10 ÷ 2, x = 5
   
   a) Explain why both methods work
   b) Which method do you prefer and why?
   c) Create a similar problem and solve it using both methods

Section D: Real-World Applications (12 points)
7. Design a budget for a school event with $500. Include at least 5 expense categories and use algebraic expressions to represent costs that depend on the number of attendees.

Assessment Criteria:
- Mathematical accuracy (40%)
- Problem-solving process (30%)
- Communication and explanation (20%)
- Creativity and application (10%)`;

        default:
          return `Grade ${grade} Assessment - ${topic}`;
      }
    };

    const difficulty = getDifficultyLevel(grade);
    return generateAssessmentContent(grade, topic, difficulty);
  };

  const processTextbook = async () => {
    if (!textbookData.image) {
      alert('Please upload a textbook image');
      return;
    }

    if (textbookData.grade_levels.length === 0) {
      alert('Please select at least one grade level');
      return;
    }

    setLoading(true);
    try {
      // Generate materials only for selected grades
      const differentiatedMaterials = {};
      
      textbookData.grade_levels.forEach(grade => {
        differentiatedMaterials[grade] = generateMaterialForGrade(
          grade, 
          textbookData.language, 
          'Mathematics' // You can make this dynamic based on the textbook
        );
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResults({
        differentiated_materials: differentiatedMaterials
      });

    } catch (error) {
      console.error('Failed to process textbook:', error);
      alert('Failed to process textbook. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async () => {
    if (!assessmentData.topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    if (assessmentData.grade_levels.length === 0) {
      alert('Please select at least one grade level');
      return;
    }

    setLoading(true);
    try {
      // Generate assessments only for selected grades
      const assessments = {};
      
      assessmentData.grade_levels.forEach(grade => {
        assessments[grade] = generateAssessmentForGrade(
          grade, 
          assessmentData.topic, 
          assessmentData.language
        );
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResults({
        assessments: assessments
      });

    } catch (error) {
      console.error('Failed to create assessment:', error);
      alert('Failed to create assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewFullMaterial = (grade, material, type = 'material') => {
    setSelectedMaterial({
      grade,
      content: material,
      type,
      title: type === 'material' ? `Grade ${grade} Differentiated Material` : `Grade ${grade} Assessment`
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMaterial(null);
  };

  const printMaterial = () => {
    if (selectedMaterial) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedMaterial.title}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                margin: 20px;
                color: #333;
              }
              h1 { 
                color: #2563eb; 
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
              }
              pre { 
                white-space: pre-wrap; 
                font-family: Arial, sans-serif;
                background: #f9fafb;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e5e7eb;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${selectedMaterial.title}</h1>
              <p>Generated by AI Material Differentiator</p>
            </div>
            <pre>${selectedMaterial.content.worksheet || selectedMaterial.content}</pre>
            <div class="footer">
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadMaterial = () => {
    if (selectedMaterial) {
      const content = selectedMaterial.content.worksheet || selectedMaterial.content;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedMaterial.title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Layers className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Material Differentiator</h1>
          <p className="text-gray-600">Create differentiated materials for multi-grade classrooms</p>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('textbook')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'textbook'
                ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Textbook Differentiator
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`flex-1 px-6 py-4 font-semibold text-sm transition-all duration-200 ${
              activeTab === 'assessment'
                ? 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Assessment Creator
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'textbook' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Textbook Upload Section */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-800">Upload Textbook Page</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-400 transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="textbook-upload"
                  />
                  <label htmlFor="textbook-upload" className="cursor-pointer">
                    <Upload size={48} className="mx-auto mb-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                    <p className="text-gray-600 font-medium mb-2">Click to upload textbook page</p>
                    <p className="text-sm text-gray-500">Supports JPG, PNG, PDF</p>
                  </label>
                </div>

                {textbookData.image && (
                  <motion.div 
                    className="border border-green-200 rounded-xl p-4 bg-green-50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      <p className="text-sm font-semibold text-green-600">
                        File uploaded: {textbookData.image.name}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Target Grade Levels 
                    <span className="text-red-500">*</span>
                    {textbookData.grade_levels.length > 0 && (
                      <span className="ml-2 text-orange-600">
                        ({textbookData.grade_levels.length} selected)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                      <label key={grade} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={textbookData.grade_levels.includes(grade)}
                          onChange={() => handleGradeToggle(grade, 'textbook')}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Grade {grade}</span>
                      </label>
                    ))}
                  </div>
                  {textbookData.grade_levels.length === 0 && (
                    <p className="text-red-500 text-xs mt-2">Please select at least one grade level</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                  <select
                    value={textbookData.language}
                    onChange={(e) => setTextbookData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <motion.button
                  onClick={processTextbook}
                  disabled={loading || !textbookData.image || textbookData.grade_levels.length === 0}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading || !textbookData.image || textbookData.grade_levels.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      <Layers size={20} />
                      Differentiate for {textbookData.grade_levels.length} Grade{textbookData.grade_levels.length !== 1 ? 's' : ''}
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Preview Section */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-800">
                  Differentiated Materials
                  {results && results.differentiated_materials && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({Object.keys(results.differentiated_materials).length} materials generated)
                    </span>
                  )}
                </h2>
                
                {results && results.differentiated_materials ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(results.differentiated_materials)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by grade number
                      .map(([grade, material], index) => (
                      <motion.div 
                        key={grade} 
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-800">Grade {grade}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                              material.difficulty_level === 'Basic' ? 'bg-green-100 text-green-800' :
                              material.difficulty_level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {material.difficulty_level}
                            </span>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock size={14} />
                              <span className="text-xs">{material.estimated_time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm max-h-32 overflow-y-auto">
                          {material.worksheet.substring(0, 300)}...
                        </div>
                        <button 
                          onClick={() => viewFullMaterial(grade, material, 'material')}
                          className="mt-3 text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-medium transition-colors"
                        >
                          <Eye size={12} />
                          View Full Material
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-16">
                    <Layers size={64} className="mx-auto mb-6 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Differentiate!</h3>
                    <p className="text-sm mb-4">Differentiated materials will appear here</p>
                    <p className="text-xs text-gray-400">
                      Upload a textbook page and select grade levels to get started
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Assessment Creation Section */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-800">Create Multi-Level Assessment</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={assessmentData.topic}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Fractions, Photosynthesis, World War II"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Grade Levels 
                    <span className="text-red-500">*</span>
                    {assessmentData.grade_levels.length > 0 && (
                      <span className="ml-2 text-orange-600">
                        ({assessmentData.grade_levels.length} selected)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(grade => (
                      <label key={grade} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={assessmentData.grade_levels.includes(grade)}
                          onChange={() => handleGradeToggle(grade, 'assessment')}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Grade {grade}</span>
                      </label>
                    ))}
                  </div>
                  {assessmentData.grade_levels.length === 0 && (
                    <p className="text-red-500 text-xs mt-2">Please select at least one grade level</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Language</label>
                  <select
                    value={assessmentData.language}
                    onChange={(e) => setAssessmentData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {Object.entries(languages).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <motion.button
                  onClick={createAssessment}
                  disabled={loading || !assessmentData.topic.trim() || assessmentData.grade_levels.length === 0}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading || !assessmentData.topic.trim() || assessmentData.grade_levels.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating with AI...
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      Create Assessment for {assessmentData.grade_levels.length} Grade{assessmentData.grade_levels.length !== 1 ? 's' : ''}
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Assessment Preview */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-bold text-gray-800">
                  Generated Assessments
                  {results && results.assessments && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      ({Object.keys(results.assessments).length} assessments generated)
                    </span>
                  )}
                </h2>
                
                {results && results.assessments ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(results.assessments)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Sort by grade number
                      .map(([grade, assessment], index) => (
                      <motion.div 
                        key={grade} 
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <h3 className="font-bold text-gray-800 mb-4">Grade {grade} Assessment</h3>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm max-h-32 overflow-y-auto">
                          {assessment.substring(0, 300)}...
                        </div>
                        <button 
                          onClick={() => viewFullMaterial(grade, assessment, 'assessment')}
                          className="mt-3 text-xs text-orange-600 hover:text-orange-800 flex items-center gap-1 font-medium transition-colors"
                        >
                          <Eye size={12} />
                          View Full Assessment
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-16">
                    <FileText size={64} className="mx-auto mb-6 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Ready to Assess!</h3>
                    <p className="text-sm mb-4">Generated assessments will appear here</p>
                    <p className="text-xs text-gray-400">
                      Enter a topic and select grade levels to create assessments
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Full Material View */}
      {showModal && selectedMaterial && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={closeModal}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <h2 className="text-2xl font-bold text-gray-900">{selectedMaterial.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={printMaterial}
                  className="p-2 text-gray-600 hover:text-orange-600 hover:bg-white rounded-lg transition-colors"
                  title="Print Material"
                >
                  <Printer size={20} />
                </button>
                <button
                  onClick={downloadMaterial}
                  className="p-2 text-gray-600 hover:text-orange-600 hover:bg-white rounded-lg transition-colors"
                  title="Download Material"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-gray-50 rounded-xl p-6 border">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {selectedMaterial.content.worksheet || selectedMaterial.content}
                </pre>
              </div>

              {/* Additional Material Info */}
              {selectedMaterial.content.instructions && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Instructions for Teachers:</h3>
                  <p className="text-blue-800 text-sm">{selectedMaterial.content.instructions}</p>
                </div>
              )}

              {selectedMaterial.content.learning_objectives && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Learning Objectives:</h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    {selectedMaterial.content.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}