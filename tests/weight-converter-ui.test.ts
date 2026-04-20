import test from 'node:test';
import assert from 'node:assert/strict';

import { initWeightConverterMenu } from '../src/lib/weight-converter-controller.ts';

class FakeClassList {
  private classes = new Set<string>(['hidden']);

  add(...names: string[]) {
    names.forEach((name) => this.classes.add(name));
  }

  remove(...names: string[]) {
    names.forEach((name) => this.classes.delete(name));
  }

  contains(name: string) {
    return this.classes.has(name);
  }
}

class FakeElement extends EventTarget {
  dataset: Record<string, string> = {};
  textContent = '';
  value = '';
  checked = false;
  focused = false;
  classList = new FakeClassList();
  private attributes = new Map<string, string>();
  private selectors = new Map<string, FakeElement>();

  querySelector<T extends FakeElement>(selector: string): T | null {
    return (this.selectors.get(selector) as T) || null;
  }

  register(selector: string, element: FakeElement) {
    this.selectors.set(selector, element);
  }

  contains(target: unknown) {
    if (target === this) return true;
    return Array.from(this.selectors.values()).includes(target as FakeElement);
  }

  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  focus() {
    this.focused = true;
  }
}

class FakeStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function createEnvironment(viewportWidth = 375) {
  const root = new FakeElement();
  root.dataset.storageKey = 'mi-gimnasio:weight-converter';

  const trigger = new FakeElement();
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'weight-converter-panel');

  const panel = new FakeElement();
  const input = new FakeElement();
  const result = new FakeElement();
  const modeLb = new FakeElement();
  const modeKg = new FakeElement();
  const unitFrom = new FakeElement();
  const unitTo = new FakeElement();
  const closeButton = new FakeElement();
  const swapButton = new FakeElement();

  root.register('[data-role="trigger"]', trigger);
  root.register('[data-role="panel"]', panel);
  root.register('[data-role="input"]', input);
  root.register('[data-role="result"]', result);
  root.register('input[value="lb-to-kg"]', modeLb);
  root.register('input[value="kg-to-lb"]', modeKg);
  root.register('[data-unit-from]', unitFrom);
  root.register('[data-unit-to]', unitTo);
  root.register('[data-close-converter]', closeButton);
  root.register('[data-swap-converter]', swapButton);

  panel.register('[data-unit-from]', unitFrom);
  panel.register('[data-unit-to]', unitTo);
  panel.register('[data-close-converter]', closeButton);
  panel.register('[data-swap-converter]', swapButton);

  const documentTarget = new EventTarget();
  const windowTarget = new EventTarget() as EventTarget & { innerWidth: number };
  windowTarget.innerWidth = viewportWidth;
  const localStorage = new FakeStorage();

  Object.assign(globalThis, {
    document: documentTarget,
    window: windowTarget,
    localStorage,
  });

  return { root, trigger, panel, input, result, modeLb, modeKg, unitFrom, unitTo, closeButton, swapButton, documentTarget, windowTarget, localStorage };
}

test('weight converter restores state and updates instantly while typing', () => {
  const env = createEnvironment(375);
  env.localStorage.setItem('mi-gimnasio:weight-converter', JSON.stringify({
    mode: 'kg-to-lb',
    inputValue: '72',
    resultValue: '158.7',
  }));

  initWeightConverterMenu(env.root as never);

  assert.equal(env.input.value, '72');
  assert.equal(env.result.textContent, '158.7');
  assert.equal(env.root.dataset.presentation, 'mobile-sheet');

  env.input.value = '100';
  env.input.dispatchEvent(new Event('input'));
  assert.equal(env.result.textContent, '220.5');
});

test('weight converter swaps direction and recalculates result', () => {
  const env = createEnvironment(1024);
  initWeightConverterMenu(env.root as never);

  env.input.value = '135';
  env.input.dispatchEvent(new Event('input'));
  assert.equal(env.result.textContent, '61.2');
  assert.equal(env.root.dataset.presentation, 'desktop-popover');

  env.swapButton.dispatchEvent(new Event('click'));
  assert.equal(env.result.textContent, '297.6');
});

test('mobile trigger opens a wide panel and desktop trigger keeps compact presentation', () => {
  const mobile = createEnvironment(390);
  initWeightConverterMenu(mobile.root as never);
  mobile.trigger.dispatchEvent(new Event('click'));
  assert.equal(mobile.root.dataset.presentation, 'mobile-sheet');
  assert.equal(mobile.panel.classList.contains('hidden'), false);

  const desktop = createEnvironment(1280);
  initWeightConverterMenu(desktop.root as never);
  desktop.trigger.dispatchEvent(new Event('click'));
  assert.equal(desktop.root.dataset.presentation, 'desktop-popover');
  assert.equal(desktop.panel.classList.contains('hidden'), false);
});

test('weight converter closes with outside click and Escape and restores focus', () => {
  const env = createEnvironment(375);
  initWeightConverterMenu(env.root as never);

  env.trigger.dispatchEvent(new Event('click'));
  assert.equal(env.trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(env.panel.classList.contains('hidden'), false);

  const outsideClick = new Event('click');
  Object.defineProperty(outsideClick, 'target', { value: new FakeElement() });
  env.documentTarget.dispatchEvent(outsideClick);
  assert.equal(env.trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(env.panel.classList.contains('hidden'), true);
  assert.equal(env.trigger.focused, true);

  env.trigger.focused = false;
  env.trigger.dispatchEvent(new Event('click'));
  const escapeEvent = new Event('keydown');
  Object.defineProperty(escapeEvent, 'key', { value: 'Escape' });
  env.documentTarget.dispatchEvent(escapeEvent);
  assert.equal(env.trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(env.trigger.focused, true);
});

test('weight converter keeps keyboard-friendly aria state and allows closing from the trigger', () => {
  const env = createEnvironment(375);
  initWeightConverterMenu(env.root as never);

  assert.equal(env.trigger.getAttribute('aria-controls'), 'weight-converter-panel');
  assert.equal(env.trigger.getAttribute('aria-expanded'), 'false');

  env.trigger.dispatchEvent(new Event('click'));
  assert.equal(env.trigger.getAttribute('aria-expanded'), 'true');

  env.trigger.dispatchEvent(new Event('click'));
  assert.equal(env.trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(env.trigger.focused, true);
});
