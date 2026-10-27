// Seat sections and their seat-number prefixes
const SECTIONS = {
  balcony: { prefix: "B", priceField: "balconySeatPrice", countField: "balconySeatCount" },
  middle: { prefix: "M", priceField: "middleSeatPrice", countField: "middleSeatCount" },
  lower: { prefix: "L", priceField: "lowerSeatPrice", countField: "lowerSeatCount" },
};

// True if seatId (e.g. "B12") exists in that section of the theatre
const isValidSeat = (theatre, section, seatId) => {
  const cfg = SECTIONS[section];
  if (!cfg || typeof seatId !== "string" || !seatId.startsWith(cfg.prefix)) return false;
  const n = Number(seatId.slice(cfg.prefix.length));
  return Number.isInteger(n) && n >= 1 && n <= theatre[cfg.countField];
};

module.exports = { SECTIONS, isValidSeat };
