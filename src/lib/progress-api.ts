export const PROGRESS_SYMPTOM_OPTIONS = [
  'Dolor de espalda',
  'Dolor de rodilla',
  'Dolor de hombro',
  'Dolor de cadera',
  'Dolor de muñeca',
  'Tensión muscular',
  'Ninguno',
] as const;

export type ProgressLogRecord = {
  id?: string;
  user_id?: string;
  log_date: string;
  body_weight_kg?: number | null;
  body_fat_pct?: number | null;
  arm_cm?: number | null;
  chest_cm?: number | null;
  waist_cm?: number | null;
  thigh_cm?: number | null;
  fatigue_level?: number | null;
  energy_level?: number | null;
  sleep_quality?: number | null;
  symptoms?: string[] | null;
  notes?: string | null;
  created_at?: string;
};

export type ProgressInsertPayload = Omit<ProgressLogRecord, 'id' | 'user_id' | 'created_at'>;

export type ProgressRepository = {
  listRecentByUserId(userId: string): Promise<ProgressLogRecord[]>;
  insertByUserId(userId: string, payload: ProgressInsertPayload): Promise<ProgressLogRecord>;
};

type ProgressContext = {
  userId: string | null;
  repo: ProgressRepository;
};

type ProgressPostContext = ProgressContext & {
  body: Record<string, unknown>;
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function normalizeDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('La fecha es obligatoria y debe usar el formato YYYY-MM-DD.');
  }
  return value;
}

function normalizeOptionalFloat(value: unknown, min: number, max: number, label: string) {
  if (value === '' || value === null || value === undefined) return null;
  const normalized = Number.parseFloat(String(value));
  if (!Number.isFinite(normalized) || normalized < min || normalized > max) {
    throw new Error(`${label} fuera de rango. Usa un valor entre ${min} y ${max}.`);
  }
  return normalized;
}

function normalizeOptionalInteger(value: unknown, min: number, max: number, label: string) {
  if (value === '' || value === null || value === undefined) return null;
  const normalized = Number.parseInt(String(value), 10);
  if (!Number.isFinite(normalized) || normalized < min || normalized > max) {
    throw new Error(`${label} fuera de rango. Usa un valor entre ${min} y ${max}.`);
  }
  return normalized;
}

function normalizeSymptoms(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return [];
  const allowed = new Set(PROGRESS_SYMPTOM_OPTIONS);
  const unique = Array.from(new Set(value.filter((item): item is string => typeof item === 'string')));

  for (const symptom of unique) {
    if (!allowed.has(symptom as (typeof PROGRESS_SYMPTOM_OPTIONS)[number])) {
      throw new Error('Síntoma no válido.');
    }
  }

  if (unique.includes('Ninguno')) return ['Ninguno'];
  return unique;
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function normalizeProgressPayload(body: Record<string, unknown>): ProgressInsertPayload {
  return {
    log_date: normalizeDate(body.log_date),
    body_weight_kg: normalizeOptionalFloat(body.body_weight_kg, 20, 500, 'Peso corporal'),
    body_fat_pct: normalizeOptionalFloat(body.body_fat_pct, 0, 100, '% de grasa corporal'),
    arm_cm: normalizeOptionalFloat(body.arm_cm, 10, 100, 'Brazo'),
    chest_cm: normalizeOptionalFloat(body.chest_cm, 30, 200, 'Pecho'),
    waist_cm: normalizeOptionalFloat(body.waist_cm, 30, 200, 'Cintura'),
    thigh_cm: normalizeOptionalFloat(body.thigh_cm, 20, 120, 'Muslo'),
    fatigue_level: normalizeOptionalInteger(body.fatigue_level, 1, 10, 'Nivel de fatiga'),
    energy_level: normalizeOptionalInteger(body.energy_level, 1, 10, 'Nivel de energía'),
    sleep_quality: normalizeOptionalInteger(body.sleep_quality, 1, 10, 'Calidad de sueño'),
    symptoms: normalizeSymptoms(body.symptoms),
    notes: normalizeOptionalText(body.notes),
  };
}

export async function handleProgressGet({ userId, repo }: ProgressContext) {
  if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const logs = await repo.listRecentByUserId(userId);
    logs.sort((a, b) => String(b.log_date).localeCompare(String(a.log_date)));
    return jsonResponse({ logs });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'No se pudo cargar el progreso.' }, 500);
  }
}

export async function handleProgressPost({ userId, body, repo }: ProgressPostContext) {
  if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const payload = normalizeProgressPayload(body);
    const log = await repo.insertByUserId(userId, payload);
    return jsonResponse({ success: true, log }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo registrar el progreso.';
    const status = /fuera de rango|obligatoria|válido/.test(message) ? 400 : 500;
    return jsonResponse({ error: message }, status);
  }
}
