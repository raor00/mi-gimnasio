import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateWeightConverterState,
  convertWeight,
  formatConvertedWeight,
  getUnitsForMode,
  parseWeightInput,
  restoreWeightConverterState,
  swapWeightMode,
} from '../src/lib/weight-converter.ts';

test('parseWeightInput acepta decimales válidos y rechaza inválidos', () => {
  assert.equal(parseWeightInput('135'), 135);
  assert.equal(parseWeightInput('42,5'), 42.5);
  assert.equal(parseWeightInput(-1), null);
  assert.equal(parseWeightInput('foo'), null);
  assert.equal(parseWeightInput(''), null);
});

test('convertWeight convierte entre libras y kilogramos', () => {
  assert.equal(formatConvertedWeight(convertWeight(135, 'lb-to-kg')), '61.2');
  assert.equal(formatConvertedWeight(convertWeight(100, 'kg-to-lb')), '220.5');
});

test('getUnitsForMode devuelve etiquetas consistentes', () => {
  assert.deepEqual(getUnitsForMode('lb-to-kg'), { from: 'lb', to: 'kg' });
  assert.deepEqual(getUnitsForMode('kg-to-lb'), { from: 'kg', to: 'lb' });
});

test('swapWeightMode invierte la dirección y permite recalcular', () => {
  assert.equal(swapWeightMode('lb-to-kg'), 'kg-to-lb');
  assert.equal(swapWeightMode('kg-to-lb'), 'lb-to-kg');
  assert.deepEqual(calculateWeightConverterState('100', 'kg-to-lb'), {
    mode: 'kg-to-lb',
    inputValue: '100',
    resultValue: '220.5',
  });
});

test('restoreWeightConverterState recupera el último estado válido', () => {
  assert.deepEqual(
    restoreWeightConverterState('{"mode":"kg-to-lb","inputValue":"72","resultValue":"158.7"}'),
    { mode: 'kg-to-lb', inputValue: '72', resultValue: '158.7' },
  );

  assert.deepEqual(restoreWeightConverterState('{"mode":"oops"}'), {
    mode: 'lb-to-kg',
    inputValue: '',
    resultValue: '0.0',
  });
});
