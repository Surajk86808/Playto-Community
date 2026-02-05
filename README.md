# Playto Community Platform

A social platform I built for the Playto coding challenge. It's basically a mini social network where users can post stuff, comment on things, like content, and compete on a karma leaderboard.

## What I Built

The app has all the standard social media features you'd expect:

- Users can sign up and log in (JWT tokens for auth)
- Create posts with text and/or images
- Comment system with nested replies (you can reply to replies)
- Like posts and comments (gives karma to the author)
- 24-hour leaderboard showing who earned the most karma
- User profiles showing your rank and karma score

## Stack

**Backend:**
- Django 6.0.1 - went with Django because I'm comfortable with it
- Django REST Framework for the API
- JWT tokens for authentication
- PostgreSQL in production (SQLite for local dev)
- Cloudinary for image hosting

**Frontend:**
- React 19 - just used functional components and hooks
- React Router v7 for navigation
- Vite as the build tool
- Plain CSS (no frameworks, just gradients and flexbox)

## Running Locally

### With Docker (easiest)

```bash
git clone https://github.com/yourusername/playto-community.git
cd playto-community
docker-compose up --build
```

Then open http://localhost:3000 - that's it!

### Without Docker

If you prefer running things manually:

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Note: You'll need to update the API_BASE in `frontend/src/apiBase.js` to `http://localhost:8000`

## Deploying to Google Cloud

I deployed this on Google Cloud Run. There's a script for it:

```bash
chmod +x deploy-gcp.sh
./deploy-gcp.sh
```

Just make sure to update `PROJECT_ID` in the script first.

## Project Structure

```
playto-community/
├── backend/
│   ├── accounts/          # Login/register stuff
│   ├── posts/             # Post creation and retrieval
│   ├── comments/          # Nested comment system
│   ├── likes/             # Like functionality
│   ├── karma/             # Leaderboard calculations
│   └── backend/           # Settings and config
├── frontend/
│   ├── src/
│   │   ├── components/    # Navbar and reusable stuff
│   │   ├── pages/         # Main pages
│   │   └── styles/        # CSS files
│   └── ...
└── docker-compose.yml
```

## How Some Things Work

### Nested Comments

I used an adjacency list pattern - each comment has a `parent_id` field. To avoid N+1 queries, I fetch all comments in one go, then build the tree structure in Python. Works pretty well even with hundreds of comments.

### Leaderboard

The leaderboard aggregates karma from the last 24 hours using Django's ORM:

```python
KarmaTransaction.objects
    .filter(created_at__gte=now() - timedelta(hours=24))
    .values("user__username")
    .annotate(karma=Sum("points"))
    .order_by("-karma")[:5]
```

Single query, sorted in the database. Simple and fast.

### Image Upload

Images go to Cloudinary instead of the server. This keeps the backend stateless and makes deployment easier. The form sends a multipart upload and Django creates the post with the Cloudinary URL.

## Things I Fixed

The initial AI-generated code had some issues:

1. **Comment form state** - All posts shared one state variable, so typing in one box updated all of them. Fixed by using a dictionary keyed by post ID.

2. **N+1 queries** - Was hitting the database hundreds of times per page load. Added `select_related()` and `annotate()` to do everything in 1-2 queries.

3. **Missing auth checks** - Some endpoints would crash if you weren't logged in. Added permission classes and error handling.

## Known Issues

- No real-time updates (you have to refresh to see new content)
- No pagination yet (just shows latest 10 posts)
- Mobile UI could be better
- No direct messages or notifications
- Profile page is pretty basic

## If I Had More Time

- Add WebSockets for real-time updates
- Implement proper pagination with infinite scroll
- Add profile pictures and user bios
- Build a notification system
- Add post editing/deletion
- Maybe add hashtags or categories

## API Endpoints

Quick reference:

```
POST   /accounts/register/           - Create account
POST   /accounts/login/              - Get JWT tokens
POST   /accounts/logout/             - Logout
GET    /posts/                       - Get posts (use ?limit=N)
POST   /posts/                       - Create post (auth required)
GET    /comments/post/<id>/          - Get comments for a post
POST   /comments/post/<id>/          - Add comment (auth required)
POST   /likes/post/<id>/             - Toggle post like (auth required)
POST   /likes/comment/<id>/          - Toggle comment like (auth required)
GET    /leaderboard/                 - Top 5 users (24h)
GET    /leaderboard/me/              - Your rank (auth required)
```

## Environment Setup

**Backend** (`.env`):
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Frontend** (build-time):
```env
VITE_API_URL=https://your-backend-url.com
```

## Troubleshooting

**Docker not working?**
```bash
docker-compose down -v
docker-compose up --build
```

**Database issues?**
```bash
docker-compose exec backend python manage.py migrate
```

**CORS errors?**
Check `CORS_ALLOWED_ORIGINS` in `backend/backend/settings.py`

## Contributing

This was a solo project for a coding challenge, but if you want to fork it and improve it, go ahead! PRs welcome.

## License

MIT - do whatever you want with it.

## Author

Suraj Kumar - [GitHub](https://github.com/surajk86808)

Built this over a weekend for the Playto challenge. Learned a lot about nested data structures and query optimization along the way!
