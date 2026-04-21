export type DashboardSet = {
  logged_at?: string | null;
  weight?: number | null;
  reps?: number | null;
  completed?: boolean | null;
  exercise_name?: string | null;
  exercises?: { muscle_groups?: string[] | null } | null;
};

export type DashboardSession = {
  id?: string | null;
  completed_at?: string | null;
  started_at?: string | null;
  routine_name?: string | null;
  muscle_groups?: string[] | null;
  totalVolume?: number | null;
};

export type DashboardRoutine = {
  id?: string | null;
  name?: string | null;
  goal?: string | null;
  muscle_groups?: string[] | null;
  routine_exercises?: Array<{ exercises?: { muscle_groups?: string[] | null } | null }> | null;
};

export type WeeklyVolumePoint = {
  date: string;
  label: string;
  volume: number;
};

export type BannerState = {
  kind: 'active-session' | 'streak-risk' | 'suggested-routine' | 'recovery' | 'recent-pr' | 'default';
  icon: string;
  tone: 'primary' | 'accent' | 'warning';
  title: string;
  description: string;
  cta: { href: string; label: string };
};

export type RecentPR = {
  exerciseName: string;
  weight: number;
  previousWeight: number;
  increase: number;
  loggedAt: string;
};

export type RecoveryStatus = {
  muscleGroup: string;
  daysSince: number;
  status: 'recovering' | 'ready' | 'fully-recovered';
};

export type PredictedPR = {
  predictedWeight: number;
  lastWeight: number;
  trend: 'up' | 'flat';
};

export type RecommendedRoutine = {
  id: string | null;
  name: string;
  reason: string;
  muscleGroup: string | null;
  daysSince: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_WEEKLY_GOAL = 4;

function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateKey(value?: string | null) {
  const date = toDate(value);
  return date ? date.toISOString().split('T')[0] : null;
}

function daysBetween(from: Date, to: Date) {
  return Math.floor((from.getTime() - to.getTime()) / DAY_MS);
}

function formatWeekday(date: Date) {
  return date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
}

function getSetVolume(set: DashboardSet) {
  return Math.max(0, Number(set.weight) || 0) * Math.max(0, Number(set.reps) || 0);
}

function getRoutineMuscleGroups(routine: DashboardRoutine) {
  const direct = (routine.muscle_groups ?? []).filter(Boolean);
  if (direct.length > 0) return direct;

  return (routine.routine_exercises ?? [])
    .flatMap((item) => item.exercises?.muscle_groups ?? [])
    .filter(Boolean) as string[];
}

function getLastSessionInfo(sessions: DashboardSession[]) {
  const completedDates = sessions
    .map((session) => toDate(session.completed_at))
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completedDates.length === 0) return null;

  return {
    date: completedDates[0],
    daysSince: daysBetween(new Date(), completedDates[0]),
  };
}

function buildSessionVolumes(sessions: DashboardSession[], sets: DashboardSet[]) {
  const explicit = sessions
    .filter((session) => toDate(session.completed_at) && Number.isFinite(Number(session.totalVolume)))
    .map((session) => ({ completed_at: session.completed_at!, totalVolume: Number(session.totalVolume) || 0 }));

  if (explicit.length > 0) return explicit;

  const byDate = new Map<string, number>();
  for (const set of sets) {
    if (set.completed === false) continue;
    const key = toDateKey(set.logged_at);
    if (!key) continue;
    byDate.set(key, (byDate.get(key) ?? 0) + getSetVolume(set));
  }

  return Array.from(byDate.entries()).map(([completed_at, totalVolume]) => ({ completed_at, totalVolume }));
}

function roundToHalf(value: number) {
  return Math.round(value * 2) / 2;
}

export function getWeeklyVolume(sets: DashboardSet[]): WeeklyVolumePoint[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const volumes = new Map<string, number>();

  for (const set of sets) {
    if (set.completed === false) continue;
    const date = toDate(set.logged_at);
    if (!date) continue;
    const diff = daysBetween(today, date);
    if (diff < 0 || diff > 6) continue;
    const key = toDateKey(set.logged_at)!;
    volumes.set(key, (volumes.get(key) ?? 0) + getSetVolume(set));
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const key = date.toISOString().split('T')[0];
    return {
      date: key,
      label: formatWeekday(date),
      volume: Math.round(volumes.get(key) ?? 0),
    };
  });
}

export function getWeeklyFrequency(sessions: DashboardSession[], goal = DEFAULT_WEEKLY_GOAL) {
  const completed = sessions.filter((session) => {
    const date = toDate(session.completed_at);
    return date ? daysBetween(new Date(), date) <= 6 : false;
  }).length;

  return { completed, goal };
}

