/**
 * Extract topics from syllabus text using improved NLP
 * Handles both plain-text syllabi and PDF-extracted text (which is often
 * one long space-joined string with no real newlines).
 */
export const extractTopicsFromText = (text) => {
  if (!text) return [];

  // ── 1. Normalise whitespace ──────────────────────────────────────────────
  // PDF.js joins items with a single space, so we get a flat string.
  // Try to recover line breaks by treating multiple spaces or   common
  // numbered-list patterns as line separators.
  let normalised = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Insert a newline before patterns like "1.", "2.", "Unit 1", "Chapter 2" etc.
    .replace(/(?<!\n)\s{2,}(?=\d+[\.):])/g, '\n')
    .replace(/(?<!\n)\s+(?=(chapter|unit|module|section|topic|part|lesson)\s)/gi, '\n')
    // Split on "|" or "•" or "·" bullet-like characters
    .replace(/[|•·]/g, '\n');

  const lines = normalised
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  // ── 2. Scoring heuristics ────────────────────────────────────────────────
  const topicKeywords = ['chapter', 'unit', 'module', 'section', 'topic', 'part', 'lesson'];
  const skipPatterns = [
    /^(course|instructor|professor|email|phone|office|prerequisite|textbook|reference|grading|attendance|plagiarism|policy|schedule|syllabus|date|week|time|room|hall|building|credit|hour|semester|year|session|class|note|objective|outcome|description|overview)/i,
    /^(page|pg|©|copyright|www\.|http)/i,
    /^\d+$/, // bare page numbers
  ];

  const candidates = [];

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    // Skip known non-topic lines
    if (skipPatterns.some((p) => p.test(lower))) return;

    // Too long to be a topic heading (probably a paragraph)
    if (line.length > 120) return;

    let weight = 0;
    let name = line;

    // Starts with keyword like "Chapter 3: Photosynthesis"
    const keywordMatch = line.match(
      /^(chapter|unit|module|section|topic|part|lesson)\s*[\d:.-]*\s*[:\-–—]?\s*/i
    );
    if (keywordMatch) {
      weight += 1.0;
      name = line.slice(keywordMatch[0].length).trim();
    }

    // Numbered: "1. Introduction", "3) Thermodynamics", "2.1 Data Types"
    const numberedMatch = line.match(/^(\d+[\d.]*)\s*[.):\-–]?\s+/);
    if (numberedMatch) {
      weight += 0.9;
      name = line.slice(numberedMatch[0].length).trim();
    }

    // ALL-CAPS short line — likely a heading
    if (!keywordMatch && !numberedMatch && line === line.toUpperCase() && line.length > 4 && line.length < 80) {
      weight += 0.7;
      name = line.charAt(0) + line.slice(1).toLowerCase();
    }

    // Title-Case short line — likely a heading
    if (!keywordMatch && !numberedMatch && weight === 0) {
      const words = line.split(' ');
      const titleCased = words.filter((w) => w.length > 1 && w[0] === w[0].toUpperCase()).length;
      if (titleCased >= Math.ceil(words.length * 0.6) && words.length >= 2 && words.length <= 10) {
        weight += 0.5;
      }
    }

    // Must have a minimum weight to be included
    if (weight > 0 && name.length > 3 && name.length < 100) {
      candidates.push({ name: name.replace(/[:\-–—]+$/, '').trim(), weight });
    }
  });

  // ── 3. De-duplicate & return top 20 ─────────────────────────────────────
  const seen = new Set();
  const unique = [];

  // Sort by weight desc so best matches come first
  candidates.sort((a, b) => b.weight - a.weight);

  candidates.forEach((topic) => {
    const key = topic.name.toLowerCase();
    if (!seen.has(key) && topic.name.length > 3) {
      seen.add(key);
      unique.push({ name: topic.name, description: 'Covered in syllabus', weight: topic.weight });
    }
  });

  // If nothing was found at all, fall back to extracting capitalised sentences as topics
  if (unique.length === 0) {
    const fallback = lines.filter((l) => {
      const words = l.split(' ');
      return words.length >= 2 && words.length <= 8 && l[0] === l[0].toUpperCase();
    }).slice(0, 20);

    fallback.forEach((name) => {
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ name, description: 'Covered in syllabus', weight: 0.3 });
      }
    });
  }

  return unique.slice(0, 20);
};

/**
 * Calculate estimated study hours from text length and complexity
 */
export const estimateStudyHours = (text, topicCount) => {
  const wordCount = text.split(/\s+/).length;
  const baseHours = Math.ceil(wordCount / 500); // ~500 words per hour
  const topicMultiplier = 1 + topicCount * 0.1; // More topics = more complexity

  return Math.ceil(baseHours * topicMultiplier * 1.2); // 20% buffer
};

/**
 * Format API response with consistent structure
 */
export const apiResponse = (success, data = null, error = null, statusCode = 200) => {
  return {
    success,
    data,
    error,
    timestamp: new Date().toISOString(),
    statusCode,
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse schedule preferences
 */
export const parseSchedulePreferences = (preferences) => {
  return {
    monday: preferences?.includes('monday') || preferences?.includes('1'),
    tuesday: preferences?.includes('tuesday') || preferences?.includes('2'),
    wednesday: preferences?.includes('wednesday') || preferences?.includes('3'),
    thursday: preferences?.includes('thursday') || preferences?.includes('4'),
    friday: preferences?.includes('friday') || preferences?.includes('5'),
    saturday: preferences?.includes('saturday') || preferences?.includes('6'),
    sunday: preferences?.includes('sunday') || preferences?.includes('0'),
  };
};
