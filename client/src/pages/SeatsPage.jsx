import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api, { errMsg } from "../api";
import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import { SECTIONS, formatDate, formatTime, rupees } from "../utils";

const MAX_SEATS = 10;
const PER_ROW = 10;

export default function SeatsPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(`/shows/${showId}`);
  const [picked, setPicked] = useState({ balcony: [], middle: [], lower: [] });
  const [busy, setBusy] = useState(false);

  const show = data?.show;
  const theatre = show?.theatre;

  const count = picked.balcony.length + picked.middle.length + picked.lower.length;
  const total = useMemo(
    () => (theatre ? SECTIONS.reduce((sum, s) => sum + picked[s.key].length * theatre[s.priceField], 0) : 0),
    [picked, theatre]
  );

  if (loading) return <Loader full />;
  if (error || !show) return <main className="page"><p className="empty">{error || "Show not found"}</p></main>;
  if (!show.movie || !theatre) return <main className="page"><p className="empty">This show is no longer available.</p></main>;

  const toggle = (section, seatId) => {
    setPicked((prev) => {
      const list = prev[section];
      if (list.includes(seatId)) return { ...prev, [section]: list.filter((s) => s !== seatId) };
      if (count >= MAX_SEATS) {
        toast.info(`You can pick up to ${MAX_SEATS} seats`);
        return prev;
      }
      return { ...prev, [section]: [...list, seatId] };
    });
  };

  const book = async () => {
    setBusy(true);
    try {
      await api.post("/bookings", { showId, seats: picked });
      toast.success("Booking confirmed!");
      navigate("/bookings");
    } catch (err) {
      toast.error(errMsg(err));
      if (err.response?.status === 409) {
        setPicked({ balcony: [], middle: [], lower: [] });
        refetch();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="page seats-page">
      <div className="seats-head">
        <h1>{show.movie.movieName}</h1>
        <p className="muted">
          {theatre.theatreName} · {theatre.location} · {formatDate(show.showdate)} · {formatTime(show.showtime)}
        </p>
      </div>

      <div className="legend">
        <span><i className="seat seat--free" /> Available</span>
        <span><i className="seat seat--picked" /> Selected</span>
        <span><i className="seat seat--taken" /> Booked</span>
      </div>

      <div className="hall">
        {SECTIONS.map((s) => {
          const n = theatre[s.countField];
          if (!n) return null;
          const booked = new Set(show.bookedSeats?.[s.key] || []);
          const seats = Array.from({ length: n }, (_, i) => `${s.prefix}${i + 1}`);
          const rows = [];
          for (let i = 0; i < seats.length; i += PER_ROW) rows.push(seats.slice(i, i + PER_ROW));

          return (
            <section key={s.key} className="hall__section">
              <h3>
                {s.label} <span className="muted">{rupees(theatre[s.priceField])}</span>
              </h3>
              {rows.map((row, ri) => (
                <div key={ri} className="seat-row">
                  {row.map((id) => {
                    const taken = booked.has(id);
                    const on = picked[s.key].includes(id);
                    return (
                      <button
                        key={id}
                        className={`seat ${taken ? "seat--taken" : on ? "seat--picked" : "seat--free"}`}
                        disabled={taken}
                        onClick={() => toggle(s.key, id)}
                        title={taken ? `${id} (booked)` : id}
                        aria-label={`Seat ${id}${taken ? " booked" : on ? " selected" : ""}`}
                        aria-pressed={on}
                      >
                        {id.slice(1)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </section>
          );
        })}
        <div className="screen">SCREEN THIS WAY</div>
      </div>

      <div className="checkout">
        <div>
          {count === 0 ? (
            <span className="muted">Pick your seats</span>
          ) : (
            <>
              <strong>{count} seat{count > 1 ? "s" : ""}:</strong>{" "}
              {SECTIONS.flatMap((s) => picked[s.key]).join(", ")}
            </>
          )}
        </div>
        <button className="btn btn--primary" disabled={!count || busy} onClick={book}>
          {busy ? "Booking..." : `Pay ${rupees(total)}`}
        </button>
      </div>
    </main>
  );
}
