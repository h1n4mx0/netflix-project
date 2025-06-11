# Anieflix

Anieflix is a Netflix-inspired streaming platform built with **Flask (Python)** backend and **React + Vite + Tailwind CSS** frontend. The application features user authentication, email verification, movie/show browsing, commenting system, and video streaming capabilities.

## 🎯 Features

### ✅ Implemented
- **User Management**
  - Registration with email verification
  - Login/Logout with JWT authentication
  - Profile management (update info, change password)
  - Password reset via email
  - Favorites system for movies and shows

- **Content Browsing**
  - Browse movies and TV shows
  - Detailed movie/show information pages
  - Search functionality
  - Category-based filtering

- **Interactive Features**
  - Anonymous commenting system with likes/dislikes
  - Reply to comments
  - Real-time comment reactions

- **Video Streaming**
  - HLS video streaming for shows
  - Episode navigation
  - Custom video player with controls

- **UI/UX**
  - Responsive design with Tailwind CSS
  - Dark/Light theme support
  - Netflix-inspired interface
  - Mobile-friendly navigation

### 🚧 Planned Features
- Watch history tracking
- Rating and recommendation system
- Advanced playlist management
- Multi-language support
- Admin panel for content management

## 🏗️ Project Structure

```
anieflix/
├── backend/                 # Flask API server
│   ├── routes/             # API route handlers
│   │   ├── comments.py     # Comment system
│   │   ├── favorites.py    # Favorites management
│   │   ├── movies.py       # Movie endpoints
│   │   ├── shows.py        # TV shows endpoints
│   │   ├── stream.py       # Video streaming
│   │   ├── login.py        # Authentication
│   │   └── ...
│   ├── utils/              # Utility functions
│   ├── static/             # Static assets (posters, videos)
│   ├── app.py              # Flask application entry point
│   ├── db.py               # Database configuration
│   └── requirements.txt    # Python dependencies
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── context/        # React context providers
│   │   └── utils/          # Frontend utilities
│   ├── public/             # Public assets
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite configuration
├── database/
│   └── anieflix.sql        # Database schema
└── README.md
```

## 🛠️ Requirements

- **Python** 3.8+
- **Node.js** 16+
- **MySQL/MariaDB** 5.7+
- **FFmpeg** (for video processing)

## ⚙️ Installation & Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd anieflix
```

### 2. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE anieflix_db;
USE anieflix_db;
SOURCE database/anieflix.sql;
```

### 3. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=anieflix_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Email Configuration
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# File Paths
MOVIE_VIDEO_PATH=C:/path/to/your/video/movies
SHOW_VIDEO_PATH=C:/path/to/your/video/shows
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env
```

### 5. Static Assets Setup
Create directories for static content:
```bash
# In backend directory
mkdir -p static/posters
mkdir -p static/backdrops
mkdir -p static/show-poster
mkdir -p static/show-thumbnail
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python app.py
```
Backend will run on: `http://localhost:5000`

### Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

## 📊 Database Schema

The application uses the following main tables:
- `users` - User accounts and authentication
- `movies` - Movie information and metadata
- `shows` - TV show information
- `show_episodes` - Individual episodes
- `favorites` - User favorites (movies/shows)
- `movie_comments` - Comments for movies
- `show_comments` - Comments for shows
- `movie_comment_reactions` - Like/dislike reactions
- `show_comment_reactions` - Like/dislike reactions

## 🎬 Adding Content

### Movies
1. Add movie metadata to the `movies` table
2. Place poster images in `backend/static/posters/`
3. Place backdrop images in `backend/static/backdrops/`
4. Add video files to your configured `MOVIE_VIDEO_PATH`

### TV Shows
1. Add show metadata to the `shows` table
2. Add episodes to the `show_episodes` table
3. Place poster images in `backend/static/show-poster/`
4. Place episode thumbnails in `backend/static/show-thumbnail/`
5. Add HLS video files to your configured `SHOW_VIDEO_PATH`

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with Werkzeug
- Email verification for new accounts
- CORS protection
- SQL injection prevention with parameterized queries
- Input validation and sanitization

## 🎨 Tech Stack

**Backend:**
- Flask (Python web framework)
- PyMySQL (MySQL database connector)
- JWT (JSON Web Tokens)
- Werkzeug (Password hashing)
- SMTP (Email functionality)

**Frontend:**
- React 18 (UI library)
- Vite (Build tool)
- Tailwind CSS (Styling)
- Lucide React (Icons)
- React Router (Navigation)
- Axios (HTTP client)
- Material-UI (UI components)

**Video:**
- HLS (HTTP Live Streaming)
- Custom video player with controls
- FFmpeg (video processing)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is for educational purposes. Please respect copyright laws when using with actual movie/show content.

## 🐛 Common Issues

**Database Connection Issues:**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database and tables exist

**Video Streaming Issues:**
- Verify video file paths in `.env`
- Ensure HLS files (.m3u8 and .ts) are properly generated
- Check FFmpeg installation for video processing

**Email Verification Issues:**
- Use App Password for Gmail (not regular password)
- Enable 2-factor authentication on email account
- Check spam folder for verification emails

## 📞 Support

For issues and questions, please open an issue on the GitHub repository or contact the maintainers.

---

**Made with ❤️ by the h1n4m**