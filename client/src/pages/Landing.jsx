import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="landing">
      <div className="landing__content">
        <h1>
          Welcome to <span className="accent">iMovies</span>
        </h1>
        <p>Your ultimate destination for the latest blockbusters and timeless classics. Pick a show, choose your seats, done.</p>
        <div className="landing__actions">
          <Link to="/login" className="btn btn--primary">Sign In</Link>
          <Link to="/register" className="btn btn--ghost">Sign Up</Link>
        </div>
        <Link to="/admin/login" className="landing__admin">Theatre admin? Log in here</Link>
      </div>
    </main>
  );
}
