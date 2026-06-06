/**
 * Analytics Service - Advanced analytics calculations
 */

export const calculateAccuracyTrend = (dailyStats) => {
  if (!dailyStats || dailyStats.length < 2) {
    return { trend: 'neutral', percentChange: 0 };
  }

  const recentWeek = dailyStats.slice(-7);
  const recentAccuracy = recentWeek.reduce((sum, stat) => sum + stat.accuracy, 0) / recentWeek.length;

  const previousWeek = dailyStats.slice(-14, -7);
  const previousAccuracy =
    previousWeek.length > 0 ? previousWeek.reduce((sum, stat) => sum + stat.accuracy, 0) / previousWeek.length : recentAccuracy;

  const percentChange = ((recentAccuracy - previousAccuracy) / Math.max(previousAccuracy, 1)) * 100;

  return {
    trend: percentChange > 5 ? 'improving' : percentChange < -5 ? 'declining' : 'stable',
    percentChange: percentChange.toFixed(1),
  };
};

export const calculateOptimalStudyTime = (dailyStats) => {
  if (!dailyStats || dailyStats.length === 0) {
    return 'Morning (9 AM - 12 PM)'; // Default
  }

  // Analyze when user studies most effectively
  const accuracyByHour = {};

  dailyStats.forEach((stat) => {
    const hour = new Date(stat.date).getHours();
    if (!accuracyByHour[hour]) {
      accuracyByHour[hour] = { accuracy: stat.accuracy, count: 1 };
    } else {
      accuracyByHour[hour].accuracy = (accuracyByHour[hour].accuracy + stat.accuracy) / 2;
      accuracyByHour[hour].count++;
    }
  });

  let bestHour = 9;
  let bestAccuracy = 0;

  Object.entries(accuracyByHour).forEach(([hour, data]) => {
    if (data.accuracy > bestAccuracy) {
      bestAccuracy = data.accuracy;
      bestHour = parseInt(hour);
    }
  });

  const timeOfDay = {
    5: 'Early Morning (5 AM - 8 AM)',
    9: 'Morning (9 AM - 12 PM)',
    13: 'Afternoon (1 PM - 5 PM)',
    18: 'Evening (6 PM - 9 PM)',
    21: 'Late Night (9 PM - 12 AM)',
  };

  const closest = Object.keys(timeOfDay)
    .map(Number)
    .reduce((prev, curr) => (Math.abs(curr - bestHour) < Math.abs(prev - bestHour) ? curr : prev));

  return timeOfDay[closest];
};

export const generateInsights = (metrics, dailyStats) => {
  const insights = [];

  // Insight 1: Study consistency
  if (metrics.currentStreak >= 7) {
    insights.push({
      type: 'positive',
      message: `Amazing consistency! You've maintained a ${metrics.currentStreak}-day study streak. Keep it up!`,
    });
  } else if (metrics.currentStreak >= 3) {
    insights.push({
      type: 'positive',
      message: `Great job with your ${metrics.currentStreak}-day streak. You're building momentum!`,
    });
  }

  // Insight 2: Performance trend
  const trend = calculateAccuracyTrend(dailyStats);
  if (trend.trend === 'improving') {
    insights.push({
      type: 'positive',
      message: `Your accuracy is improving by ${trend.percentChange}%. Your practice is paying off!`,
    });
  } else if (trend.trend === 'declining') {
    insights.push({
      type: 'warning',
      message: `Your accuracy has declined by ${Math.abs(trend.percentChange)}%. Consider reviewing fundamentals.`,
    });
  }

  // Insight 3: Study recommendation
  const optimalTime = calculateOptimalStudyTime(dailyStats);
  insights.push({
    type: 'recommendation',
    message: `You perform best during ${optimalTime}. Schedule important reviews then!`,
  });

  // Insight 4: Total study hours
  if (metrics.totalStudyHours >= 50) {
    insights.push({
      type: 'positive',
      message: `You've invested ${metrics.totalStudyHours} hours in learning. That dedication is impressive!`,
    });
  }

  return insights;
};

export const predictNextMilestone = (metrics, dailyStats) => {
  const hourlyRate = dailyStats.length > 0 ? metrics.totalStudyHours / dailyStats.length : 0;

  // Predict 100-hour milestone
  if (metrics.totalStudyHours < 100) {
    const hoursRemaining = 100 - metrics.totalStudyHours;
    const daysNeeded = hourlyRate > 0 ? Math.ceil(hoursRemaining / hourlyRate) : 'unknown';
    return {
      milestone: '100 Study Hours',
      progress: Math.round((metrics.totalStudyHours / 100) * 100),
      hoursRemaining,
      daysToReach: daysNeeded === 'unknown' ? 'unknown' : daysNeeded,
    };
  }

  // Predict 1-year streak
  const streakTarget = 365;
  return {
    milestone: 'One Year Daily Streak',
    progress: Math.min(Math.round((metrics.currentStreak / streakTarget) * 100), 100),
    daysRemaining: Math.max(streakTarget - metrics.currentStreak, 0),
    daysToReach: Math.max(streakTarget - metrics.currentStreak, 0),
  };
};

export const getWeakAreas = (revisionSchedules) => {
  if (!revisionSchedules || revisionSchedules.length === 0) {
    return [];
  }

  return revisionSchedules
    .map((schedule) => {
      const masteryPercent = (schedule.masteredCards / schedule.totalCards) * 100;
      return {
        topic: schedule.topic,
        masteryPercent,
        cardsRemaining: schedule.totalCards - schedule.masteredCards,
      };
    })
    .sort((a, b) => a.masteryPercent - b.masteryPercent)
    .slice(0, 5); // Top 5 weakest areas
};