export function getStreak(sessions: DashboardSession[]) {
  const keys = Array.from(
    new Set(
      sessions
        .map((session) => toDateKey(session.completed_at))
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((a, b) => b.localeCompare(a));

  if (keys.length === 0) return 0;

  let streak = 1;
  let current = new Date(`${keys[0]}T12:00:00`);

  for (let index = 1; index < keys.length; index += 1) {
    const next = new Date(`${keys[index]}T12:00:00`);
    if (daysBetween(current, next) !== 1) break;
    streak += 1;
    current = next;
  }

  return streak;
}

export function getRecentPRs(sets: DashboardSet[]): RecentPR[] {
  const maxByExercise = new Map<string, number>();
  const prs: RecentPR[] = [];

  const ordered = [...sets]
    .filter((set) => set.completed !== false && set.exercise_name && Number(set.weight) > 0 && toDate(set.logged_at))
    .sort((a, b) => new Date(a.logged_at!).getTime() - new Date(b.logged_at!).getTime());

  for (const set of ordered) {
    const exerciseName = String(set.exercise_name);
    const weight = Number(set.weight) || 0;
    const previous = maxByExercise.get(exerciseName);
    if (previous !== undefined && weight > previous) {
      prs.push({
        exerciseName,
        weight,
        previousWeight: previous,
        increase: roundToHalf(weight - previous),
        loggedAt: set.logged_at!,
      });
    }
    maxByExercise.set(exerciseName, Math.max(previous ?? 0, weight));
  }

  return prs.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()).slice(0, 3);
}

export function getMuscleRecoveryStatus(_sessions: DashboardSession[], sets: DashboardSet[]): RecoveryStatus[] {
  const lastByMuscle = new Map<string, Date>();

  for (const set of sets) {
    if (set.completed === false) continue;
    const date = toDate(set.logged_at);
    if (!date) continue;
    for (const muscle of set.exercises?.muscle_groups ?? []) {
      const current = lastByMuscle.get(muscle);
      if (!current || date.getTime() > current.getTime()) {
        lastByMuscle.set(muscle, date);
      }
    }
  }

  return Array.from(lastByMuscle.entries()).map(([muscleGroup, date]) => {
    const daysSince = daysBetween(new Date(), date);
    return {
      muscleGroup,
      daysSince,
      status: daysSince < 2 ? 'recovering' : daysSince < 5 ? 'ready' : 'fully-recovered',
    };
  });
}

export function predictNextPR(exerciseHistory: Array<{ logged_at?: string | null; weight?: number | null }>): PredictedPR | null {
  const ordered = exerciseHistory
    .filter((entry) => toDate(entry.logged_at) && Number.isFinite(Number(entry.weight)))
    .sort((a, b) => new Date(a.logged_at!).getTime() - new Date(b.logged_at!).getTime());

  if (ordered.length < 2) return null;

  const deltas = ordered.slice(1).map((entry, index) => (Number(entry.weight) || 0) - (Number(ordered[index]?.weight) || 0));
  const averageDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  const lastWeight = Number(ordered.at(-1)?.weight) || 0;
  const progression = Math.max(0, averageDelta);
  const predictedWeight = roundToHalf(lastWeight + progression);

  return {
    predictedWeight,
    lastWeight,
    trend: progression > 0 ? 'up' : 'flat',
  };
}

export function detectOvertraining(recentSessions: Array<{ completed_at?: string | null; totalVolume?: number | null }>) {
  if (recentSessions.length < 2) {
    return { isOvertraining: false, message: 'Todavía no hay suficientes datos para detectar fatiga.' };
  }

  const ordered = recentSessions
    .filter((session) => toDate(session.completed_at))
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

  const latest = Number(ordered[0]?.totalVolume) || 0;
  const baseline = ordered.slice(1).map((session) => Number(session.totalVolume) || 0);
  const average = baseline.reduce((sum, value) => sum + value, 0) / Math.max(baseline.length, 1);
  const threshold = average * 1.3;
  const isOvertraining = average > 0 && latest > threshold;

  return {
    isOvertraining,
    message: isOvertraining
      ? 'Tu volumen reciente supera el 30% del promedio. Prioriza descanso o baja la intensidad.'
      : 'Tu carga reciente está dentro de un rango saludable.',
  };
}

export function getRecommendedRoutine(routines: DashboardRoutine[], sessions: DashboardSession[]): RecommendedRoutine {
  if (routines.length === 0) {
    return {
      id: null,
      name: 'Sin rutinas',
      reason: 'Crea una rutina para recibir sugerencias inteligentes.',
      muscleGroup: null,
      daysSince: 0,
    };
  }

  const lastByMuscle = new Map<string, Date>();
  for (const session of sessions) {
    const date = toDate(session.completed_at);
    if (!date) continue;
    for (const muscle of session.muscle_groups ?? []) {
      const current = lastByMuscle.get(muscle);
      if (!current || date.getTime() > current.getTime()) {
        lastByMuscle.set(muscle, date);
      }
    }
  }

  const ranked = routines.map((routine) => {
    const muscles = getRoutineMuscleGroups(routine);
    if (muscles.length === 0) {
      return { routine, muscleGroup: null, daysSince: Number.POSITIVE_INFINITY };
    }

    const muscleStats = muscles.map((muscle) => {
      const lastDate = lastByMuscle.get(muscle);
      return {
        muscle,
        daysSince: lastDate ? daysBetween(new Date(), lastDate) : Number.POSITIVE_INFINITY,
      };
    });

    muscleStats.sort((a, b) => b.daysSince - a.daysSince || a.muscle.localeCompare(b.muscle));
    return { routine, muscleGroup: muscleStats[0]?.muscle ?? null, daysSince: muscleStats[0]?.daysSince ?? 0 };
  });

  ranked.sort((a, b) => b.daysSince - a.daysSince || String(a.routine.name).localeCompare(String(b.routine.name)));
  const winner = ranked[0]!;

  return {
    id: winner.routine.id ?? null,
    name: String(winner.routine.name ?? 'Rutina recomendada'),
    reason: winner.daysSince === Number.POSITIVE_INFINITY
      ? 'Aún no has trabajado este grupo muscular. Buen momento para activarlo.'
      : `Han pasado ${winner.daysSince} día${winner.daysSince === 1 ? '' : 's'} desde tu último trabajo principal.`,
    muscleGroup: winner.muscleGroup,
    daysSince: Number.isFinite(winner.daysSince) ? winner.daysSince : 999,
  };
}

export function getSmartBannerState(
  activeSession: Pick<DashboardSession, 'id' | 'routine_name' | 'started_at'> | null,
  sessions: DashboardSession[],
  sets: DashboardSet[],
  routines: DashboardRoutine[],
  userName: string,
): BannerState {
  if (activeSession?.id) {
    return {
      kind: 'active-session',
      icon: 'play_circle',
      tone: 'accent',
      title: `Continua tu entrenamiento${activeSession.routine_name ? ` de ${activeSession.routine_name}` : ''}`,
      description: 'Tienes una sesión en progreso lista para retomarse.',
      cta: { href: `/session?session_id=${activeSession.id}`, label: 'Continuar ahora' },
    };
  }

  const lastSession = getLastSessionInfo(sessions);
  const streak = getStreak(sessions);
  if (lastSession && streak > 0 && lastSession.daysSince >= 2) {
    return {
      kind: 'streak-risk',
      icon: 'local_fire_department',
      tone: 'warning',
      title: 'Tu racha está en riesgo',
      description: `Tu racha va en ${streak} día${streak === 1 ? '' : 's'} seguidos y ya pasaron ${lastSession.daysSince} días desde tu última sesión.`,
      cta: { href: '/routines', label: 'Entrenar hoy' },
    };
  }

  const recommendedRoutine = getRecommendedRoutine(routines, sessions);
  if (recommendedRoutine.id) {
    return {
      kind: 'suggested-routine',
      icon: 'target',
      tone: 'primary',
      title: `Te conviene ${recommendedRoutine.name}`,
      description: recommendedRoutine.reason,
      cta: { href: `/session?routine_id=${recommendedRoutine.id}`, label: 'Empezar rutina' },
    };
  }

  const fatigue = detectOvertraining(buildSessionVolumes(sessions, sets));
  if (fatigue.isOvertraining) {
    return {
      kind: 'recovery',
      icon: 'bedtime',
      tone: 'warning',
      title: 'Hoy conviene priorizar recuperación',
      description: fatigue.message,
      cta: { href: '/statistics', label: 'Revisar volumen' },
    };
  }

  const recentPr = getRecentPRs(sets).find((item) => daysBetween(new Date(), new Date(item.loggedAt)) <= 7);
  if (recentPr) {
    return {
      kind: 'recent-pr',
      icon: 'workspace_premium',
      tone: 'accent',
      title: `¡Nuevo PR en ${recentPr.exerciseName}!`,
      description: `Subiste ${recentPr.increase} kg frente a tu mejor marca anterior.`,
      cta: { href: '/statistics', label: 'Ver progreso' },
    };
  }

  return {
    kind: 'default',
    icon: 'bolt',
    tone: 'primary',
    title: `Bienvenida${userName ? `, ${userName}` : ''}`,
    description: 'Revisa tu semana, detecta oportunidades y elige tu siguiente mejor sesión.',
    cta: { href: '/routines', label: 'Ver rutinas' },
  };
}
