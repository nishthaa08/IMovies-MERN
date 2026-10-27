import { Fragment } from "react";
import Poster from "./Poster";
import { SECTIONS, formatDate, formatTime, rupees } from "../utils";

export default function BookingCard({ booking, showUser = false }) {
  const b = booking;
  return (
    <article className="booking-card">
      <Poster movie={{ movieName: b.movieName, posterUrl: b.posterUrl }} className="booking-card__poster" />
      <dl>
        {showUser && (<><dt>User</dt><dd>{b.userEmail}</dd></>)}
        <dt>Movie</dt><dd>{b.movieName}</dd>
        <dt>Theatre</dt><dd>{b.theatreName}</dd>
        <dt>Date</dt><dd>{formatDate(b.showdate)}</dd>
        <dt>Time</dt><dd>{formatTime(b.showtime)}</dd>
        {SECTIONS.filter((s) => b.seats?.[s.key]?.length).map((s) => (
          <Fragment key={s.key}>
            <dt>{s.label}</dt><dd>{b.seats[s.key].join(", ")}</dd>
          </Fragment>
        ))}
        <dt>Total</dt><dd className="accent strong">{rupees(b.totalPrice)}</dd>
      </dl>
    </article>
  );
}
