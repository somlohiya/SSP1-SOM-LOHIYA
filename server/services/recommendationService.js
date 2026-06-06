export const generateRecommendations = (userCourses) => {
  // Knowledge Graph
  const domains = {
    'computer science core': {
      keywords: ['dsa', 'data structure', 'algorithm', 'dbms', 'database', 'os', 'operating system', 'computer architecture'],
      related: ['Computer Networks', 'OOPs', 'System Design', 'Advanced SQL', 'Distributed Systems'],
    },
    'web development frontend': {
      keywords: ['html', 'css', 'javascript', 'js', 'frontend', 'web design'],
      related: ['React.js', 'Next.js', 'Vue.js', 'UI/UX Design', 'Web Accessibility'],
    },
    'web development backend': {
      keywords: ['node.js', 'express', 'backend', 'api', 'mongodb', 'sql'],
      related: ['GraphQL', 'Microservices', 'Docker', 'Redis', 'AWS Cloud Practitioner'],
    },
    'cybersecurity': {
      keywords: ['linux', 'networking', 'security', 'cryptography', 'kali'],
      related: ['Ethical Hacking', 'Web Security', 'OWASP Top 10', 'Penetration Testing', 'Digital Forensics'],
    },
    'data science & ai': {
      keywords: ['python', 'statistics', 'math', 'data analysis', 'calculus', 'probability'],
      related: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Engineering'],
    },
    'mobile development': {
      keywords: ['java', 'kotlin', 'swift', 'android', 'ios'],
      related: ['React Native', 'Flutter', 'Mobile UI Design', 'App Monetization'],
    },
    'beginner general': {
      keywords: [],
      related: ['Introduction to Programming (Python)', 'Computer Science 101', 'Web Development Fundamentals', 'Git & GitHub Basics'],
    }
  };

  // Course Metadata Dictionary (simulated dynamic LLM knowledge)
  const courseMetadata = {
    'Computer Networks': { diff: 'Intermediate', dur: '4 weeks', ben: 'Essential for Backend & DevOps roles' },
    'OOPs': { diff: 'Beginner', dur: '2 weeks', ben: 'Foundation for Software Engineering' },
    'System Design': { diff: 'Advanced', dur: '6 weeks', ben: 'Crucial for Senior SDE interviews' },
    'Advanced SQL': { diff: 'Intermediate', dur: '3 weeks', ben: 'Required for Data Engineering & Backend' },
    'Distributed Systems': { diff: 'Advanced', dur: '8 weeks', ben: 'Build scalable cloud architectures' },
    'React.js': { diff: 'Intermediate', dur: '4 weeks', ben: 'Most popular frontend framework' },
    'Next.js': { diff: 'Intermediate', dur: '3 weeks', ben: 'Industry standard for React apps' },
    'Vue.js': { diff: 'Intermediate', dur: '3 weeks', ben: 'Great alternative for frontend roles' },
    'UI/UX Design': { diff: 'Beginner', dur: '4 weeks', ben: 'Enhances frontend development skills' },
    'Web Accessibility': { diff: 'Intermediate', dur: '2 weeks', ben: 'Make inclusive web applications' },
    'GraphQL': { diff: 'Intermediate', dur: '2 weeks', ben: 'Modern alternative to REST APIs' },
    'Microservices': { diff: 'Advanced', dur: '5 weeks', ben: 'Scalable enterprise architecture' },
    'Docker': { diff: 'Intermediate', dur: '2 weeks', ben: 'Industry standard for containerization' },
    'Redis': { diff: 'Intermediate', dur: '1 week', ben: 'High-performance caching' },
    'AWS Cloud Practitioner': { diff: 'Beginner', dur: '3 weeks', ben: 'Entry point into Cloud Computing' },
    'Ethical Hacking': { diff: 'Intermediate', dur: '6 weeks', ben: 'Foundation for Cybersecurity careers' },
    'Web Security': { diff: 'Intermediate', dur: '4 weeks', ben: 'Protect apps from modern threats' },
    'OWASP Top 10': { diff: 'Beginner', dur: '2 weeks', ben: 'Essential knowledge for all devs' },
    'Penetration Testing': { diff: 'Advanced', dur: '8 weeks', ben: 'Core skill for Security Analysts' },
    'Digital Forensics': { diff: 'Advanced', dur: '6 weeks', ben: 'Investigate cyber incidents' },
    'Machine Learning': { diff: 'Intermediate', dur: '8 weeks', ben: 'High-demand AI skill' },
    'Deep Learning': { diff: 'Advanced', dur: '10 weeks', ben: 'Build neural networks & AI models' },
    'NLP': { diff: 'Advanced', dur: '6 weeks', ben: 'Create chatbots & text analysis tools' },
    'Computer Vision': { diff: 'Advanced', dur: '6 weeks', ben: 'Image processing and recognition' },
    'Data Engineering': { diff: 'Intermediate', dur: '6 weeks', ben: 'Build data pipelines' },
    'React Native': { diff: 'Intermediate', dur: '4 weeks', ben: 'Build iOS/Android apps with React' },
    'Flutter': { diff: 'Intermediate', dur: '5 weeks', ben: 'Fast cross-platform development' },
    'Mobile UI Design': { diff: 'Beginner', dur: '3 weeks', ben: 'Create beautiful mobile experiences' },
    'App Monetization': { diff: 'Beginner', dur: '2 weeks', ben: 'Generate revenue from apps' },
    'Introduction to Programming (Python)': { diff: 'Beginner', dur: '4 weeks', ben: 'Start your coding journey' },
    'Computer Science 101': { diff: 'Beginner', dur: '6 weeks', ben: 'Understand how computers work' },
    'Web Development Fundamentals': { diff: 'Beginner', dur: '4 weeks', ben: 'Build your first website' },
    'Git & GitHub Basics': { diff: 'Beginner', dur: '1 week', ben: 'Essential version control skills' }
  };

  // Analyze user history
  let activeDomains = new Set();
  let studiedKeywords = new Set();
  
  if (userCourses && userCourses.length > 0) {
    userCourses.forEach(course => {
      const courseText = `${course.name} ${course.description || ''} ${(course.topics || []).map(t => t.name || t.title).join(' ')}`.toLowerCase();
      
      for (const [domain, data] of Object.entries(domains)) {
        for (const keyword of data.keywords) {
          if (courseText.includes(keyword)) {
            activeDomains.add(domain);
            studiedKeywords.add(keyword);
          }
        }
      }
    });
  }

  // Generate dynamic recommendations
  let recommendations = [];
  
  // If no history found, recommend beginner courses
  if (activeDomains.size === 0) {
    activeDomains.add('beginner general');
  }

  // For each active domain, pick dynamic courses
  activeDomains.forEach(domain => {
    const related = domains[domain].related;
    // Pick top 2 from each active domain to keep variety
    let picked = 0;
    for (const course of related) {
      if (picked >= 2) break;
      // Ensure we don't recommend something they already studied (simple name check)
      const isAlreadyStudied = userCourses.some(c => c.name.toLowerCase().includes(course.toLowerCase()));
      if (!isAlreadyStudied) {
        const meta = courseMetadata[course] || { diff: 'Intermediate', dur: '4 weeks', ben: 'Expand your skillset' };
        
        let reason = `Based on your interest in ${domain.replace(/beginner general/i, 'starting out')}`;
        if (domain === 'computer science core') reason = 'Since you are studying core CS concepts like DSA and OS, this is the logical next step.';
        if (domain === 'web development frontend') reason = 'To complement your HTML/CSS/JS skills with modern industry frameworks.';
        if (domain === 'web development backend') reason = 'To expand your backend architecture and deployment capabilities.';
        if (domain === 'cybersecurity') reason = 'To apply your networking and Linux knowledge to defensive security.';
        if (domain === 'data science & ai') reason = 'To utilize your Python and math foundations in modern AI applications.';
        if (domain === 'beginner general') reason = 'Perfect starting point for your learning journey.';

        recommendations.push({
          id: `rec-${Math.random().toString(36).substr(2, 9)}`,
          name: course,
          reason,
          difficulty: meta.diff,
          duration: meta.dur,
          careerBenefits: meta.ben,
          domain: domain
        });
        picked++;
      }
    }
  });

  // Limit to 4 max recommendations
  return recommendations.slice(0, 4);
};
