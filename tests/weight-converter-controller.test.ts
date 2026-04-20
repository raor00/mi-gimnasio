import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getWeightConverterMountPlan,
  getWeightConverterPresentation,
  shouldCloseOnEscape,
  shouldCloseOnOutsideInteraction,
  shouldRenderWeightConverter,
} from '../src/lib/weight-converter-controller.ts';

test('shouldRenderWeightConverter expone la herramienta solo a usuarios autenticados', () => {
  assert.equal(shouldRenderWeightConverter(true), true);
  assert.equal(shouldRenderWeightConverter(false), false);
});

test('getWeightConverterPresentation adapta mobile y desktop', () => {
  assert.equal(getWeightConverterPresentation(375), 'mobile-sheet');
  assert.equal(getWeightConverterPresentation(1024), 'desktop-popover');
});

test('getWeightConverterMountPlan separa layout autenticado, sesión standalone y pantallas públicas', () => {
  assert.deepEqual(getWeightConverterMountPlan({ hasSession: true }), {
    authenticated: true,
    desktopLayout: true,
    mobileSidebar: true,
    standaloneSession: false,
  });

  assert.deepEqual(getWeightConverterMountPlan({ hasSession: true, isStandaloneSession: true }), {
    authenticated: true,
    desktopLayout: false,
    mobileSidebar: false,
    standaloneSession: true,
  });

  assert.deepEqual(getWeightConverterMountPlan({ hasSession: false }), {
    authenticated: false,
    desktopLayout: false,
    mobileSidebar: false,
    standaloneSession: false,
  });
});

test('shouldCloseOnOutsideInteraction cierra solo cuando el click ocurre afuera', () => {
  assert.equal(shouldCloseOnOutsideInteraction(true, false), true);
  assert.equal(shouldCloseOnOutsideInteraction(true, true), false);
  assert.equal(shouldCloseOnOutsideInteraction(false, false), false);
});

test('shouldCloseOnEscape responde a Escape y no a otras teclas', () => {
  assert.equal(shouldCloseOnEscape(true, 'Escape'), true);
  assert.equal(shouldCloseOnEscape(true, 'Enter'), false);
  assert.equal(shouldCloseOnEscape(false, 'Escape'), false);
});
