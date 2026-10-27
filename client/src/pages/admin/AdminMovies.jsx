import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api, { errMsg } from "../../api";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import MovieCard from "../../components/MovieCard";

export default function AdminMovies() {
  const { data, loading, error, setData } = useFetch("/movie");
  const movies = data?.movies || [];

  const remove = async (m) => {
    if (!window.confirm(`Delete "${m.movieName}"? Its shows, reviews and favorites will be removed too.`)) return;
    try {
      await api.delete(`/movie/${m._id}`);
      setData({ movies: movies.filter((x) => x._id !== m._id) });
      toast.success("Movie deleted");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <main className="page">
      <div className="banner">Available Movies</div>
      <div className="page__head page__head--end">
        <Link to="/admin/add-movie" className="btn btn--primary">Add movie</Link>
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <p className="empty">{error}</p>
      ) : movies.length === 0 ? (
        <p className="empty">No movies yet.</p>
      ) : (
        <div className="grid">
          {movies.map((m) => (
            <MovieCard key={m._id} movie={m} onDelete={() => remove(m)} editTo={`/admin/movies/${m._id}/edit`} />
          ))}
        </div>
      )}
    </main>
  );
}
