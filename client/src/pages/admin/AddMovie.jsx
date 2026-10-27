import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api, { errMsg } from "../../api";
import Poster from "../../components/Poster";
import Loader from "../../components/Loader";

const EMPTY = {
  movieName: "", description: "", genres: "", releaseDate: "", runtime: "",
  certification: "", language: "", trailerUrl: "", posterUrl: "",
};

// Used for both "Add movie" and "Edit movie" (/admin/movies/:id/edit)
export default function AddMovie() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) {
      setForm(EMPTY);
      return;
    }
    api
      .get(`/movie/${id}`)
      .then(({ data }) => {
        const m = data.movie;
        setForm({
          ...EMPTY,
          ...m,
          genres: m.genres.join(", "),
          releaseDate: m.releaseDate?.slice(0, 10) || "",
          runtime: m.runtime ?? "",
        });
      })
      .catch((err) => toast.error(errMsg(err)))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {};
      for (const k of Object.keys(EMPTY)) payload[k] = form[k];
      payload.runtime = form.runtime ? Number(form.runtime) : undefined;
      if (editing) await api.put(`/movie/${id}`, payload);
      else await api.post("/movie", payload);
      toast.success(editing ? "Movie updated" : "Movie added");
      navigate("/admin/movies");
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader full />;

  return (
    <main className="page">
      <form className="panel" onSubmit={onSubmit}>
        <div className="panel__poster">
          <Poster movie={{ movieName: form.movieName || "Poster preview", posterUrl: form.posterUrl }} />
        </div>
        <h1 className="center">{editing ? "Edit" : "Add"} <span className="accent">Movie</span></h1>

        <div className="form-grid">
          <label>
            Movie
            <input name="movieName" placeholder="Enter movie name" value={form.movieName} onChange={onChange} required minLength={2} maxLength={200} />
          </label>
          <label>
            Genres
            <input name="genres" placeholder="Action, Drama, Fantasy" value={form.genres} onChange={onChange} required />
          </label>
          <label className="span-2">
            Description
            <textarea name="description" placeholder="At least 10 characters" value={form.description} onChange={onChange} required minLength={10} />
          </label>
          <label>
            Release Date
            <input name="releaseDate" type="date" value={form.releaseDate} onChange={onChange} required />
          </label>
          <label>
            Runtime (minutes)
            <input name="runtime" type="number" min="1" placeholder="e.g. 150" value={form.runtime} onChange={onChange} />
          </label>
          <label>
            Certification
            <input name="certification" placeholder="U, UA, A" value={form.certification} onChange={onChange} />
          </label>
          <label>
            Language
            <input name="language" placeholder="Hindi" value={form.language} onChange={onChange} />
          </label>
          <label>
            Poster image URL
            <input name="posterUrl" type="url" placeholder="https://..." value={form.posterUrl} onChange={onChange} />
          </label>
          <label>
            Trailer URL (YouTube)
            <input name="trailerUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." value={form.trailerUrl} onChange={onChange} />
          </label>
        </div>

        <button className="btn btn--primary" disabled={busy}>{busy ? "Saving..." : "Submit"}</button>
      </form>
    </main>
  );
}
