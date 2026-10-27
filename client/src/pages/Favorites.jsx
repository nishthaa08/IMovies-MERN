import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import MovieCard from "../components/MovieCard";

export default function Favorites() {
  const { data, loading, error } = useFetch("/favorite");
  const movies = data?.movies || [];

  return (
    <main className="page">
      <h1 className="center">
        Your <span className="accent">Favorites</span>
      </h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <p className="empty">{error}</p>
      ) : movies.length === 0 ? (
        <p className="empty">No favorites yet. Tap the heart on any movie to save it here.</p>
      ) : (
        <div className="grid">
          {movies.map((m) => <MovieCard key={m._id} movie={m} to={`/movie/${m._id}`} />)}
        </div>
      )}
    </main>
  );
}
