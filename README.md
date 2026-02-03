# Playto Community Platform

A full-stack social media platform built with Django (backend) and React (frontend), featuring user authentication, posts with images, nested comments, real-time karma leaderboard, and like functionality.

## 🌟 Features

- **User Authentication**: JWT-based login and registration
- **Post Creation**: Create posts with text and/or images
- **Nested Comments**: Threaded comment system with unlimited nesting
- **Like System**: Like posts and comments with karma tracking
- **Leaderboard**: Real-time 24-hour karma leaderboard
- **User Profiles**: View profile with rank and karma statistics
- **Responsive Design**: Mobile-friendly UI with gradient aesthetics

## 🏗️ Tech Stack

### Backend
- **Django 6.0.1**: Web framework
- **Django REST Framework**: API development
- **JWT Authentication**: djangorestframework-simplejwt
- **PostgreSQL**: Database (SQLite for local dev)
- **Pillow**: Image processing

### Frontend
- **React 19**: UI framework
- **React Router v7**: Client-side routing
- **Vite**: Build tool and dev server
- **Modern CSS**: Gradients and responsive design

## 📋 Prerequisites

- **Docker & Docker Compose** (recommended) OR
- **Python 3.11+** and **Node.js 20+** (for manual setup)
- **Git**

## 🚀 Quick Start (Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/playto-community.git
cd playto-community
```

### 2. Start the Application
```bash
docker-compose up --build
```

This will:
- Start PostgreSQL database
- Run Django backend on `http://localhost:8000`
- Serve React frontend on `http://localhost:80`

### 3. Create a Superuser (Optional)
```bash
docker-compose exec backend python manage.py createsuperuser
```

### 4. Access the Application
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## 🛠️ Manual Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

**Note**: Update API URLs in frontend code to point to `http://localhost:8000`

## 🌐 Deployment to Google Cloud Platform

### Prerequisites
- GCP Account with billing enabled
- gcloud CLI installed and configured

### Setup Steps

1. **Configure Project**
```bash
# Edit deploy-gcp.sh and update:
PROJECT_ID="your-gcp-project-id"
```

2. **Deploy**
```bash
chmod +x deploy-gcp.sh
./deploy-gcp.sh
```

3. **Update Environment Variables**
After deployment, update the backend's `ALLOWED_HOSTS` and frontend's API URL with the actual Cloud Run URLs.

### Manual GCP Deployment

#### 1. Setup Cloud SQL
```bash
gcloud sql instances create playto-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1

gcloud sql databases create playto_community \
  --instance=playto-db
```

#### 2. Build & Push Images
```bash
# Backend
docker build -t gcr.io/[PROJECT-ID]/playto-backend ./backend
docker push gcr.io/[PROJECT-ID]/playto-backend

# Frontend
docker build -t gcr.io/[PROJECT-ID]/playto-frontend ./frontend
docker push gcr.io/[PROJECT-ID]/playto-frontend
```

#### 3. Deploy to Cloud Run
```bash
# Backend
gcloud run deploy playto-backend \
  --image gcr.io/[PROJECT-ID]/playto-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Frontend
gcloud run deploy playto-frontend \
  --image gcr.io/[PROJECT-ID]/playto-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📁 Project Structure

```
playto-community/
├── backend/
│   ├── accounts/          # User authentication
│   ├── posts/             # Post management
│   ├── comments/          # Nested comments
│   ├── likes/             # Like functionality
│   ├── karma/             # Leaderboard & karma
│   ├── backend/           # Django settings
│   ├── Dockerfile
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── cloudbuild.yaml
├── deploy-gcp.sh
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/accounts/register/` - Register new user
- `POST /api/accounts/login/` - Login user
- `POST /api/accounts/logout/` - Logout user
- `POST /api/accounts/token/refresh/` - Refresh JWT token

### Posts
- `GET /api/posts/` - List posts (with ?limit=N)
- `POST /api/posts/` - Create post (requires auth)

### Comments
- `GET /api/comments/post/<id>/` - Get comments for post
- `POST /api/comments/post/<id>/` - Add comment (requires auth)

### Likes
- `POST /api/likes/post/<id>/` - Toggle post like (requires auth)
- `POST /api/likes/comment/<id>/` - Toggle comment like (requires auth)

### Leaderboard
- `GET /api/leaderboard/` - Top 5 users (24h karma)
- `GET /api/leaderboard/me/` - Current user's rank (requires auth)

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com
```

**Frontend** (build-time):
```env
VITE_API_URL=https://your-backend-url.com
```

## 📝 Usage

1. **Register**: Create a new account
2. **Login**: Access your dashboard
3. **Create Posts**: Share text and/or images
4. **Engage**: Like posts and add nested comments
5. **Track Karma**: View leaderboard to see top contributors
6. **Profile**: Check your rank and karma score

## 🐛 Troubleshooting

### Docker Issues
```bash
# Reset everything
docker-compose down -v
docker-compose up --build
```

### Database Migrations
```bash
# Inside backend container
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### CORS Errors
Update `CORS_ALLOWED_ORIGINS` in `backend/backend/settings.py` with your frontend URL.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Suraj Kumar - [GitHub Profile](https://github.com/surajk86808)

## 🙏 Acknowledgments

- Django & React communities
- Playto for the challenge
- AI assistance in development
