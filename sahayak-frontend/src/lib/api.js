const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  // Specialized methods for Sahayak API
  async generateContent(payload) {
    return this.post('/content/generate-story', payload);
  }

  async generateGame(payload) {
    return this.post('/content/generate-game', payload);
  }

  async generateLessonPlan(payload) {
    return this.post('/planning/generate-lesson-plan', payload);
  }

  async differentiateTextbook(formData) {
    return this.upload('/materials/differentiate-textbook', formData);
  }

  async createAssessment(payload) {
    return this.post('/materials/create-assessment', payload);
  }

  async assessReading(payload) {
    return this.post('/speech/assess-reading', payload);
  }

  async textToSpeech(payload) {
    return this.post('/speech/text-to-speech', payload);
  }

  async generateVisual(payload) {
    return this.post('/visuals/generate-visual-aid', payload);
  }

  async generateDiagram(payload) {
    return this.post('/visuals/generate-diagram', payload);
  }

  async getTeacherAnalytics(teacherId, params = {}) {
    return this.get(`/analytics/teacher-dashboard/${teacherId}`, params);
  }

  async getContentLibrary(teacherId, params = {}) {
    return this.get(`/content/teacher-content/${teacherId}`, params);
  }

  async explainConcept(payload) {
    return this.post('/knowledge/explain-concept', payload);
  }

  async getQuickAnswer(payload) {
    return this.post('/knowledge/quick-answer', payload);
  }
}

const apiService = new ApiService();
export default apiService;