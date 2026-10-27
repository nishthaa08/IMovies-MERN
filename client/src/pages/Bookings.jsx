import useFetch from "../hooks/useFetch";
import Loader from "../components/Loader";
import BookingCard from "../components/BookingCard";

export default function Bookings() {
  const { data, loading, error } = useFetch("/bookings/my");
  const bookings = data?.bookings || [];

  return (
    <main className="page">
      <h1 className="center">
        Your <span className="accent">Bookings</span>
      </h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <p className="empty">{error}</p>
      ) : bookings.length === 0 ? (
        <p className="empty">You haven't booked anything yet.</p>
      ) : (
        <div className="booking-grid">
          {bookings.map((b) => <BookingCard key={b._id} booking={b} />)}
        </div>
      )}
    </main>
  );
}
