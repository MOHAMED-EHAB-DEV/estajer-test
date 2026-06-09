function formatDuration({ duration, unit, t, lang }) {
  // Arabic has complex pluralization rules
  if (lang === "ar") {
    if (duration === 1) return t(`units.${unit}.one`);
    if (duration === 2) return t(`units.${unit}.two`);
    if (duration >= 3 && duration <= 10)
      return `${duration} ${t(`units.${unit}.few`)}`;
    return `${duration} ${t(`units.${unit}.many`)}`;
  }
  if (duration === 1) return t(`units.${unit}.one`);
  // The key "other" uses a placeholder for the count
  return t(`units.${unit}.other`).replace("{count}", duration);
}
export default formatDuration;
