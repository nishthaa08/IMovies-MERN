import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Loader from "./components/Loader";
import { UserProtection, AdminProtection, GuestOnly } from "./components/Protection";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const SeatsPage = lazy(() => import("./pages/SeatsPage"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMovies = lazy(() => import("./pages/admin/AdminMovies"));
const AddMovie = lazy(() => import("./pages/admin/AddMovie"));
const AddTheatre = lazy(() => import("./pages/admin/AddTheatre"));
const AddShow = lazy(() => import("./pages/admin/AddShow"));

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<Loader full />}>
        <Routes>
          <Route path="/" element={<GuestOnly><Landing /></GuestOnly>} />
          <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
          <Route path="/admin/login" element={<GuestOnly><Login admin /></GuestOnly>} />
          <Route path="/admin/register" element={<GuestOnly><Register admin /></GuestOnly>} />

          <Route path="/home" element={<UserProtection><Home /></UserProtection>} />
          <Route path="/movie/:id" element={<UserProtection><MovieDetails /></UserProtection>} />
          <Route path="/show/:showId/seats" element={<UserProtection><SeatsPage /></UserProtection>} />
          <Route path="/bookings" element={<UserProtection><Bookings /></UserProtection>} />
          <Route path="/favorites" element={<UserProtection><Favorites /></UserProtection>} />
          <Route path="/profile" element={<UserProtection><Profile /></UserProtection>} />

          <Route path="/admin" element={<AdminProtection><AdminDashboard /></AdminProtection>} />
          <Route path="/admin/movies" element={<AdminProtection><AdminMovies /></AdminProtection>} />
          <Route path="/admin/add-movie" element={<AdminProtection><AddMovie /></AdminProtection>} />
          <Route path="/admin/movies/:id/edit" element={<AdminProtection><AddMovie /></AdminProtection>} />
          <Route path="/admin/theatres" element={<AdminProtection><AddTheatre /></AdminProtection>} />
          <Route path="/admin/add-show" element={<AdminProtection><AddShow /></AdminProtection>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
