import { useState } from "react";

// Shows the poster image, or a generated placeholder if there's no URL or it fails to load
export default function Poster({ movie, className = "poster" }) {
  const [failed, setFailed] = useState(false);
  const url = movie?.posterUrl;

  if (url && !failed) {
    return <img className={className} src={url} alt={movie.movieName} loading="lazy" onError={() => setFailed(true)} />;
  }

  // Pick a stable hue from the title
  const hue = [...(movie?.movieName || "x")].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div
      className={`${className} poster--placeholder`}
      style={{ background: `linear-gradient(160deg, hsl(${hue} 55% 32%), hsl(${(hue + 40) % 360} 60% 12%))` }}
    >
      <span>{movie?.movieName}</span>
    </div>
  );
}
