import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiTrash2, FiFilm } from "react-icons/fi";
import api, { errMsg } from "../../api";
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader";
import BookingCard from "../../components/BookingCard";
import { formatDate, formatTime, rupees } from "../../utils";

export default function AdminDashboard() {
  const showsReq = useFetch("/shows/admin/mine");
  const bookingsReq = useFetch("/auth/admin/bookings");

  const shows = showsReq.data?.shows || [];
  const bookings = bookingsReq.data?.bookings || [];
  const revenue = bookings.reduce((s, b) => s + b.totalPrice, 0);

  const deleteShow = async (id) => {
    if (!window.confirm("Delete this show? Existing bookings stay in history.")) return;
    try {
      await api.delete(`/shows/${id}`);
      showsReq.setData({ shows: shows.filter((s) => s._id !== id) });
      toast.success("Show deleted");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <main className="page">
      <div className="stats">
        <div className="stat"><span>{shows.length}</span>Your shows</div>
        <div className="stat"><span>{bookings.length}</span>Bookings</div>
        <div className="stat"><span>{rupees(revenue)}</span>Revenue</div>
      </div>

      <div className="page__head">
        <h1>Admin <span className="accent">Shows</span></h1>
        <Link to="/admin/add-show" className="btn btn--primary">Add show</Link>
      </div>

      {showsReq.loading ? (
        <Loader />
      ) : shows.length === 0 ? (
        <p className="empty">No shows yet. Add a theatre and a movie, then create a show.</p>
      ) : (
        <div className="show-grid">
          {shows.map((s) => (
            <article key={s._id} className="show-card">
              <FiFilm className="show-card__icon" />
              <dl>
                <dt>Movie</dt><dd>{s.movie?.movieName || "Deleted movie"}</dd>
                <dt>Theatre</dt><dd>{s.theatre?.theatreName || "Deleted theatre"}</dd>
                <dt>Date</dt><dd>{formatDate(s.showdate)}</dd>
                <dt>Time</dt><dd>{formatTime(s.showtime)}</dd>
              </dl>
              <button className="btn btn--outline-danger" onClick={() => deleteShow(s._id)} aria-label="Delete show">
                <FiTrash2 />
              </button>
            </article>
          ))}
        </div>
      )}

      <h1 className="section-title">All <span className="accent">Bookings</span></h1>
      {bookingsReq.loading ? (
        <Loader />
      ) : bookings.length === 0 ? (
        <p className="empty">No bookings yet.</p>
      ) : (
        <div className="booking-grid">
          {bookings.map((b) => <BookingCard key={b._id} booking={b} showUser />)}
        </div>
      )}
    </main>
  );
}
