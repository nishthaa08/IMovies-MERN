// "2026-10-27" -> "Tue, 27 Oct 2026"
export const formatDate = (value) => {
  if (!value) return "";
  const d = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

// "18:45" -> "6:45 PM"
export const formatTime = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
};

export const formatRuntime = (mins) => (mins ? `${Math.floor(mins / 60)}h ${mins % 60}m` : "");

export const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Local YYYY-MM-DD, used as min for date inputs
export const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Turns a YouTube link into an embeddable URL, or null
export const youtubeEmbed = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

export const SECTIONS = [
  { key: "balcony", label: "Balcony", prefix: "B", priceField: "balconySeatPrice", countField: "balconySeatCount" },
  { key: "middle", label: "Middle", prefix: "M", priceField: "middleSeatPrice", countField: "middleSeatCount" },
  { key: "lower", label: "Lower", prefix: "L", priceField: "lowerSeatPrice", countField: "lowerSeatCount" },
];
