# Sleek Syllabus Planner

An AI-powered study platform that helps students master their coursework with intelligent scheduling, spaced repetition, and personalized learning plans.

## Features

- **Smart Syllabus Upload**: Upload your course syllabus and automatically extract topics and study material
- **Intelligent Scheduling**: AI-powered study plan generation optimized for different learning styles
- **Spaced Repetition**: SM-2 algorithm for optimal retention and long-term memory
- **Progress Analytics**: Comprehensive tracking of study habits, streaks, and performance metrics
- **AI Tutor**: Chat with an intelligent assistant for instant help and clarification
- **Revision Schedule**: Flashcard system with adaptive scheduling based on performance

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui with Tailwind CSS
- **Styling**: Dark mode optimized with custom color system
- **State Management**: React hooks + SWR for data fetching

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based sessions with bcrypt password hashing
- **Algorithms**: SM-2 spaced repetition, Leitner system, custom scheduling

## Project Structure

```
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx           # Login page
│   ├── signup/page.tsx          # Registration page
│   ├── dashboard/page.tsx       # Main dashboard
│   ├── upload/page.tsx          # Syllabus upload
│   ├── course/[id]/page.tsx     # Course details
│   ├── planner/page.tsx         # Study plan creation
│   ├── planner/[id]/page.tsx    # Study plan details
│   ├── revision/page.tsx        # Revision schedule creation
│   ├── revision/[id]/page.tsx   # Flashcard study interface
│   ├── chat/page.tsx            # AI tutor chat
│   ├── analytics/page.tsx       # Learning analytics
│   ├── settings/page.tsx        # User settings
│   └── layout.tsx               # Root layout
├── server/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Syllabus.js
│   │   ├── Course.js
│   │   ├── StudyPlan.js
│   │   ├── RevisionSchedule.js
│   │   ├── PerformanceMetrics.js
│   │   └── ChatHistory.js
│   ├── routes/
│   │   ├── auth.js              # Auth endpoints
│   │   ├── syllabi.js           # Syllabus management
│   │   ├── courses.js           # Course management
│   │   ├── studyPlans.js        # Study plan endpoints
│   │   ├── revision.js          # Revision endpoints
│   │   ├── analytics.js         # Analytics endpoints
│   │   └── chat.js              # Chat endpoints
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── utils/
│   │   ├── algorithms.js        # SM-2, scheduling, streak calculation
│   │   └── helpers.js           # Utility functions
│   └── index.js                 # Express app setup
├── lib/
│   └── api.ts                   # Frontend API client
├── components/
│   └── ui/                      # shadcn/ui components
└── public/                      # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- pnpm (or npm/yarn)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd sleek-syllabus-planner
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sleek-syllabus

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Server
PORT=5000
NODE_ENV=development

# API
API_URL=http://localhost:5000
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run the development server**

Option A - Run frontend and backend separately:
```bash
# Terminal 1 - Frontend
pnpm run dev

# Terminal 2 - Backend
pnpm run dev:server
```

Option B - Run both concurrently:
```bash
pnpm run dev:full
```

6. **Open the app**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update preferences

### Syllabi
- `POST /api/syllabi/upload` - Upload syllabus
- `GET /api/syllabi` - Get all syllabi
- `GET /api/syllabi/:id` - Get single syllabus
- `POST /api/syllabi/:id/create-course` - Create course from syllabus
- `DELETE /api/syllabi/:id` - Delete syllabus

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `PATCH /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Study Plans
- `POST /api/study-plans` - Create study plan
- `GET /api/study-plans/course/:courseId` - Get plans for course
- `GET /api/study-plans/:id` - Get plan details
- `PATCH /api/study-plans/:id` - Update plan
- `PATCH /api/study-plans/:id/sessions/:sessionId/complete` - Mark session complete
- `DELETE /api/study-plans/:id` - Delete plan

### Revision
- `POST /api/revision` - Create revision schedule
- `GET /api/revision/course/:courseId` - Get schedules for course
- `GET /api/revision/:id/due` - Get due cards for review
- `POST /api/revision/:id/review` - Submit card review
- `DELETE /api/revision/:id` - Delete schedule

### Analytics
- `GET /api/analytics/:courseId` - Get metrics
- `POST /api/analytics/:courseId/daily-session` - Record study session
- `GET /api/analytics/:courseId/summary` - Get progress summary

### Chat
- `POST /api/chat` - Create conversation
- `GET /api/chat` - Get conversations
- `GET /api/chat/:conversationId` - Get conversation
- `POST /api/chat/:conversationId/messages` - Add message
- `PATCH /api/chat/:conversationId/rate` - Rate conversation
- `DELETE /api/chat/:conversationId` - Delete conversation

## Key Algorithms

### SM-2 Spaced Repetition
Implements the SuperMemo 2 algorithm for optimal review scheduling:
- Initial review: 1 day
- Second review: 3 days
- Subsequent: `interval × easiness factor`
- Easiness factor adjusts based on response quality (0-5)

### Smart Study Planning
- Analyzes total estimated hours and daily availability
- Distributes topics intelligently across calendar
- Respects learning style preferences
- Generates optimized session schedules

### Progress Tracking
- Daily study hours and accuracy metrics
- Current and longest study streaks
- Weekly and monthly performance summaries
- Topic completion tracking

## Development

### Adding New Pages
1. Create file in `app/[route]/page.tsx`
2. Import API client from `lib/api.ts`
3. Use shadcn/ui components from `components/ui/`
4. Follow the dark theme with Tailwind CSS

### Adding New API Endpoints
1. Create route file in `server/routes/`
2. Import models and utilities
3. Add route handler functions
4. Import in `server/index.js`

### Database Schema Changes
1. Update model in `server/models/`
2. No migration needed (MongoDB is flexible)
3. Update types in frontend as needed

## Deployment

### Vercel (Recommended for Frontend)
```bash
pnpm run build
vercel deploy
```

### Self-hosted (Backend + Frontend)
1. Set up Node.js environment
2. Configure MongoDB connection
3. Build Next.js: `pnpm run build`
4. Run with: `NODE_ENV=production pnpm run dev:server` and `next start`

### Environment Variables
Update for production:
- `JWT_SECRET` - Use strong random string
- `MONGODB_URI` - Use MongoDB Atlas or self-hosted instance
- `API_URL` - Point to production backend
- `NODE_ENV` - Set to `production`

## Future Enhancements

- [ ] Real Claude AI integration for AI tutor
- [ ] PDF/image upload support for syllabi
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Collaborative study groups
- [ ] Integration with calendar apps
- [ ] Performance predictions
- [ ] Gamification (achievements, badges)

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API examples

## Acknowledgments

- Built with Next.js, Express, and MongoDB
- UI components from shadcn/ui
- Inspired by Anki, SuperMemo, and Quizlet
- Uses SM-2 spaced repetition algorithm

---

**Made with ❤️ to help students study smarter**
