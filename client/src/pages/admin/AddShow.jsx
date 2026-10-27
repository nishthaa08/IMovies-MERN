import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api, { errMsg } from "../../api";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import { todayStr } from "../../utils";

export default function AddShow() {
  const navigate = useNavigate();
  const theatresReq = useFetch("/theatre");
  const moviesReq = useFetch("/movie");
  const [form, setForm] = useState({ theatreId: "", movieId: "", showdate: "", showtime: "" });
  const [busy, setBusy] = useState(false);

  const theatres = theatresReq.data?.theatres || [];
  const movies = moviesReq.data?.movies || [];

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/shows", form);
      toast.success("Show created");
      navigate("/admin");
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (theatresReq.loading || moviesReq.loading) return <Loader full />;

  if (!theatres.length || !movies.length) {
    return (
      <main className="page">
        <p className="empty">
          You need at least one theatre and one movie first.{" "}
          {!theatres.length && <Link to="/admin/theatres">Add a theatre</Link>}{" "}
          {!movies.length && <Link to="/admin/add-movie">Add a movie</Link>}
        </p>
      </main>
    );
  }

  return (
    <main className="page">
      <form className="panel panel--narrow" onSubmit={onSubmit}>
        <h1 className="center">Add <span className="accent">Show</span></h1>
        <label>
          Theatre
          <select name="theatreId" value={form.theatreId} onChange={onChange} required>
            <option value="">Select Theatre</option>
            {theatres.map((t) => <option key={t._id} value={t._id}>{t.theatreName} — {t.location}</option>)}
          </select>
        </label>
        <label>
          Movie
          <select name="movieId" value={form.movieId} onChange={onChange} required>
            <option value="">Select Movie</option>
            {movies.map((m) => <option key={m._id} value={m._id}>{m.movieName}</option>)}
          </select>
        </label>
        <label>
          Show Date
          <input name="showdate" type="date" min={todayStr()} value={form.showdate} onChange={onChange} required />
        </label>
        <label>
          Show Time
          <input name="showtime" type="time" value={form.showtime} onChange={onChange} required />
        </label>
        <button className="btn btn--primary" disabled={busy}>{busy ? "Saving..." : "Submit"}</button>
      </form>
    </main>
  );
}
