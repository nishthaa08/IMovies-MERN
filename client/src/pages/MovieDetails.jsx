import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";
import { FiClock, FiMapPin } from "react-icons/fi";
import api, { errMsg } from "../api";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import Poster from "../components/Poster";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatRuntime, formatTime, rupees, youtubeEmbed } from "../utils";

function Stars({ value, onPick, size = "1rem" }) {
  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const Icon = n <= value ? FaStar : FaRegStar;
        return onPick ? (
          <button type="button" key={n} onClick={() => onPick(n)} aria-label={`${n} star`}>
            <Icon />
          </button>
        ) : (
          <Icon key={n} />
        );
      })}
    </span>
  );
}

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const movieReq = useFetch(`/movie/${id}`);
  const showsReq = useFetch(`/shows/movie/${id}`);
  const reviewsReq = useFetch(`/reviews/${id}`);
  const favReq = useFetch("/favorite");

  const [isFav, setIsFav] = useState(false);
  const [activeDate, setActiveDate] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (favReq.data) setIsFav(favReq.data.movies.some((m) => m._id === id));
  }, [favReq.data, id]);

  // Prefill the form with the user's existing review
  const reviews = reviewsReq.data?.reviews || [];
  useEffect(() => {
    const mine = reviews.find((r) => r.user === user?.id);
    if (mine) {
      setMyRating(mine.rating);
      setComment(mine.comment || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewsReq.data]);

  // { "2026-10-27": { theatreId: { theatre, shows: [] } } }
  const byDate = useMemo(() => {
    const out = {};
    for (const s of showsReq.data?.shows || []) {
      if (!s.theatre) continue;
      out[s.showdate] ??= {};
      out[s.showdate][s.theatre._id] ??= { theatre: s.theatre, shows: [] };
      out[s.showdate][s.theatre._id].shows.push(s);
    }
    return out;
  }, [showsReq.data]);
  const dates = Object.keys(byDate).sort();
  const currentDate = activeDate && byDate[activeDate] ? activeDate : dates[0];

  if (movieReq.loading) return <Loader full />;
  if (movieReq.error) return <main className="page"><p className="empty">{movieReq.error}</p></main>;

  const { movie, rating } = movieReq.data;
  const trailer = youtubeEmbed(movie.trailerUrl);

  const toggleFav = async () => {
    try {
      const { data } = await api.post(`/favorite/${id}`);
      setIsFav(data.favorite);
      toast.success(data.favorite ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!myRating) return toast.error("Pick a star rating");
    setSaving(true);
    try {
      await api.post(`/reviews/${id}`, { rating: myRating, comment });
      toast.success("Review saved");
      reviewsReq.refetch();
      movieReq.refetch();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <section className="details">
        <Poster movie={movie} className="details__poster" />
        <div className="details__info">
          <h1>{movie.movieName}</h1>
          <div className="details__meta">
            {movie.certification && <span className="badge">{movie.certification}</span>}
            {movie.language && <span>{movie.language}</span>}
            {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
            <span>{formatDate(movie.releaseDate)}</span>
          </div>
          <div className="tags">
            {movie.genres.map((g) => <span key={g} className="tag">{g}</span>)}
          </div>
          {rating.count > 0 && (
            <p className="details__rating">
              <Stars value={Math.round(rating.average)} /> {rating.average} / 5 · {rating.count} review{rating.count > 1 ? "s" : ""}
            </p>
          )}
          <p className="details__desc">{movie.description}</p>
          <button className="btn btn--ghost" onClick={toggleFav}>
            {isFav ? <FaHeart className="accent" /> : <FaRegHeart />} {isFav ? "In favorites" : "Add to favorites"}
          </button>
        </div>
      </section>

      {trailer && (
        <section className="block">
          <h2>Trailer</h2>
          <div className="video">
            <iframe src={trailer} title={`${movie.movieName} trailer`} allowFullScreen />
          </div>
        </section>
      )}

      <section className="block">
        <h2>
          Book <span className="accent">Tickets</span>
        </h2>
        {showsReq.loading ? (
          <Loader />
        ) : dates.length === 0 ? (
          <p className="empty">No upcoming shows for this movie yet.</p>
        ) : (
          <>
            <div className="chips">
              {dates.map((d) => (
                <button key={d} className={`chip ${d === currentDate ? "chip--on" : ""}`} onClick={() => setActiveDate(d)}>
                  {formatDate(d)}
                </button>
              ))}
            </div>
            <div className="theatres">
              {Object.values(byDate[currentDate]).map(({ theatre, shows }) => (
                <div key={theatre._id} className="theatre-row">
                  <div>
                    <h3>{theatre.theatreName}</h3>
                    <p className="muted"><FiMapPin /> {theatre.location}</p>
                    <p className="muted small">
                      From {rupees(Math.min(theatre.lowerSeatPrice, theatre.middleSeatPrice, theatre.balconySeatPrice))}
                    </p>
                  </div>
                  <div className="times">
                    {shows.map((s) => (
                      <button key={s._id} className="time-btn" onClick={() => navigate(`/show/${s._id}/seats`)}>
                        <FiClock /> {formatTime(s.showtime)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="block">
        <h2>
          <span className="accent">Reviews</span>
        </h2>
        <form className="review-form" onSubmit={submitReview}>
          <Stars value={myRating} onPick={setMyRating} size="1.4rem" />
          <textarea placeholder="What did you think? (optional)" value={comment} maxLength={500} onChange={(e) => setComment(e.target.value)} />
          <button className="btn btn--primary" disabled={saving}>{saving ? "Saving..." : "Post review"}</button>
        </form>
        {reviews.length === 0 ? (
          <p className="empty">No reviews yet. Be the first.</p>
        ) : (
          <ul className="reviews">
            {reviews.map((r) => (
              <li key={r._id}>
                <div className="reviews__head">
                  <strong>{r.username}</strong> <Stars value={r.rating} />
                </div>
                {r.comment && <p>{r.comment}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
