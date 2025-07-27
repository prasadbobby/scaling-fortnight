// frontend/components/ui/VisualGenerator.js
'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function VisualGenerator({ resourceId, topic, description }) {
  const [isLoading, setIsLoading] = useState(false);
  const [visualAid, setVisualAid] = useState(null);
  const [showVisualAid, setShowVisualAid] = useState(false);
  const [error, setError] = useState(null);
  const [customPrompt, setCustomPrompt] = useState(description || `Visual diagram explaining ${topic}`);

  const generateVisualAid = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🎨 Generating visual aid for:', topic);

      // Get API key from environment variables
      const apiKey = 'AIzaSyBMMamcM2phoUTdG6HX15tS93IpVP0lEfY';
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
      }

      // Enhanced prompt for blackboard-style drawings
      const enhancedPrompt = `Create a simple, clear line drawing suitable for a teacher to replicate on a blackboard for students.

Description: ${customPrompt}

Requirements:
- Simple black lines on white background
- Easy to draw with chalk on a blackboard
- Clear labels and annotations
- Educational and age-appropriate
- Minimalist style that can be easily reproduced by hand
- Include important labels and arrows where needed
- Make it visually engaging but not cluttered
- Use simple geometric shapes and lines
- Ensure text is large and readable
- Line art style, educational diagram, blackboard-friendly

Please create a simple educational diagram that a teacher can easily recreate on a blackboard.`;

      console.log('📡 Calling Gemini API for image generation...');

      // Correct API format for Gemini 2.0 Flash Image Generation
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`, {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: enhancedPrompt
            }]
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        })
      });

      console.log('📡 Gemini API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ Gemini API response received:', data);

      // Extract the generated image from the response
      let imageData = null;
      if (data.candidates && data.candidates[0]) {
        const candidate = data.candidates[0];
        
        // Check for inline data in parts
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
              imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              console.log('✅ Found image data in response');
              break;
            }
          }
        }
      }

      if (!imageData) {
        console.error('❌ No image data found in response:', data);
        // Let's also check if there's any text response that might contain image data
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
          const textParts = data.candidates[0].content.parts.filter(part => part.text);
          if (textParts.length > 0) {
            console.log('📝 Text response from Gemini:', textParts[0].text);
          }
        }
        throw new Error('No image data received from Gemini API. The model may have returned text instead of an image.');
      }

      // Create the visual aid object
      const generatedVisualAid = {
        title: `Visual Aid: ${topic}`,
        description: customPrompt,
        image_data: imageData,
        materials_needed: [
          'Blackboard/Whiteboard',
          'Chalk/Markers',
          'Ruler (for straight lines)',
          'Eraser',
          'Compass (if circles needed)'
        ],
        step_by_step_instructions: [
          'Start with the main outline using simple geometric shapes',
          'Add the primary elements using basic lines and curves',
          'Include important labels and text in large, clear letters',
          'Add arrows to show relationships and flow',
          'Add details gradually, keeping the design simple',
          'Review and adjust for clarity and visibility from the back of the classroom'
        ],
        teaching_points: [
          `Use this visual to explain key concepts about ${topic}`,
          'Point to different parts while explaining each element',
          'Ask students to identify different components',
          'Encourage students to draw their own simplified version',
          `Connect the visual elements to real-world examples of ${topic}`,
          'Use the diagram as a reference throughout the lesson'
        ],
        student_interaction: `Engage students by having them help you draw parts of the diagram, ask them to identify different elements, explain what each part represents, and encourage them to create their own versions in their notebooks.`,
        grade_levels: [1, 2, 3, 4, 5],
        subject: topic
      };

      setVisualAid(generatedVisualAid);
      setShowVisualAid(true);
      console.log('✅ Visual aid generated and set successfully');

    } catch (error) {
      console.error('❌ Error generating visual aid:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    try {
      if (!visualAid?.image_data) return;
      
      // Handle different image data formats
      let imageUrl = visualAid.image_data;
      
      if (imageUrl.startsWith('http')) {
        // If it's a URL, fetch it first
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);
      }
      
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `visual-aid-${topic.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL if we created one
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      
      console.log('✅ Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (showVisualAid && visualAid) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎨</div>
              <div>
                <h3 className="text-xl font-bold">{visualAid.title}</h3>
                <p className="text-purple-100 text-sm">AI-generated blackboard visual</p>
              </div>
            </div>
            <button
              onClick={() => setShowVisualAid(false)}
              className="px-4 py-2 border-2 border-white text-white hover:bg-white hover:text-purple-600 rounded-lg transition-all duration-300 font-medium"
            >
              <span className="mr-1">✕</span>
              Close
            </button>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Generated Image */}
          <div className="text-center">
            <div className="inline-block border-4 border-gray-800 rounded-xl bg-gray-900 p-6 shadow-2xl">
              <Image 
                src={visualAid.image_data} 
                alt={visualAid.title}
                className="max-w-full h-auto rounded-lg bg-white"
                style={{ maxHeight: '500px', maxWidth: '100%' }}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{ display: 'none' }} className="p-8 bg-gray-100 rounded text-gray-600">
                <p>Image failed to load. Please try generating again.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 font-medium">
              AI-generated blackboard-style diagram using Gemini
            </p>
          </div>

          {/* Materials Needed */}
          {visualAid.materials_needed && visualAid.materials_needed.length > 0 && (
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center text-lg">
                <span className="mr-2">🎒</span>
                Materials Needed
              </h4>
              <div className="flex flex-wrap gap-2">
                {visualAid.materials_needed.map((material, index) => (
                  <span 
                    key={index}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          {visualAid.step_by_step_instructions && visualAid.step_by_step_instructions.length > 0 && (
            <div className="p-6 bg-green-50 rounded-xl border border-green-200">
              <h4 className="font-bold text-green-900 mb-4 flex items-center text-lg">
                <span className="mr-2">📋</span>
                Drawing Steps
              </h4>
              <div className="space-y-3">
                {visualAid.step_by_step_instructions.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-green-100 shadow-sm">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-green-800 flex-1 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teaching Points */}
          {visualAid.teaching_points && visualAid.teaching_points.length > 0 && (
            <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
              <h4 className="font-bold text-indigo-900 mb-3 flex items-center text-lg">
                <span className="mr-2">💡</span>
                Key Teaching Points
              </h4>
              <ul className="space-y-2">
                {visualAid.teaching_points.map((point, index) => (
                  <li key={index} className="text-indigo-800 flex items-start">
                    <span className="mr-3 text-indigo-600 flex-shrink-0 font-bold">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Student Interaction */}
          {visualAid.student_interaction && (
            <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
              <h4 className="font-bold text-yellow-900 mb-3 flex items-center text-lg">
                <span className="mr-2">👥</span>
                Student Interaction Ideas
              </h4>
              <p className="text-yellow-800 leading-relaxed">{visualAid.student_interaction}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={downloadImage}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span className="mr-2">📥</span>
              Download Image
            </button>
            <button
              onClick={() => setShowVisualAid(false)}
              className="px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              <span className="mr-2">✏️</span>
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 p-8 shadow-xl">
      <div className="text-center mb-8">
        <div className="text-8xl mb-6">🎨</div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Generate Blackboard Visual Aid
        </h3>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Create an AI-generated diagram for <strong>{topic}</strong> that you can easily 
          replicate on your blackboard or whiteboard using Googles Gemini AI.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col items-center space-y-2 text-purple-700 p-4 bg-white rounded-xl shadow-md">
            <span className="text-3xl">✏️</span>
            <span className="font-semibold">Simple line drawings</span>
            <span className='text-sm text-gray-600 text-center'>Easy to reproduce with chalk</span>
          </div>
          <div className="flex flex-col items-center space-y-2 text-purple-700 p-4 bg-white rounded-xl shadow-md">
            <span className="text-3xl">📏</span>
            <span className="font-semibold">Easy to replicate</span>
            <span className="text-sm text-gray-600 text-center">Step-by-step instructions</span>
          </div>
          <div className="flex flex-col items-center space-y-2 text-purple-700 p-4 bg-white rounded-xl shadow-md">
            <span className="text-3xl">🤖</span>
            <span className="font-semibold">Gemini AI powered</span>
            <span className="text-sm text-gray-600 text-center">Advanced AI generation</span>
          </div>
        </div>
      </div>

      {/* Custom Prompt Input */}
      <div className="mb-8">
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          Describe what you want to draw:
        </label>
        <div className="relative">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`e.g., "Draw a simple diagram showing the water cycle with clouds, rain, rivers, and evaporation arrows"`}
            className="w-full p-4 border-2 border-purple-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 resize-none bg-white shadow-md"
            rows="4"
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            {customPrompt.length}/500
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          💡 Tip: Be specific about shapes, labels, and educational elements you want included.
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start space-x-3 text-red-700">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold mb-2">Error generating visual aid:</p>
              <p className="text-sm leading-relaxed">{error}</p>
              {error.includes('API key') && (
                <p className="text-xs mt-3 text-red-600 bg-red-100 p-2 rounded">
                  Make sure to add your Gemini API key to your environment variables as NEXT_PUBLIC_GEMINI_API_KEY
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <button
          onClick={generateVisualAid}
          disabled={isLoading || !customPrompt.trim()}
          className={`px-8 py-4 text-lg font-semibold rounded-xl shadow-xl transition-all duration-300 transform ${
            isLoading || !customPrompt.trim()
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:scale-105 hover:shadow-2xl'
          }`}
        >
          {isLoading ? (
            <>
              <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Generating with Gemini AI...
            </>
          ) : (
            <>
              <span className="mr-3">🎨</span>
              Generate Blackboard Diagram
            </>
          )}
        </button>
      </div>
        
      {isLoading && (
        <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-1"></div>
            <div>
              <p className="text-blue-700 font-semibold text-lg mb-2">
                Gemini AI is creating your visual aid...
              </p>
              <p className="text-blue-600">
                This will be a simple diagram you can easily draw on your blackboard to help explain <strong>{topic}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sample Prompts */}
      <div className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Example Prompts:
        </h4>
        <div className="grid gap-3">
          {[
            "Draw a simple diagram showing the parts of a plant with roots, stem, leaves, and flower",
            "Create a basic diagram of the solar system with sun and planets",
            "Draw a simple food chain showing grass → rabbit → fox with arrows",
            "Show the water cycle with clouds, rain, river, and evaporation arrows"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setCustomPrompt(example)}
              className="text-left p-3 bg-white border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm text-green-800"
            >
              &quot;{example}&quot;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}