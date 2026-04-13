export type RoutineExerciseInput = {
  exercise_id?: string;
  order_index?: number;
  target_sets?: number;
  target_reps?: string;
};

export type NormalizedRoutineExercise = {
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps: string;
};

export function normalizeRoutineExercises(exercises: RoutineExerciseInput[] = []): NormalizedRoutineExercise[] {
  return exercises
    .filter((exercise) => exercise?.exercise_id)
    .map((exercise, index) => ({
      exercise_id: String(exercise.exercise_id),
      order_index: index,
      target_sets: Math.max(1, Math.min(10, Number(exercise.target_sets) || 3)),
      target_reps: String(exercise.target_reps || '8-12').trim() || '8-12',
    }));
}

export function normalizeRoutineName(name: string | undefined | null): string {
  return String(name || '').trim();
}

export function normalizeNumericInput(value: unknown, fallback = 0, round = false) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const safe = Math.max(0, numeric);
  return round ? Math.round(safe) : safe;
}

export function clampNullableMetric(value: unknown, max: number, round = false): number | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  const safe = Math.max(0, Math.min(max, numeric));
  return round ? Math.round(safe) : safe;
}

export function hasCompletedSets(sets: Array<{ completed?: boolean }> = []) {
  return sets.some((set) => Boolean(set?.completed));
}
