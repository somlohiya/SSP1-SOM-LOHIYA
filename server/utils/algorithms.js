/**
 * Spaced Repetition Algorithm (SM-2 variant)
 * Used for calculating optimal review intervals
 */
export const calculateNextReviewDate = (card) => {
  const now = new Date();
  let interval = card.interval || 1;

  // First review: 1 day
  if (card.repetitions === 0) {
    interval = 1;
  }
  // Second review: 3 days
  else if (card.repetitions === 1) {
    interval = 3;
  }
  // Subsequent reviews: increase by easiness factor
  else {
    interval = Math.round(interval * card.easinessFactor);
  }

  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    nextReviewDate: nextDate,
    interval,
  };
};

/**
 * Update easiness factor based on quality of response (0-5)
 * SM-2 formula: EF = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 */
export const updateEasinessFactor = (currentEF, quality) => {
  const newEF = currentEF + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  return Math.max(1.3, newEF); // EF should not fall below 1.3
};

/**
 * Modified Leitner System
 * Organizes cards into boxes based on proficiency
 */
export const calculateLeitnerBox = (repetitions, quality) => {
  if (quality < 3) {
    return 1; // Failed - back to box 1
  }

  if (repetitions <= 2) {
    return 2;
  }

  if (repetitions <= 4) {
    return 3;
  }

  return 4; // Mastered
};

/**
 * Generate study plan sessions using smart scheduling
 */
export const generateStudySession = (topicsArray, dailyHours, estimatedTotalHours, totalDays, planStartDate) => {
  const sessionDuration = 60; // minutes per session
  const sessionsPerDay = Math.max(1, Math.ceil((dailyHours * 60) / sessionDuration));

  // Use totalDays if provided, otherwise calculate from hours
  const daysNeeded = totalDays && totalDays > 0
    ? totalDays
    : Math.ceil(estimatedTotalHours / Math.max(1, dailyHours));

  const sessions = [];
  const startDate = planStartDate ? new Date(planStartDate) : new Date();

  // Ensure we have at least one topic
  const safeTopics = Array.isArray(topicsArray) && topicsArray.length > 0 ? topicsArray : ['General Study'];

  // Evenly distribute topics across all sessions
  const totalSessions = daysNeeded * sessionsPerDay;
  const topicsPerSession = Math.max(1, Math.ceil(safeTopics.length / totalSessions));

  for (let day = 0; day < daysNeeded; day++) {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + day);

    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      sessionDate.getDay()
    ];

    for (let session = 0; session < sessionsPerDay; session++) {
      const startHour = 9 + session * 2;
      const startTime = `${String(Math.min(startHour, 21)).padStart(2, '0')}:00`;
      const endTime = `${String(Math.min(startHour + 1, 22)).padStart(2, '00')}:00`;

      const globalSessionIndex = day * sessionsPerDay + session;
      // Distribute topics evenly — cycle through them
      const topicStart = (globalSessionIndex * topicsPerSession) % safeTopics.length;
      const assignedTopics = safeTopics.slice(topicStart, topicStart + topicsPerSession);
      if (assignedTopics.length === 0) assignedTopics.push(safeTopics[globalSessionIndex % safeTopics.length]);

      sessions.push({
        id: `session_${globalSessionIndex}_${Date.now()}`,
        date: new Date(sessionDate),
        dayOfWeek,
        startTime,
        endTime,
        duration: sessionDuration,
        topics: assignedTopics,
        completed: false,
      });
    }
  }

  return sessions;
};

/**
 * Calculate study streak and consistency metrics
 */
export const calculateStreak = (dailyStats) => {
  if (!dailyStats || dailyStats.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = dailyStats
    .map((stat) => new Date(stat.date).toDateString())
    .sort((a, b) => new Date(b) - new Date(a));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if studying today or yesterday to count current streak
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    currentStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((prevDate - currDate) / 86400000);

      if (diffDays === 1) {
        tempStreak++;
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((prevDate - currDate) / 86400000);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
};
