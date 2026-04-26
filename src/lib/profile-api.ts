export const PROFILE_GENDER_OPTIONS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'] as const;
export const PROFILE_EXPERIENCE_OPTIONS = ['Principiante', 'Intermedio', 'Avanzado'] as const;
export const PROFILE_UNITS_OPTIONS = ['kg', 'lbs'] as const;

type ProfileGender = (typeof PROFILE_GENDER_OPTIONS)[number];
type ProfileExperience = (typeof PROFILE_EXPERIENCE_OPTIONS)[number];
type ProfileUnits = (typeof PROFILE_UNITS_OPTIONS)[number];

export type ProfileRecord = {
  id: string;
  name?: string | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  gender?: ProfileGender | null;
  experience_level?: ProfileExperience | null;
  weekly_goal_sessions?: number | null;
  preferred_units?: ProfileUnits | null;
};

export type ProfileUpdatePayload = Omit<ProfileRecord, 'id'>;

export type ProfileRepository = {
  getByUserId(userId: string): Promise<ProfileRecord | null>;
  upsertByUserId(userId: string, payload: ProfileUpdatePayload): Promise<ProfileRecord>;
};

type ProfileContext = {
  userId: string | null;
  repo: ProfileRepository;
};

type ProfilePostContext = ProfileContext & {
  body: Record<string, unknown>;
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizeOptionalInteger(value: unknown, min: number, max: number, label: string) {
  if (value === '' || value === null || value === undefined) return null;
  const normalized = Number.parseInt(String(value), 10);
  if (!Number.isFinite(normalized) || normalized < min || normalized > max) {
    throw new Error(`${label} fuera de rango. Usa un valor entre ${min} y ${max}.`);
  }
  return normalized;
}

function normalizeOptionalFloat(value: unknown, min: number, max: number, label: string) {
  if (value === '' || value === null || value === undefined) return null;
  const normalized = Number.parseFloat(String(value));
  if (!Number.isFinite(normalized) || normalized < min || normalized > max) {
    throw new Error(`${label} fuera de rango. Usa un valor entre ${min} y ${max}.`);
  }
  return normalized;
}

function normalizeEnum<T extends readonly string[]>(value: unknown, allowed: T, label: string): T[number] | null {
  if (value === '' || value === null || value === undefined) return null;
  if (typeof value !== 'string' || !allowed.includes(value)) {
    throw new Error(`${label} no es válido.`);
  }
  return value as T[number];
}

export function normalizeProfilePayload(body: Record<string, unknown>): ProfileUpdatePayload {
  const name = normalizeOptionalText(body.name);
  if (name && name.length > 80) {
    throw new Error('El nombre no puede superar 80 caracteres.');
  }

  return {
    name,
    age: normalizeOptionalInteger(body.age, 10, 120, 'Edad'),
    height_cm: normalizeOptionalInteger(body.height_cm, 80, 260, 'Altura'),
    weight_kg: normalizeOptionalFloat(body.weight_kg, 20, 500, 'Peso corporal'),
    gender: normalizeEnum(body.gender, PROFILE_GENDER_OPTIONS, 'Género'),
    experience_level: normalizeEnum(body.experience_level, PROFILE_EXPERIENCE_OPTIONS, 'Nivel de experiencia'),
    weekly_goal_sessions: normalizeOptionalInteger(body.weekly_goal_sessions ?? 4, 1, 7, 'Meta semanal de sesiones'),
    preferred_units: normalizeEnum(body.preferred_units ?? 'kg', PROFILE_UNITS_OPTIONS, 'Unidades preferidas') ?? 'kg',
  };
}

export async function handleProfileGet({ userId, repo }: ProfileContext) {
  if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const profile = await repo.getByUserId(userId);
    return jsonResponse(profile ?? { id: userId, weekly_goal_sessions: 4, preferred_units: 'kg' });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'No se pudo cargar el perfil.' }, 500);
  }
}

export async function handleProfilePost({ userId, body, repo }: ProfilePostContext) {
  if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const payload = normalizeProfilePayload(body);
    const profile = await repo.upsertByUserId(userId, payload);
    return jsonResponse({ success: true, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar el perfil.';
    const status = /fuera de rango|no es válido|no puede superar/.test(message) ? 400 : 500;
    return jsonResponse({ error: message }, status);
  }
}
