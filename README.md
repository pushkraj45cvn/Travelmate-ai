# ✈️ TravelMate AI - Smart Travel Planner

A production-ready MERN stack travel planner application with AI-powered tools for itinerary planning, expense tracking, group collaboration, and more.

## 🚀 Features

### Core Features
- **Smart Itinerary Planner** - Day-by-day planning with activities, times, and costs
- **Expense Tracking** - Track spending by category with visual charts and budget monitoring
- **Group Collaboration** - Invite friends with editor/viewer roles, real-time chat
- **Expense Splitting** - Splitwise-like functionality (equal, percentage, custom splits)
- **Packing Lists** - Categorized packing with progress tracking and priorities
- **Interactive Maps** - Visualize destinations and attractions with OpenStreetMap
- **Photo Gallery** - Upload and organize trip photos and videos
- **Document Storage** - Securely store passports, visas, tickets on Cloudinary
- **Real-time Chat** - Trip-specific group chat with Socket.io
- **Notifications** - Real-time alerts for invites, expenses, and updates

### User Features
- **Dashboard** - Overview of trips, expenses, and packing progress with charts
- **Destination Explorer** - Discover popular destinations with detailed information
- **Wishlist** - Save favorite destinations for future trips
- **User Profile** - Customize preferences, currency, and language
- **Dark Mode** - Full dark/light theme support

### Admin Features
- User management (suspend/activate accounts)
- Trip management (view/delete any trip)
- Analytics dashboard with charts and statistics

### Security
- JWT authentication with refresh tokens
- bcrypt password hashing
- Email verification
- Password reset flow
- Helmet security headers
- CORS configuration
- Rate limiting
- MongoDB injection protection
- Input validation

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 (Vite) | Frontend framework |
| React Router DOM | Routing |
| Tailwind CSS | Styling |
| Redux Toolkit | State management |
| TanStack Query | Server state management |
| Axios | HTTP client |
| Framer Motion | Animations |
| React Hook Form | Form handling |
| React Icons | Icons |
| Chart.js | Data visualization |
| React Leaflet | Interactive maps |
| React Toastify | Notifications |
| Socket.io Client | Real-time features |
| @dnd-kit | Drag and drop |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Socket.io | Real-time communication |
| Cloudinary | Media storage |
| Nodemailer | Email service |
| Swagger | API documentation |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| express-mongo-sanitize | NoSQL injection prevention |

## 📁 Project Structure

```
travelmate-ai/
├── client/                          # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # Admin panel components
│   │   │   ├── auth/                # Authentication components
│   │   │   ├── chat/                # Chat components
│   │   │   ├── common/              # Shared components (Card, Modal, etc.)
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   ├── expenses/            # Expense components
│   │   │   ├── gallery/             # Gallery components
│   │   │   ├── itinerary/           # Itinerary components
│   │   │   ├── landing/             # Landing page components
│   │   │   ├── maps/                # Map components
│   │   │   ├── packing/             # Packing list components
│   │   │   └── trips/               # Trip management components
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   └── admin/
│   │   ├── redux/
│   │   │   └── slices/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                          # Backend (Node + Express)
│   ├── config/                      # DB, Cloudinary, Nodemailer, Swagger configs
│   ├── controllers/                 # Route handlers
│   ├── middlewares/                  # Auth, Error, Upload middleware
│   ├── models/                      # Mongoose schemas (14 models)
│   ├── routes/                      # API routes
│   ├── services/                    # Business logic services
│   ├── socket/                      # Socket.io setup
│   ├── utils/                       # Helpers, ErrorResponse, Seeder
│   ├── validators/                  # Express-validator rules
│   ├── uploads/                     # Upload directory
│   ├── templates/                   # Email templates
│   ├── index.js                     # Entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🗄️ Database Collections

| Collection | Description |
|------------|-------------|
| users | User accounts with auth fields |
| trips | Trip details with collaborators |
| itineraries | Day-wise activity plans |
| expenses | Trip expenses with split info |
| expensesplits | Split calculations and settlements |
| invitations | Trip collaboration invites |
| packinglists | Packing items by category |
| documents | Travel document storage |
| galleries | Photos and videos |
| destinations | Pre-populated destination data |
| reviews | User reviews and ratings |
| wishlists | Saved destinations |
| notifications | Real-time notifications |
| chats | Trip chat rooms |
| messages | Chat messages |

## 🚦 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| PUT | `/api/auth/reset-password/:token` | Reset password |
| PUT | `/api/auth/update-password` | Update password |
| POST | `/api/auth/refresh-token` | Refresh JWT |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/verify-email/:token` | Verify email |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | Get all user trips |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/:id` | Get single trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |
| POST | `/api/trips/:id/duplicate` | Duplicate trip |
| PUT | `/api/trips/:id/archive` | Toggle archive |
| PUT | `/api/trips/:id/status` | Update status |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips/:tripId/expenses` | Get trip expenses |
| POST | `/api/trips/:tripId/expenses` | Add expense |
| GET | `/api/trips/:tripId/expenses/summary` | Get expense summary |
| GET | `/api/trips/:tripId/splits` | Get split calculations |

### And more...
Full API documentation available at `/api-docs` when server is running.

## 🛠️ Installation

### Prerequisites
- Node.js v18+ 
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for media uploads)
- Gmail account with App Password (for emails)

### Step 1: Clone & Install
```bash
# Clone the repository
git clone <repository-url>
cd travelmate-ai

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Configure Environment

**Server `.env`** (`server/.env`):
```env
NODE_ENV=development
PORT=5000

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/travelmate-ai

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@travelmate-ai.com
FROM_NAME=TravelMate AI

CLIENT_URL=http://localhost:5173
```

### Step 3: Seed Database
```bash
cd server
node utils/seeder.js
```

### Step 4: Run the Application
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Step 5: Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Docs (Swagger)**: http://localhost:5000/api-docs

## 🚀 Deployment

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy the 'dist' folder to Vercel
```

### Backend → Render
1. Push to GitHub
2. Create new Web Service on Render
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables

### Database → MongoDB Atlas
1. Create free cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in environment

## 🧪 Testing
```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test
```

## 📸 Screenshots

### Landing Page
- Hero with gradient design
- Features grid (6 cards)
- Popular destinations
- Testimonials carousel
- Pricing plans
- FAQ accordion
- Contact section
- Responsive footer

### Dashboard
- Stats cards (trips, budget, progress)
- Upcoming trips list
- Expense doughnut chart
- Monthly spending line chart
- Upcoming events calendar

### Trip Management
- Grid view with cover images
- Search and filter by status
- Quick actions (edit, duplicate, archive, delete)
- Pagination
- Trip detail with all sub-sections

### Itinerary Planner
- Day-by-day organization
- Morning/Afternoon/Evening/Night sections
- Add/edit/delete activities
- Time and cost tracking

### Expense Tracker
- Category breakdown with percentages
- Doughnut chart visualization
- Budget vs spending comparison
- Add expense modal
- Delete with confirmation

### Interactive Maps
- Destination markers
- Nearby attractions
- Route visualization

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License
MIT License - see LICENSE file for details

## 👨‍💻 Author
TravelMate AI Development Team

---

**Built with ❤️ using the MERN Stack**
