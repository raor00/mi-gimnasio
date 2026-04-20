export type WeightUnitMode = 'lb-to-kg' | 'kg-to-lb';

export interface WeightConverterState {
  mode: WeightUnitMode;
  inputValue: string;
  resultValue: string;
}

const LB_TO_KG = 0.45359237;

export function parseWeightInput(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;

  const normalized = typeof value === 'string' ? value.replace(',', '.').trim() : value;
  const parsed = typeof normalized === 'number' ? normalized : Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function convertWeight(value: number, mode: WeightUnitMode): number {
  if (mode === 'lb-to-kg') {
    return value * LB_TO_KG;
  }

  return value / LB_TO_KG;
}

export function formatConvertedWeight(value: number | null, digits = 1): string {
  if (value === null || !Number.isFinite(value)) {
    return '';
  }

  return value.toFixed(digits);
}

export function getUnitsForMode(mode: WeightUnitMode) {
  return mode === 'lb-to-kg'
    ? { from: 'lb', to: 'kg' }
    : { from: 'kg', to: 'lb' };
}

export function swapWeightMode(mode: WeightUnitMode): WeightUnitMode {
  return mode === 'lb-to-kg' ? 'kg-to-lb' : 'lb-to-kg';
}

export function calculateWeightConverterState(
  inputValue: string,
  mode: WeightUnitMode,
): WeightConverterState {
  const parsed = parseWeightInput(inputValue);

  return {
    mode,
    inputValue,
    resultValue: formatConvertedWeight(parsed === null ? null : convertWeight(parsed, mode)),
  };
}

export function restoreWeightConverterState(
  raw: string | null | undefined,
): WeightConverterState {
  const fallback: WeightConverterState = {
    mode: 'lb-to-kg',
    inputValue: '',
    resultValue: '0.0',
  };

  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fallback;

    return {
      mode: parsed.mode === 'kg-to-lb' ? 'kg-to-lb' : 'lb-to-kg',
      inputValue: typeof parsed.inputValue === 'string' ? parsed.inputValue : '',
      resultValue: typeof parsed.resultValue === 'string' ? parsed.resultValue : '0.0',
    };
  } catch {
    return fallback;
  }
}
