# Anieflix

Anieflix is a simple movie streaming project inspired by Netflix. The backend is built with **Flask** and the frontend uses **React** with Vite and Tailwind CSS. The application demonstrates user authentication, email verification, and basic movie browsing features.

## Project structure

```
netflix-project/
├── backend/      # Flask API and utility scripts
├── frontend/     # React application
└── function.md   # Planned feature list (Vietnamese)
```

## Requirements

- Python 3.10+
- Node.js 18+
- A MySQL database

Copy `.env.example` to `.env` and fill in database credentials and email/JWT secrets before running the services.

## Backend setup

```bash
cd backend
pip install -r requirements.txt
python app.py  # starts the Flask server on http://localhost:5000
```

`import_tmdb_movies.py` can be used to import sample movies from TMDB:

```bash
python import_tmdb_movies.py trending
```

## Frontend setup

```bash
cd frontend/anieflix
npm install
npm run dev  # starts Vite on http://localhost:5173
```

## Implemented features

- User registration with email verification
- Login using JWT tokens
- Profile page allowing basic information update and password change
- Forgot password & reset via email
- Browse movies and view detailed information
- Mark movies as favorites

## Planned features (not yet implemented)

The file `function.md` lists additional ideas for the project. Features that are currently missing include:

- Watch history tracking
- Movie rating and recommendations
- Playlists / watchlist management
- Multi-language interface and full mobile responsiveness

Contributions are welcome to help complete these items.
