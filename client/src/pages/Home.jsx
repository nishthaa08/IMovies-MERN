import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import useFetch from "../hooks/useFetch";
import MovieCard from "../components/MovieCard";
import Loader from "../components/Loader";

export default function Home() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");

  // Debounce the search box so we don't call the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const url = `/movie?${new URLSearchParams({ ...(query && { search: query }) })}`;
  const { data, loading, error } = useFetch(url);
  const movies = data?.movies || [];

  const genres = useMemo(() => [...new Set(movies.flatMap((m) => m.genres || []))].sort(), [movies]);
  const shown = genre ? movies.filter((m) => m.genres?.includes(genre)) : movies;

  return (
    <main className="page">
      <div className="page__head">
        <h1>
          Available <span className="accent">Movies</span>
        </h1>
        <div className="search">
          <FiSearch />
          <input placeholder="Search movies" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search movies" />
        </div>
      </div>

      {genres.length > 0 && (
        <div className="chips">
          <button className={`chip ${!genre ? "chip--on" : ""}`} onClick={() => setGenre("")}>All</button>
          {genres.map((g) => (
            <button key={g} className={`chip ${genre === g ? "chip--on" : ""}`} onClick={() => setGenre(g)}>{g}</button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader />
      ) : error ? (
        <p className="empty">{error}</p>
      ) : shown.length === 0 ? (
        <p className="empty">No movies found{query ? ` for "${query}"` : ""}.</p>
      ) : (
        <div className="grid">
          {shown.map((m) => (
            <MovieCard key={m._id} movie={m} to={`/movie/${m._id}`} />
          ))}
        </div>
      )}
    </main>
  );
}
