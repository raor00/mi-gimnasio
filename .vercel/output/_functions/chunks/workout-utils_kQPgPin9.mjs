function normalizeRoutineExercises(exercises = []) {
  return exercises.filter((exercise) => exercise?.exercise_id).map((exercise, index) => ({
    exercise_id: String(exercise.exercise_id),
    order_index: index,
    target_sets: Math.max(1, Math.min(10, Number(exercise.target_sets) || 3)),
    target_reps: String(exercise.target_reps || "8-12").trim() || "8-12"
  }));
}
function normalizeRoutineName(name) {
  return String(name || "").trim();
}
function normalizeNumericInput(value, fallback = 0, round = false) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const safe = Math.max(0, numeric);
  return round ? Math.round(safe) : safe;
}
function clampNullableMetric(value, max, round = false) {
  if (value === null || value === void 0 || value === "") return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const safe = Math.max(0, Math.min(max, numeric));
  return round ? Math.round(safe) : safe;
}
function hasCompletedSets(sets = []) {
  return sets.some((set) => Boolean(set?.completed));
}

export { normalizeRoutineExercises as a, normalizeNumericInput as b, clampNullableMetric as c, hasCompletedSets as h, normalizeRoutineName as n };
