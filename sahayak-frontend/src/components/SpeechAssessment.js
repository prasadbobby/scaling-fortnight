'use client';
import { useState, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Volume2, FileAudio, Award } from 'lucide-react';
import api from '@/lib/api';

export default function SpeechAssessment({ teacherId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [assessmentText, setAssessmentText] = useState('');
  const [language, setLanguage] = useState('hi-IN');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  const languages = {
    'hi-IN': 'Hindi',
    'en-IN': 'English (India)',
    'mr-IN': 'Marathi',
    'bn-IN': 'Bengali',
    'te-IN': 'Telugu',
    'ta-IN': 'Tamil',
    'gu-IN': 'Gujarati'
  };

  const sampleTexts = {
    'hi-IN': 'सूर्य हमारे सौरमंडल का केंद्र है। यह एक बहुत बड़ा तारा है जो प्रकाश और गर्मी देता है।',
    'en-IN': 'The sun is the center of our solar system. It is a very large star that gives us light and heat.',
    'mr-IN': 'सूर्य आपल्या सौरमंडळाचे केंद्र आहे। तो एक खूप मोठा तारा आहे जो प्रकाश आणि उष्णता देतो।',
    'bn-IN': 'সূর্য আমাদের সৌরজগতের কেন্দ্র। এটি একটি খুব বড় তারকা যা আলো এবং তাপ দেয়।'
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

const assessReading = async () => {
  if (!audioBlob || !assessmentText) {
    alert('Please record audio and enter expected text');
    return;
  }

  setLoading(true);
  try {
    // Convert blob to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = reader.result.split(',')[1];
      
      const response = await api.assessReading({
        audio_data: base64Audio,
        expected_text: assessmentText,
        language_code: language,
        student_id: 'student_001' // Mock student ID
      });

      if (response.success) {
        setResults(response.data);
      }
    };
    reader.readAsDataURL(audioBlob);
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
    const response = await api.textToSpeech({
      text: assessmentText,
      language_code: language
    });

    if (response.success && response.data.audio) {
      const audioData = `data:audio/mp3;base64,${response.data.audio}`;
      audioRef.current.src = audioData;
      audioRef.current.play();
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
        <h1 className="text-3xl font-bold text-gray-900">Speech Assessment</h1>
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
                >
                  <Volume2 size={12} />
                  Play Text
                </button>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Audio Recording</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                
                {audioBlob && (
                  <button
                    onClick={playAudio}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    <Play size={16} />
                  </button>
                )}
                
                <div className="flex-1">
                  {isRecording && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-600 font-medium">Recording...</span>
                    </div>
                  )}
                  {audioBlob && !isRecording && (
                    <div className="flex items-center gap-2">
                      <FileAudio size={16} className="text-green-600" />
                      <span className="text-sm text-green-600">Audio recorded</span>
                    </div>
                  )}
                  {!isRecording && !audioBlob && (
                    <span className="text-sm text-gray-600">Click microphone to start recording</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={assessReading}
              disabled={loading || !audioBlob || !assessmentText}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loading"></div>
                  Assessing...
                </>
              ) : (
                <>
                  <Award size={20} />
                  Assess Reading
                </>
              )}
            </button>
          </div>

          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>

        {/* Results Panel */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Assessment Results</h2>
          
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

              {/* Feedback */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Feedback</h3>
                <p className="text-sm text-gray-600">{results.feedback}</p>
              </div>

              {/* Transcription Comparison */}
              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-700 mb-1">Expected Text:</h4>
                  <p className="text-sm text-gray-600">{results.expected}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <h4 className="font-medium text-gray-700 mb-1">What Was Said:</h4>
                  <p className="text-sm text-gray-600">{results.transcript}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                  Save Results
                </button>
                <button className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition-colors">
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <Mic size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Assessment results will appear here</p>
              <p className="text-sm">Record audio and click "Assess Reading"</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">Assessment Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">For Students:</h4>
            <ul className="space-y-1">
              <li>• Read clearly and at a steady pace</li>
              <li>• Pronounce each word carefully</li>
              <li>• Take your time with difficult words</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Teachers:</h4>
            <ul className="space-y-1">
              <li>• Ensure quiet recording environment</li>
              <li>• Use age-appropriate texts</li>
              <li>• Provide encouragement and feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}