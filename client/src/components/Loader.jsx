export default function Loader({ full = false }) {
  return (
    <div className={full ? "loader loader--full" : "loader"} role="status" aria-label="Loading">
      <span className="loader__spin" />
    </div>
  );
}
