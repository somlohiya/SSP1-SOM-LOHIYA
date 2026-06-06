# Database Schema Documentation

Complete reference for all MongoDB collections and their structure.

## Collections Overview

```
sleek-syllabus/
├── users (1,000+ documents expected)
├── syllabi (100+ documents)
├── courses (500+ documents)
├── studyplans (1,000+ documents)
├── revisionschedules (2,000+ documents)
├── performancemetrics (500+ documents)
└── chathistories (5,000+ documents)
```

## User Collection

Stores user account and preference information.

```json
{
  "_id": ObjectId,
  "email": "string (unique, indexed)",
  "password": "string (bcrypt hashed)",
  "name": "string",
  "avatar": "string (optional URL)",
  "preferences": {
    "theme": "enum: ['light', 'dark']",
    "notifications": "boolean",
    "dailyReminder": "boolean"
  },
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

**Indexes**:
- Unique index on `email`
- Index on `createdAt`

**Queries**:
```javascript
// Find by email
User.findOne({ email: 'user@example.com' })

// Find by ID
User.findById(userId)

// Update preferences
User.findByIdAndUpdate(userId, { preferences: {...} })
```

## Syllabus Collection

Stores uploaded syllabi and extracted content.

```json
{
  "_id": ObjectId,
  "userId": ObjectId (ref: User),
  "title": "string",
  "description": "string (optional)",
  "subject": "string",
  "semester": "string (optional)",
  "uploadedFile": {
    "filename": "string",
    "size": "number (bytes)",
    "uploadedAt": "Date"
  },
  "extractedContent": {
    "rawText": "string",
    "topics": [
      {
        "name": "string",
        "description": "string",
        "weight": "number (0-1)"
      }
    ],
    "estimatedStudyHours": "number"
  },
  "status": "enum: ['uploaded', 'processing', 'processed', 'error']",
  "processingError": "string (nullable)",
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

**Indexes**:
- Index on `userId`
- Index on `status`
- Index on `createdAt`

**Queries**:
```javascript
// Get user's syllabi
Syllabus.find({ userId: userId }).sort({ createdAt: -1 })

// Get single syllabus
Syllabus.findOne({ _id: syllabusId, userId: userId })
```

## Course Collection

Structured courses created from syllabi.

```json
{
  "_id": ObjectId,
  "syllabusId": ObjectId (ref: Syllabus),
  "userId": ObjectId (ref: User),
  "name": "string",
  "description": "string",
  "subject": "string",
  "topics": [
    {
      "id": "UUID",
      "name": "string",
      "description": "string",
      "subtopics": ["string"],
      "estimatedHours": "number",
      "difficulty": "enum: ['easy', 'medium', 'hard']"
    }
  ],
  "totalEstimatedHours": "number",
  "startDate": "Date (optional)",
  "endDate": "Date (optional)",
  "status": "enum: ['not_started', 'in_progress', 'completed']",
  "progress": "number (0-100)",
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

**Indexes**:
- Index on `userId`
- Index on `syllabusId`
- Index on `status`

**Queries**:
```javascript
// Get user's courses
Course.find({ userId: userId })

// Get course with progress
Course.findOne({ _id: courseId, userId: userId })

// Update progress
Course.findByIdAndUpdate(courseId, { progress: newProgress })
```

## StudyPlan Collection

Personalized study schedules with sessions.

```json
{
  "_id": ObjectId,
  "courseId": ObjectId (ref: Course),
  "userId": ObjectId (ref: User),
  "title": "string",
  "description": "string",
  "sessions": [
    {
      "id": "UUID",
      "date": "Date",
      "dayOfWeek": "string",
      "startTime": "string (HH:MM)",
      "endTime": "string (HH:MM)",
      "duration": "number (minutes)",
      "topics": ["string"],
      "completed": "boolean",
      "completedAt": "Date (nullable)",
      "notes": "string (optional)"
    }
  ],
  "totalSessions": "number",
  "completedSessions": "number",
  "startDate": "Date (optional)",
  "endDate": "Date (optional)",
  "learningStyle": "enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'mixed']",
  "dailyHours": "number",
  "weeklyPattern": {
    "monday": "boolean",
    "tuesday": "boolean",
    "wednesday": "boolean",
    "thursday": "boolean",
    "friday": "boolean",
    "saturday": "boolean",
    "sunday": "boolean"
  },
  "status": "enum: ['created', 'active', 'paused', 'completed']",
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

**Indexes**:
- Index on `userId`
- Index on `courseId`
- Index on `status`

**Queries**:
```javascript
// Get course study plans
StudyPlan.find({ courseId: courseId, userId: userId })

// Mark session complete
StudyPlan.findByIdAndUpdate(planId, {
  $set: { 'sessions.$[elem].completed': true },
  $inc: { completedSessions: 1 }
})
```

## RevisionSchedule Collection

Flashcard systems with spaced repetition.

```json
{
  "_id": ObjectId,
  "courseId": ObjectId (ref: Course),
  "userId": ObjectId (ref: User),
  "topic": "string",
  "revisionCards": [
    {
      "id": "UUID",
      "question": "string",
      "answer": "string",
      "difficulty": "enum: ['easy', 'medium', 'hard']",
      "repetitions": "number",
      "interval": "number (days)",
      "nextReviewDate": "Date",
      "easinessFactor": "number (1.3-5.0)",
      "lastReviewDate": "Date (nullable)",
      "quality": "number (0-5)"
    }
  ],
  "totalCards": "number",
  "masteredCards": "number",
  "studyStreak": "number",
  "lastStudyDate": "Date (optional)",
  "algorithm": "enum: ['leitner', 'spaced_repetition', 'interval']",
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

**Indexes**:
- Index on `userId`
- Index on `courseId`
- Index on `nextReviewDate`
- Compound index on `userId`, `courseId`, `nextReviewDate`

**Queries**:
```javascript
// Get due cards for review
RevisionSchedule.findOne({
  _id: scheduleId,
  userId: userId,
  'revisionCards.nextReviewDate': { $lte: new Date() }
})

// Update card after review
RevisionSchedule.findByIdAndUpdate(scheduleId, {
  $set: { 'revisionCards.$[elem].nextReviewDate': newDate }
})
```

## PerformanceMetrics Collection

Analytics and progress tracking.

```json
{
  "_id": ObjectId,
  "userId": ObjectId (ref: User),
  "courseId": ObjectId (ref: Course),
  "dailyStats": [
    {
      "date": "Date",
      "studyHours": "number",
      "topicsReviewed": "number",
      "cardsReviewed": "number",
      "cardsCorrect": "number",
      "accuracy": "number (0-100)"
    }
  ],
  "weeklyStats": [
    {
      "week": "string (YYYY-WW)",
      "totalStudyHours": "number",
      "topicsCompleted": "number",
      "averageAccuracy": "number",
      "streak": "number"
    }
  ],
  "monthlyStats": [
    {
      "month": "string (YYYY-MM)",
      "totalStudyHours": "number",
      "topicsCompleted": "number",
      "averageAccuracy": "number",
      "improvementRate": "number"
    }
  ],
  "overallStats": {
    "totalStudyHours": "number",
    "currentStreak": "number",
    "longestStreak": "number",
    "averageAccuracy": "number",
    "topicsCompleted": "number",
    "totalReviews": "number"
  },
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

**Indexes**:
- Unique compound index on `userId`, `courseId`
- Index on `dailyStats.date`

**Queries**:
```javascript
// Get user's course metrics
PerformanceMetrics.findOne({
  userId: userId,
  courseId: courseId
})

// Add daily session
PerformanceMetrics.findByIdAndUpdate(metricsId, {
  $push: { dailyStats: newDailyRecord }
})
```

## ChatHistory Collection

AI tutor conversations and history.

```json
{
  "_id": ObjectId,
  "userId": ObjectId (ref: User),
  "courseId": ObjectId (ref: Course, optional),
  "conversationId": "UUID (unique)",
  "messages": [
    {
      "id": "UUID",
      "sender": "enum: ['user', 'assistant']",
      "content": "string",
      "timestamp": "Date",
      "relatedTopics": ["string"]
    }
  ],
  "title": "string",
  "context": {
    "topic": "string (optional)",
    "subtopics": ["string"],
    "difficulty": "string"
  },
  "resolved": "boolean",
  "helpfulRating": "number (1-5, optional)",
  "createdAt": "Date (auto)",
  "updatedAt": "Date (auto)"
}
```

**Indexes**:
- Index on `userId`
- Index on `conversationId` (unique)
- Index on `courseId`
- Index on `createdAt`

**Queries**:
```javascript
// Get user's conversations
ChatHistory.find({ userId: userId }).sort({ createdAt: -1 })

// Add message
ChatHistory.findOneAndUpdate(
  { conversationId: conversationId, userId: userId },
  { $push: { messages: newMessage } }
)
```

## Relationships Diagram

```
User
├── (1:N) → Syllabus
│   └── (1:1) → Course
│       ├── (1:N) → StudyPlan
│       ├── (1:N) → RevisionSchedule
│       └── (1:N) → PerformanceMetrics
└── (1:N) → ChatHistory
```

## Data Integrity Rules

### Cascading Deletes
```javascript
// When user deleted, cascade delete:
- All syllabi
- All courses
- All study plans
- All revision schedules
- All performance metrics
- All chat histories

// When course deleted, cascade delete:
- All study plans
- All revision schedules
- All performance metrics
```

### Field Validation
```javascript
// User email: must be valid email format
// User password: minimum 6 characters, hashed
// Study hours: 0 < hours <= 8
// Accuracy: 0-100 percentage
// Easiness factor: 1.3-5.0 (SM-2 algorithm)
// Quality rating: 0-5 scale
```

## Performance Optimization

### Indexing Strategy
```javascript
// Most common queries are indexed:
db.users.createIndex({ email: 1 }, { unique: true })
db.syllabi.createIndex({ userId: 1, createdAt: -1 })
db.courses.createIndex({ userId: 1 })
db.studyplans.createIndex({ courseId: 1, status: 1 })
db.revisionschedules.createIndex({ userId: 1, courseId: 1, 'revisionCards.nextReviewDate': 1 })
db.performancemetrics.createIndex({ userId: 1, courseId: 1 }, { unique: true })
db.chathistories.createIndex({ userId: 1, createdAt: -1 })
```

### Query Optimization
- Use projection to limit returned fields
- Paginate large result sets
- Cache frequently accessed data
- Use aggregation pipeline for complex queries

### Data Retention Policy
- Keep all user data indefinitely
- Archive old chat histories after 1 year (optional)
- Delete accounts only on explicit user request

## Sample Data Queries

### Get User's Complete Study Status
```javascript
const userId = ObjectId("...");

const user = await User.findById(userId);
const courses = await Course.find({ userId });
const metrics = await PerformanceMetrics.find({ userId });
const revisionStats = await RevisionSchedule.aggregate([
  { $match: { userId } },
  {
    $group: {
      _id: '$courseId',
      totalCards: { $sum: '$totalCards' },
      masteredCards: { $sum: '$masteredCards' }
    }
  }
]);
```

### Get This Week's Study Progress
```javascript
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const weekProgress = await PerformanceMetrics.findOne({
  userId,
  courseId
}).then(metrics => ({
  dailyData: metrics.dailyStats.filter(d => d.date >= oneWeekAgo),
  weeklyData: metrics.weeklyStats
}));
```

### Get Cards Due for Review Today
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const dueCards = await RevisionSchedule.findOne({
  _id: scheduleId,
  userId
}).then(schedule => 
  schedule.revisionCards.filter(card =>
    new Date(card.nextReviewDate) <= new Date()
  )
);
```

## Export/Import

### Export Collection to JSON
```bash
mongoexport --uri "mongodb://localhost:27017/sleek-syllabus" --collection users --out users.json
```

### Import Collection from JSON
```bash
mongoimport --uri "mongodb://localhost:27017/sleek-syllabus" --collection users --file users.json
```

---

**Complete, optimized, and production-ready database schema.**
