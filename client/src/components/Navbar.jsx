import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiSun, FiMoon, FiHome, FiHeart, FiUser, FiLogOut, FiFilm, FiPlusCircle, FiGrid, FiClock,
} from "react-icons/fi";
import { MdOutlineTheaters } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const THEME_KEY = "imovies_theme";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const handleLogout = () => {
    const wasAdmin = user?.role === "admin";
    logout();
    navigate(wasAdmin ? "/admin/login" : "/login");
  };

  const icon = (to, Icon, label, end = false) => (
    <NavLink to={to} end={end} className="nav__icon" title={label} aria-label={label}>
      <Icon />
    </NavLink>
  );

  const brandTarget = !user ? "/" : user.role === "admin" ? "/admin" : "/home";

  return (
    <header className="nav">
      <Link to={brandTarget} className="brand">
        <span className="brand__i">i</span>Movies
      </Link>

      <nav className="nav__actions">
        <button
          className="nav__icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>

        {user?.role === "user" && (
          <>
            {icon("/home", FiHome, "Home")}
            {icon("/favorites", FiHeart, "Favorites")}
            {icon("/bookings", FiClock, "My bookings")}
            {icon("/profile", FiUser, "Profile")}
          </>
        )}

        {user?.role === "admin" && (
          <>
            {icon("/admin", FiGrid, "Dashboard", true)}
            {icon("/admin/movies", FiFilm, "Movies", true)}
            {icon("/admin/add-movie", FiPlusCircle, "Add movie")}
            {icon("/admin/theatres", MdOutlineTheaters, "Theatres")}
            {icon("/admin/add-show", FiClock, "Add show")}
          </>
        )}

        {user && (
          <button className="nav__icon" onClick={handleLogout} title="Log out" aria-label="Log out">
            <FiLogOut />
          </button>
        )}
      </nav>
    </header>
  );
}
