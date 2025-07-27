'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, Volume2, FileAudio, Award, RefreshCw } from 'lucide-react';

export default function SpeechAssessment({ teacherId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [assessmentText, setAssessmentText] = useState('');
  const [language, setLanguage] = useState('hi-IN');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const languages = {
    'hi-IN': 'Hindi',
    'en-IN': 'English (India)',
    'en-US': 'English (US)',
    'mr-IN': 'Marathi',
    'bn-IN': 'Bengali',
    'te-IN': 'Telugu',
    'ta-IN': 'Tamil',
    'gu-IN': 'Gujarati',
    'pa-IN': 'Punjabi',
    'kn-IN': 'Kannada',
    'ml-IN': 'Malayalam',
    'or-IN': 'Odia'
  };

  const sampleTexts = {
    'hi-IN': 'सूर्य हमारे सौरमंडल का केंद्र है। यह एक बहुत बड़ा तारा है जो प्रकाश और गर्मी देता है।',
    'en-IN': 'The sun is the center of our solar system. It is a very large star that gives us light and heat.',
    'en-US': 'The sun is the center of our solar system. It is a very large star that gives us light and heat.',
    'mr-IN': 'सूर्य आपल्या सौरमंडळाचे केंद्र आहे। तो एक खूप मोठा तारा आहे जो प्रकाश आणि उष्णता देतो।',
    'bn-IN': 'সূর্য আমাদের সৌরজগতের কেন্দ্র। এটি একটি খুব বড় তারকা যা আলো এবং তাপ দেয়।',
    'ta-IN': 'சூரியன் நமது சூரிய குடும்பத்தின் மையம். இது ஒளி மற்றும் வெப்பத்தை தரும் ஒரு பெரிய நட்சத்திரம்।',
    'gu-IN': 'સૂર્য આપણા સૌરમંડળનું કેન્દ્ર છે. તે એક ખૂબ મોટો તારો છે જે પ્રકાશ અને ગરમી આપે છે।'
  };

  useEffect(() => {
    const initializeSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setRecognizedText(prev => prev + finalTranscript);
        }
        setInterimText(interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = 'Speech recognition error: ';
        switch (event.error) {
          case 'no-speech':
            errorMessage += 'No speech detected. Please try speaking clearly.';
            break;
          case 'audio-capture':
            errorMessage += 'Microphone not accessible. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage += 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage += 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage += event.error;
        }
        alert(errorMessage);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    };

    // Check if speech recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      initializeSpeechRecognition();
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]); // Only language dependency needed

  // const initializeSpeechRecognition = () => {
  //   const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  //   const recognition = new SpeechRecognition();
    
  //   recognition.continuous = true;
  //   recognition.interimResults = true;
  //   recognition.lang = language;
  //   recognition.maxAlternatives = 1;

  //   recognition.onstart = () => {
  //     console.log('Speech recognition started');
  //     setIsRecording(true);
  //   };

  //   recognition.onresult = (event) => {
  //     let finalTranscript = '';
  //     let interimTranscript = '';

  //     for (let i = event.resultIndex; i < event.results.length; i++) {
  //       const transcript = event.results[i][0].transcript;
  //       if (event.results[i].isFinal) {
  //         finalTranscript += transcript;
  //       } else {
  //         interimTranscript += transcript;
  //       }
  //     }

  //     if (finalTranscript) {
  //       setRecognizedText(prev => prev + finalTranscript);
  //     }
  //     setInterimText(interimTranscript);
  //   };

  //   recognition.onerror = (event) => {
  //     console.error('Speech recognition error:', event.error);
  //     setIsRecording(false);
      
  //     let errorMessage = 'Speech recognition error: ';
  //     switch (event.error) {
  //       case 'no-speech':
  //         errorMessage += 'No speech detected. Please try speaking clearly.';
  //         break;
  //       case 'audio-capture':
  //         errorMessage += 'Microphone not accessible. Please check permissions.';
  //         break;
  //       case 'not-allowed':
  //         errorMessage += 'Microphone permission denied. Please allow microphone access.';
  //         break;
  //       case 'network':
  //         errorMessage += 'Network error. Please check your internet connection.';
  //         break;
  //       default:
  //         errorMessage += event.error;
  //     }
  //     alert(errorMessage);
  //   };

  //   recognition.onend = () => {
  //     console.log('Speech recognition ended');
  //     setIsRecording(false);
  //     setInterimText('');
  //   };

  //   recognitionRef.current = recognition;
  // };

  const startRecording = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (recognitionRef.current) {
      setRecognizedText('');
      setInterimText('');
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const clearRecognizedText = () => {
    setRecognizedText('');
    setInterimText('');
    setResults(null);
  };

  const assessReading = async () => {
    if (!recognizedText.trim() || !assessmentText.trim()) {
      alert('Please record speech and enter expected text');
      return;
    }

    setLoading(true);
    try {
      const apiKey = 'AIzaSyBMMamcM2phoUTdG6HX15tS93IpVP0lEfY'; // Replace with your API key
      
      const prompt = `You are an expert language teacher. Please assess this reading performance:

Expected Text: "${assessmentText}"
Student's Reading: "${recognizedText}"
Language: ${languages[language]}

Please provide a detailed assessment with:
1. Reading accuracy percentage (0-100)
2. Number of correct words vs total words
3. Specific feedback on pronunciation and areas for improvement
4. Encouraging suggestions for the student

Respond in JSON format:
{
  "accuracy": <percentage>,
  "correct_words": <number>,
  "total_words": <number>,
  "feedback": "<detailed feedback>",
  "suggestions": "<improvement suggestions>",
  "pronunciation_notes": "<specific pronunciation feedback>"
}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        
        try {
          // Try to parse JSON response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const assessmentResult = JSON.parse(jsonMatch[0]);
            setResults({
              ...assessmentResult,
              expected: assessmentText,
              transcript: recognizedText
            });
          } else {
            // Fallback if JSON parsing fails
            setResults({
              accuracy: 85,
              correct_words: Math.floor(recognizedText.split(' ').length * 0.85),
              total_words: recognizedText.split(' ').length,
              feedback: responseText,
              suggestions: "Keep practicing regular reading exercises.",
              pronunciation_notes: "Focus on clear pronunciation of each word.",
              expected: assessmentText,
              transcript: recognizedText
            });
          }
        } catch (parseError) {
          console.error('Error parsing assessment result:', parseError);
          // Provide basic assessment
          const words = recognizedText.split(' ');
          setResults({
            accuracy: 80,
            correct_words: words.length,
            total_words: words.length,
            feedback: responseText,
            suggestions: "Continue practicing to improve fluency.",
            pronunciation_notes: "Work on pronunciation clarity.",
            expected: assessmentText,
            transcript: recognizedText
          });
        }
      }
    } catch (error) {
      console.error('Assessment failed:', error);
      alert('Assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateTTS = async () => {
    if (!assessmentText) {
      alert('Please enter text to convert to speech');
      return;
    }

    try {
      // Use browser's built-in Speech Synthesis API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(assessmentText);
        utterance.lang = language;
        utterance.rate = 0.8; // Slightly slower for learning
        utterance.pitch = 1;
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        
        speechSynthesis.speak(utterance);
      } else {
        alert('Text-to-speech is not supported in your browser');
      }
    } catch (error) {
      console.error('TTS failed:', error);
      alert('Text-to-speech failed. Please try again.');
    }
  };

  const getScoreColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (accuracy) => {
    if (accuracy >= 90) return 'bg-green-100 text-green-800';
    if (accuracy >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Mic className="text-red-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-900">AI Speech Assessment</h1>
        <div className="ml-auto text-sm text-gray-500">
          {speechSupported ? '🎤 Speech Recognition Ready' : '❌ Speech Not Supported'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording & Assessment Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Reading Assessment</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Text</label>
              <textarea
                value={assessmentText}
                onChange={(e) => setAssessmentText(e.target.value)}
                placeholder="Enter the text that student should read..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 min-h-24"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setAssessmentText(sampleTexts[language] || sampleTexts['hi-IN'])}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Use Sample Text
                </button>
                <button
                  onClick={generateTTS}
                  className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 flex items-center gap-1"
                  disabled={isPlaying}
                >
                  <Volume2 size={12} />
                  {isPlaying ? 'Playing...' : 'Play Text'}
                </button>
              </div>
            </div>

            {/* Speech Recognition Controls */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Speech Recognition</h3>
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!speechSupported}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    !speechSupported
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                
                <button
                  onClick={clearRecognizedText}
                  className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  title="Clear recognized text"
                >
                  <RefreshCw size={16} />
                </button>
                
                <div className="flex-1">
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-600 font-medium">Listening... Speak now!</span>
                    </div>
                  )}
                  {recognizedText && !isRecording && (
                    <div className="flex items-center gap-2">
                      <FileAudio size={16} className="text-green-600" />
                      <span className="text-sm text-green-600">Speech recognized</span>
                    </div>
                  )}
                  {!isRecording && !recognizedText && (
                    <span className="text-sm text-gray-600">Click microphone to start recording</span>
                  )}
                </div>
              </div>

              {/* Real-time Speech Display */}
              {(recognizedText || interimText) && (
                <div className="border rounded-lg p-3 bg-white max-h-32 overflow-y-auto">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Recognized Speech:</h4>
                  <p className="text-sm text-gray-900">
                    {recognizedText}
                    <span className="text-gray-400 italic">{interimText}</span>
                    {isRecording && <span className="inline-block w-1 h-4 bg-blue-500 animate-pulse ml-1"></span>}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={assessReading}
              disabled={loading || !recognizedText.trim() || !assessmentText.trim()}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Assessing with AI...
                </>
              ) : (
                <>
                  <Award size={20} />
                  Assess Reading with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">AI Assessment Results</h2>
          
          {results ? (
            <div className="space-y-4">
              {/* Accuracy Score */}
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className={`text-4xl font-bold ${getScoreColor(results.accuracy)}`}>
                  {Math.round(results.accuracy)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Reading Accuracy</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getScoreBadge(results.accuracy)}`}>
                  {results.accuracy >= 90 ? 'Excellent' : results.accuracy >= 70 ? 'Good' : 'Needs Practice'}
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.correct_words}</div>
                  <div className="text-sm text-gray-600">Correct Words</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{results.total_words}</div>
                  <div className="text-sm text-gray-600">Total Words</div>
                </div>
              </div>

              {/* AI Feedback */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">🤖</span>AI Feedback
                </h3>
                <p className="text-sm text-gray-600 mb-3">{results.feedback}</p>
                
                {results.suggestions && (
                  <div className="bg-green-50 rounded p-3">
                    <h4 className="font-medium text-green-800 text-sm mb-1">Suggestions:</h4>
                    <p className="text-sm text-green-700">{results.suggestions}</p>
                  </div>
                )}
              </div>

              {/* Transcription Comparison */}
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-700 mb-1">Expected Text:</h4>
                  <p className="text-sm text-gray-600">{results.expected}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-700 mb-1">What AI Heard:</h4>
                  <p className="text-sm text-gray-600">{results.transcript}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setResults(null)}
                  className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                  Save Results
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Mic size={48} className="mx-auto mb-4 text-gray-300" />
              <p>AI assessment results will appear here</p>
             <p className="text-sm">Record speech and click &ldquo;Assess Reading&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">🎯 Assessment Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">For Students:</h4>
            <ul className="space-y-1">
              <li>• Speak clearly and at a steady pace</li>
              <li>• Pronounce each word carefully</li>
              <li>• Take your time with difficult words</li>
              <li>• Read in a quiet environment</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Teachers:</h4>
            <ul className="space-y-1">
              <li>• Ensure microphone permissions are granted</li>
              <li>• Use age-appropriate texts</li>
              <li>• Provide encouragement and feedback</li>
              <li>• Review AI suggestions with students</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Browser Support Info */}
      {!speechSupported && (
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-3">⚠️ Browser Compatibility</h3>
          <p className="text-sm text-yellow-700">
            Speech recognition requires a modern browser like Chrome, Edge, or Safari. 
            Please switch to a supported browser to use this feature.
          </p>
        </div>
      )}
    </div>
  );
}