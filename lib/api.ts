const API_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api'
    : (process.env.API_URL || 'http://localhost:5000') + '/api';

let authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

export const setAuthToken = (token: string) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const clearAuthToken = () => {
  authToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

const getHeaders = () => {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }
  return response.json();
};

// Auth
export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });
    const data = await handleResponse(response);
    setAuthToken(data.token);
    return data.user;
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    setAuthToken(data.token);
    return data.user;
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  updatePreferences: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getProfileStats: async () => {
    const response = await fetch(`${API_URL}/auth/profile-stats`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Syllabi
export const syllabusAPI = {
  upload: async (title: string, subject: string, content: string, semester?: string) => {
    const response = await fetch(`${API_URL}/syllabi/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, subject, content, semester }),
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/syllabi`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getOne: async (id: string) => {
    const response = await fetch(`${API_URL}/syllabi/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  createCourse: async (syllabusId: string, courseName: string) => {
    const response = await fetch(`${API_URL}/syllabi/${syllabusId}/create-course`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseName }),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/syllabi/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Courses
export const courseAPI = {
  getRecommendations: async () => {
    const response = await fetch(`${API_URL}/courses/recommendations`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/courses`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getOne: async (id: string) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  toggleTopicComplete: async (courseId: string, topicId: string) => {
    const response = await fetch(`${API_URL}/courses/${courseId}/topics/${topicId}/complete`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Study Plans
export const studyPlanAPI = {
  create: async (courseId: string, data: any) => {
    const response = await fetch(`${API_URL}/study-plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, ...data }),
    });
    return handleResponse(response);
  },

  getByCourse: async (courseId: string) => {
    const response = await fetch(`${API_URL}/study-plans/course/${courseId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getOne: async (id: string) => {
    const response = await fetch(`${API_URL}/study-plans/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: any) => {
    const response = await fetch(`${API_URL}/study-plans/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  completeSession: async (planId: string, sessionId: string, notes?: string) => {
    const response = await fetch(`${API_URL}/study-plans/${planId}/sessions/${sessionId}/complete`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ notes }),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/study-plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Revision
export const revisionAPI = {
  create: async (courseId: string, topic: string, cards?: any[]) => {
    const response = await fetch(`${API_URL}/revision`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, topic, cards }),
    });
    return handleResponse(response);
  },

  generate: async (courseId: string, topic: string) => {
    const response = await fetch(`${API_URL}/revision/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, topic }),
    });
    return handleResponse(response);
  },

  getByCourse: async (courseId: string) => {
    const response = await fetch(`${API_URL}/revision/course/${courseId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getDueCards: async (scheduleId: string) => {
    const response = await fetch(`${API_URL}/revision/${scheduleId}/due`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  reviewCard: async (scheduleId: string, cardId: string, quality: number) => {
    const response = await fetch(`${API_URL}/revision/${scheduleId}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cardId, quality }),
    });
    return handleResponse(response);
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/revision/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Analytics
export const analyticsAPI = {
  getMetrics: async (courseId: string) => {
    const response = await fetch(`${API_URL}/analytics/${courseId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  recordSession: async (courseId: string, data: any) => {
    const response = await fetch(`${API_URL}/analytics/${courseId}/daily-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getSummary: async (courseId: string) => {
    const response = await fetch(`${API_URL}/analytics/${courseId}/summary`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Chat
export const chatAPI = {
  createConversation: async (courseId?: string, topic?: string) => {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, topic }),
    });
    return handleResponse(response);
  },

  getConversations: async () => {
    const response = await fetch(`${API_URL}/chat`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getConversation: async (conversationId: string) => {
    const response = await fetch(`${API_URL}/chat/${conversationId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  sendMessage: async (conversationId: string, sender: string, content: string, relatedTopics?: string[]) => {
    const response = await fetch(`${API_URL}/chat/${conversationId}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sender, content, relatedTopics }),
    });
    return handleResponse(response);
  },

  rateConversation: async (conversationId: string, rating: number) => {
    const response = await fetch(`${API_URL}/chat/${conversationId}/rate`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ rating }),
    });
    return handleResponse(response);
  },

  deleteConversation: async (conversationId: string) => {
    const response = await fetch(`${API_URL}/chat/${conversationId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

export const quizAPI = {
  generate: async (courseId: string, topic: string, difficulty: string = 'Medium', numQuestions: number = 5) => {
    const response = await fetch(`${API_URL}/quiz/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, topic, difficulty, numQuestions }),
    });
    return handleResponse(response);
  },
  getAll: async (courseId: string) => {
    const response = await fetch(`${API_URL}/quiz/${courseId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
  submit: async (quizId: string, score: number) => {
    const response = await fetch(`${API_URL}/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ score }),
    });
    return handleResponse(response);
  }
};

export const aiAPI = {
  health: async () => {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/ai/health`);
    return response.json();
  },
};

export const notesAPI = {
  generate: async (courseId: string, topic: string, type: string) => {
    const response = await fetch(`${API_URL}/notes/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, topic, type }),
    });
    return handleResponse(response);
  },
  getAll: async (courseId: string) => {
    const response = await fetch(`${API_URL}/notes/${courseId}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  }
};
