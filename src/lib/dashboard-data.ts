import {
  detectOvertraining,
  getMuscleRecoveryStatus,
  getRecentPRs,
  getRecommendedRoutine,
  getSmartBannerState,
  getStreak,
  getWeeklyFrequency,
  getWeeklyVolume,
  predictNextPR,
  type DashboardRoutine,
  type DashboardSession,
  type DashboardSet,
  type DashboardProgressLog,
} from './predictions.ts';

export type DashboardViewModelInput = {
  userName: string;
  activeSession: DashboardSession | null;
  routines: DashboardRoutine[];
  sessions: DashboardSession[];
  recentSets: DashboardSet[];
  historySets: DashboardSet[];
  latestProgressLog: DashboardProgressLog | null;
};

const GOAL_LABELS: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  strength: 'Fuerza',
  endurance: 'Resistencia',
};

function getNextRoutineSection(routines: DashboardRoutine[], recommendedRoutineId: string | null, activeSession: DashboardSession | null) {
  const selectedRoutine = routines.find((routine) => routine.id === recommendedRoutineId) ?? routines[0] ?? null;

  if (!selectedRoutine) {
    return {
      id: null,
      name: 'Crea tu primera rutina',
      goalLabel: 'Sin objetivo',
      muscleGroup: 'Personalízala a tu ritmo',
      estimatedDuration: null,
      href: '/routines',
    };
  }

  const muscleGroup = selectedRoutine.muscle_groups?.[0]
    ?? selectedRoutine.routine_exercises?.flatMap((item) => item.exercises?.muscle_groups ?? [])[0]
    ?? 'full body';
  const estimatedDuration = (selectedRoutine.routine_exercises?.length ?? 0) > 0
    ? (selectedRoutine.routine_exercises?.length ?? 0) * 10
    : null;

  return {
    id: selectedRoutine.id ?? null,
    name: selectedRoutine.name ?? 'Rutina sugerida',
    goalLabel: GOAL_LABELS[selectedRoutine.goal ?? ''] ?? (selectedRoutine.goal ?? 'Sin objetivo'),
    muscleGroup,
    estimatedDuration,
    href: activeSession?.id ? `/session?session_id=${activeSession.id}` : selectedRoutine.id ? `/session?routine_id=${selectedRoutine.id}` : '/routines',
  };
}

function getRecentSessionsSection(sessions: DashboardSession[]) {
  return sessions
    .filter((session) => session.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 3)
    .map((session) => ({
      routineName: session.routine_name ?? 'Sesión completada',
      completedAtLabel: new Date(session.completed_at!).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      muscleGroup: session.muscle_groups?.[0] ?? 'full body',
      volumeLabel: `${Math.round(Number(session.totalVolume) || 0).toLocaleString()} kg`,
    }));
}

export function buildDashboardViewModel(input: DashboardViewModelInput) {
  const chartSeries = getWeeklyVolume(input.recentSets);
  const totalWeeklyVolume = chartSeries.reduce((sum, item) => sum + item.volume, 0);
  const weeklyFrequency = getWeeklyFrequency(input.sessions);
  const streak = getStreak(input.sessions);
  const recentPrs = getRecentPRs(input.historySets);
  const recommendedRoutine = getRecommendedRoutine(input.routines, input.sessions, input.latestProgressLog);
  const recovery = getMuscleRecoveryStatus(input.sessions, input.recentSets);
  const overtraining = detectOvertraining(
    input.sessions
      .filter((session) => session.completed_at)
      .map((session) => ({ completed_at: session.completed_at, totalVolume: session.totalVolume ?? 0 })),
    input.latestProgressLog ? [input.latestProgressLog] : [],
  );
  const primaryExercise = recentPrs[0]?.exerciseName ?? input.historySets.find((set) => set.exercise_name)?.exercise_name ?? null;
  const nextPr = primaryExercise
    ? predictNextPR(
        input.historySets
          .filter((set) => set.exercise_name === primaryExercise)
          .map((set) => ({ logged_at: set.logged_at, weight: set.weight })),
      )
    : null;
  const nextRoutineSection = getNextRoutineSection(input.routines, recommendedRoutine.id, input.activeSession);
  const recentSessionsSection = getRecentSessionsSection(input.sessions);

  return {
    greeting: {
      title: `Dashboard de ${input.userName}`,
      subtitle: 'Tu rendimiento semanal, en un solo vistazo.',
    },
    banner: getSmartBannerState(input.activeSession, input.sessions, input.historySets, input.routines, input.userName, input.latestProgressLog),
    kpis: {
      weeklyVolume: {
        total: totalWeeklyVolume,
        series: chartSeries,
      },
      weeklyFrequency,
      streak: {
        value: streak,
        sparkline: chartSeries.map((item) => item.volume),
      },
      recentPr: {
        value: recentPrs[0]?.exerciseName ?? 'Sin PRs',
        detail: recentPrs[0] ? `+${recentPrs[0].increase} kg` : 'Completa una sesión para registrar marcas.',
      },
    },
    chart: {
      series: chartSeries,
      goalLine: Math.round(totalWeeklyVolume / Math.max(chartSeries.length, 1)),
    },
    predictions: {
      nextPr,
      recentPrs,
      recovery,
      overtraining,
      recommendedRoutine,
    },
    progressSnapshot: input.latestProgressLog ? {
      bodyWeightKg: input.latestProgressLog.body_weight_kg ?? null,
      fatigueLevel: input.latestProgressLog.fatigue_level ?? null,
      energyLevel: input.latestProgressLog.energy_level ?? null,
      symptoms: input.latestProgressLog.symptoms ?? [],
      logDate: input.latestProgressLog.log_date ?? null,
    } : null,
    sections: {
      nextRoutine: nextRoutineSection,
      recentSessions: recentSessionsSection,
    },
  };
}
