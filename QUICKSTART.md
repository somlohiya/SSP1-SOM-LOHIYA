# Quick Start Guide - Sleek Syllabus Planner

Get Sleek running in 5 minutes!

## Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Code editor (VS Code recommended)

## Step 1: Clone & Install

```bash
# Clone the repository (if using git)
git clone <repo-url>
cd sleek-syllabus-planner

# Or extract the downloaded ZIP and navigate to the folder

# Install dependencies
pnpm install
```

## Step 2: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Copy connection string

## Step 3: Configure Environment

```bash
# Create environment file
cp .env.example .env.local
```

Edit `.env.local`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sleek-syllabus

# JWT Secret (change this in production!)
JWT_SECRET=your-secret-key-here

# Server
PORT=5000
NODE_ENV=development

# API
API_URL=http://localhost:5000
```

## Step 4: Start Development Servers

**Option A: Both servers in one command**
```bash
pnpm run dev:full
```

**Option B: Separate terminals**
```bash
# Terminal 1 - Frontend
pnpm run dev

# Terminal 2 - Backend
pnpm run dev:server
```

## Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health

## Testing the Application

### Create Account
1. Visit http://localhost:3000
2. Click "Get Started"
3. Fill in signup form
4. Click "Sign Up"

### Upload Syllabus
1. Click "Upload Syllabus"
2. Fill in course details:
   - Course Title: "Introduction to Biology"
   - Subject: "Biology"
   - Semester: "Fall 2024"
3. Paste sample syllabus content (see below)
4. Click "Create Course"

### Sample Syllabus Content
```
INTRODUCTION TO BIOLOGY

Chapter 1: The Basics of Life
- What is life?
- Cell structure and function
- Taxonomy and classification

Chapter 2: Genetics
- DNA and RNA
- Heredity and variation
- Evolution

Chapter 3: Photosynthesis
- Light reactions
- Calvin cycle
- Chloroplast structure

Chapter 4: Cellular Respiration
- Glycolysis
- Citric acid cycle
- Oxidative phosphorylation

Chapter 5: Ecology
- Ecosystems
- Population dynamics
- Community interactions
```

### Create Study Plan
1. From course page, click "Create Study Plan"
2. Set daily study hours: 2
3. Select learning style: Mixed
4. Click "Create Study Plan"

### Practice Revision
1. Create a revision schedule with flashcards
2. Add questions and answers
3. Review flashcards and rate your knowledge
4. System tracks your progress with spaced repetition

### Check Analytics
1. Click "View Analytics"
2. See your study progress and insights
3. Get personalized recommendations

## Troubleshooting

### Frontend won't load
- Check if `pnpm run dev` is running
- Clear browser cache: Ctrl+Shift+Delete
- Check console for errors: F12

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# If in use, change PORT in .env.local to different port
PORT=5001
```

### MongoDB connection error
```bash
# Check MongoDB is running
mongosh

# If error, start MongoDB
mongod

# Or check MongoDB Atlas connection string is correct
```

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Clear cache and restart
```bash
# Clear Next.js cache
rm -rf .next

# Clear MongoDB cache
mongosh
> db.dropDatabase()

# Restart servers
```

## Project Structure Overview

```
sleek-syllabus-planner/
├── app/                    # Next.js pages
├── server/                 # Express backend
├── lib/                    # Frontend utilities
├── components/             # React components
├── public/                 # Static files
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md              # Full documentation
```

## Key Files to Know

- **`app/page.tsx`** - Landing page
- **`app/dashboard/page.tsx`** - Main app dashboard
- **`server/index.js`** - Backend server setup
- **`lib/api.ts`** - API client for frontend
- **`server/models/`** - Database schemas
- **`server/routes/`** - API endpoints

## Common Tasks

### Add a New Page
```bash
# Create file: app/my-page/page.tsx
# Add content and it automatically routes to /my-page
```

### Test an API Endpoint
```bash
# Using curl
curl http://localhost:5000/health

# Or use Postman/Insomnia
# POST http://localhost:5000/api/auth/login
# Body: {"email":"user@example.com","password":"password"}
```

### Check Database
```bash
# Connect to MongoDB
mongosh

# Select database
use sleek-syllabus

# View collections
show collections

# Query users
db.users.find()
```

## Next Steps

1. **Explore the app** - Test all features
2. **Review code** - Check `server/routes/` for API endpoints
3. **Integrate AI** - Follow `AI_INTEGRATION.md` to add Claude/GPT
4. **Deploy** - See README.md for deployment options
5. **Customize** - Modify colors, add features, integrate services

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## Getting Help

- Check the `README.md` for comprehensive documentation
- Review `server/routes/` for API endpoint examples
- Check browser console (F12) for frontend errors
- Check terminal for backend errors
- MongoDB Compass can help visualize database

## Production Deployment

When ready to deploy:

1. Update `JWT_SECRET` to a strong random string
2. Set `NODE_ENV=production`
3. Use MongoDB Atlas for database
4. Deploy frontend to Vercel: `vercel deploy`
5. Deploy backend to Heroku/Railway/etc
6. Update `API_URL` to production backend URL
7. Enable HTTPS everywhere

---

**You're ready to go! Happy learning!** 🚀
