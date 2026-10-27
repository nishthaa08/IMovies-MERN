import { Link } from "react-router-dom";
import { FiCalendar, FiTrash2, FiEdit2 } from "react-icons/fi";
import { formatDate } from "../utils";
import Poster from "./Poster";

export default function MovieCard({ movie, to, onDelete, editTo }) {
  const body = (
    <>
      <Poster movie={movie} />
      <div className="card__body">
        <h3 className="card__title">{movie.movieName}</h3>
        <p className="card__meta">
          <FiCalendar /> {formatDate(movie.releaseDate)}
        </p>
        <div className="tags">
          {movie.genres?.slice(0, 3).map((g) => (
            <span key={g} className="tag">{g}</span>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="movie-card">
      {to ? <Link to={to} className="movie-card__link">{body}</Link> : body}
      {(onDelete || editTo) && (
        <div className="movie-card__tools">
          {editTo && (
            <Link to={editTo} className="round-btn" title="Edit" aria-label="Edit movie">
              <FiEdit2 />
            </Link>
          )}
          {onDelete && (
            <button className="round-btn round-btn--danger" onClick={onDelete} title="Delete" aria-label="Delete movie">
              <FiTrash2 />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
