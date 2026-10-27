# IMovies – Movie ticket booking made simple

A MERN stack app where users browse movies, pick a show, choose seats and book tickets, and admins manage movies, theatres and shows.

**Stack:** React (Vite) · Express · MongoDB (Mongoose) · JWT auth · bcrypt

## Features

**Users**
- Register / login (JWT, hashed passwords)
- Browse and search movies, filter by genre
- Movie page with trailer, rating, reviews and showtimes grouped by date and theatre
- Seat picker with Balcony / Middle / Lower sections and live price total
- Seat booking is atomic: two people can never book the same seat
- My bookings, favorites, profile (change username / password)
- Light and dark theme

**Admins**
- Separate admin register / login
- Add, edit and delete movies
- Add and delete theatres (seat prices and counts per section)
- Create and delete shows
- Dashboard with your shows, all bookings and total revenue

## Project structure

```
IMovies/
├── package.json            one-command scripts (install-all, seed, dev)
├── docs/                   demo video (IMovies-demo.mp4) and screenshots
├── client/                 React frontend (Vite)
│   └── src/
│       ├── components/     Navbar, MovieCard, Poster, BookingCard, route protection
│       ├── context/        AuthContext (login state)
│       ├── hooks/          useFetch
│       ├── pages/          user pages
│       │   └── admin/      admin pages
│       ├── api.js          axios instance with the JWT interceptor
│       └── index.css       all styles
└── server/                 Express backend
    ├── controllers/        request handlers
    ├── middlewares/        fetchUser (JWT), error handler
    ├── models/             Mongoose schemas
    ├── routes/             API routes
    ├── utils/              db connection, env loader, seat helpers, seed script
    └── server.js
```

## Screenshots

| Landing | Movies | Movie details |
|---|---|---|
| ![Landing](docs/screenshots/01-landing.png) | ![Home](docs/screenshots/03-home.png) | ![Movie](docs/screenshots/05-movie.png) |

| Seat selection | My bookings | Admin dashboard |
|---|---|---|
| ![Seats](docs/screenshots/06-seats.png) | ![Bookings](docs/screenshots/07-bookings.png) | ![Admin](docs/screenshots/10-admin-dashboard.png) |

More in [`docs/screenshots`](docs/screenshots).

## Demo video

[`docs/IMovies-demo.mp4`](docs/IMovies-demo.mp4) (about 70 seconds): a user registers, browses and searches movies, adds a favorite, picks seats and books; then the admin views the dashboard, adds a theatre, adds a movie and schedules a show.

## Running it locally

**Prerequisites:** Node.js 18+, and a MongoDB database (local install or a free MongoDB Atlas cluster).

### Quick start (one terminal)

From the `IMovies` folder:

```bash
npm run install-all          # installs root, server and client packages
copy server\.env.example server\.env   # then set MONGO_URI in server/.env
npm run seed                 # optional demo data
npm run dev                  # starts backend (8000) and frontend (5173) together
```

Open **http://localhost:5173**. `JWT_SECRET` is generated automatically on first run if you leave the placeholder.

### Or run each part separately

### 1. Backend

```bash
cd server
npm install
copy .env.example .env      # Windows   (macOS/Linux: cp .env.example .env)
```

Open `server/.env` and set `MONGO_URI` (for Atlas: `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/imovies?retryWrites=true&w=majority`).

Optional – load demo data (4 movies, 2 theatres, shows for the next two days, and two accounts):

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

It runs on **http://localhost:8000**. You should see `Connected to MongoDB`.

### 2. Frontend (new terminal)

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**. Requests to `/api` are proxied to the backend automatically.

### Demo accounts (after `npm run seed`)

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | admin@imovies.com   | admin12345  |
| User  | user@imovies.com    | user12345   |

## API reference

| Method | Endpoint                         | Access | Purpose |
|--------|----------------------------------|--------|---------|
| POST   | `/api/auth/register`             | public | Create user account |
| POST   | `/api/auth/login`                | public | User login |
| GET/PUT| `/api/auth/me`                   | user   | View / update profile |
| POST   | `/api/auth/admin/register`       | public | Create admin account |
| POST   | `/api/auth/admin/login`          | public | Admin login |
| GET    | `/api/auth/admin/bookings`       | admin  | All bookings |
| GET    | `/api/movie?search=&genre=`      | public | List movies |
| GET    | `/api/movie/:id`                 | public | Movie + average rating |
| POST/PUT/DELETE | `/api/movie[/:id]`      | admin  | Manage movies |
| GET    | `/api/theatre`                   | public | List theatres |
| POST/DELETE | `/api/theatre[/:id]`        | admin  | Manage theatres |
| GET    | `/api/shows/movie/:movieId`      | public | Upcoming shows for a movie |
| GET    | `/api/shows/:id`                 | public | Show with theatre and booked seats |
| GET    | `/api/shows/admin/mine`          | admin  | Shows created by this admin |
| POST/DELETE | `/api/shows[/:id]`          | admin  | Manage shows |
| POST   | `/api/bookings`                  | user   | Book seats `{ showId, seats: { balcony: ["B1"], middle: [], lower: [] } }` |
| GET    | `/api/bookings/my`               | user   | My bookings |
| GET    | `/api/favorite`                  | user   | My favorite movies |
| POST   | `/api/favorite/:movieId`         | user   | Toggle favorite |
| GET    | `/api/reviews/:movieId`          | public | Reviews for a movie |
| POST/DELETE | `/api/reviews/:movieId`     | user   | Add/update or remove my review |

Protected routes need the header `Authorization: Bearer <token>`.

## How seat booking works

Each theatre has a seat count and price for three sections. Seats are numbered `B1…Bn` (balcony), `M1…Mn` (middle), `L1…Ln` (lower). Every show keeps a list of booked seat numbers per section.

When a user books, the server reserves the seats with a single conditional update: it only succeeds if none of the requested seats are already in the booked list. If two users try to book the same seat at the same moment, one succeeds and the other gets a "seats were just booked" message. The total price is calculated on the server from the theatre's prices, never trusted from the browser.

## Deployment

- **Database:** MongoDB Atlas (free tier). Put the connection string in `MONGO_URI`.
- **Backend:** Render / Railway. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (your frontend URL) as environment variables. Start command: `npm start`.
- **Frontend:** Vercel / Netlify. Root directory `client`, build command `npm run build`, output `dist`. Set `VITE_API_URL` to your backend URL. On Vercel add a rewrite of all routes to `/index.html` so page refreshes work.
