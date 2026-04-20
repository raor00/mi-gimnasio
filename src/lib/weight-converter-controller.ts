import {
  calculateWeightConverterState,
  getUnitsForMode,
  restoreWeightConverterState,
  swapWeightMode,
  type WeightConverterState,
} from './weight-converter.ts';

export function shouldRenderWeightConverter(hasSession: boolean) {
  return Boolean(hasSession);
}

export function getWeightConverterMountPlan(options: {
  hasSession: boolean;
  isStandaloneSession?: boolean;
}) {
  const authenticated = shouldRenderWeightConverter(options.hasSession);

  return {
    authenticated,
    desktopLayout: authenticated && !options.isStandaloneSession,
    mobileSidebar: authenticated && !options.isStandaloneSession,
    standaloneSession: authenticated && Boolean(options.isStandaloneSession),
  };
}

export function getWeightConverterPresentation(viewportWidth: number) {
  return viewportWidth < 640 ? 'mobile-sheet' : 'desktop-popover';
}

export function shouldCloseOnOutsideInteraction(isOpen: boolean, clickedInside: boolean) {
  return isOpen && !clickedInside;
}

export function shouldCloseOnEscape(isOpen: boolean, key: string) {
  return isOpen && key === 'Escape';
}

export function initWeightConverterMenus(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('[data-weight-converter-root]:not([data-weight-converter-ready="true"])')
    .forEach((element) => initWeightConverterMenu(element));
}

export function initWeightConverterMenu(root: HTMLElement) {
  const storageKey = root.dataset.storageKey || 'mi-gimnasio:weight-converter';
  const trigger = root.querySelector<HTMLButtonElement>('[data-role="trigger"]');
  const panel = root.querySelector<HTMLElement>('[data-role="panel"]');
  const input = root.querySelector<HTMLInputElement>('[data-role="input"]');
  const result = root.querySelector<HTMLOutputElement>('[data-role="result"]');
  const modeLb = root.querySelector<HTMLInputElement>('input[value="lb-to-kg"]');
  const modeKg = root.querySelector<HTMLInputElement>('input[value="kg-to-lb"]');
  const unitFrom = root.querySelector<HTMLElement>('[data-unit-from]');
  const unitTo = root.querySelector<HTMLElement>('[data-unit-to]');
  const closeButton = root.querySelector<HTMLButtonElement>('[data-close-converter]');
  const swapButton = root.querySelector<HTMLButtonElement>('[data-swap-converter]');

  if (!trigger || !panel || !input || !result || !modeLb || !modeKg || !unitFrom || !unitTo) {
    return null;
  }

  let state: WeightConverterState = restoreWeightConverterState(localStorage.getItem(storageKey));

  const syncPresentation = () => {
    root.dataset.presentation = getWeightConverterPresentation(window.innerWidth);
  };

  const render = () => {
    const units = getUnitsForMode(state.mode);
    modeLb.checked = state.mode === 'lb-to-kg';
    modeKg.checked = state.mode === 'kg-to-lb';
    input.value = state.inputValue;
    result.textContent = state.resultValue || '0.0';
    unitFrom.textContent = units.from;
    unitTo.textContent = units.to;
  };

  const persistState = () => {
    localStorage.setItem(storageKey, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('weight-converter:update', { detail: state }));
  };

  const applyState = (nextState: WeightConverterState) => {
    state = nextState;
    render();
    persistState();
  };

  const openPanel = () => {
    panel.classList.remove('hidden');
    trigger.setAttribute('aria-expanded', 'true');
  };

  const closePanel = () => {
    panel.classList.add('hidden');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  };

  const onTriggerClick = () => {
    state = restoreWeightConverterState(localStorage.getItem(storageKey));
    render();
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (isOpen) closePanel();
    else openPanel();
  };

  const onInput = () => applyState(calculateWeightConverterState(input.value, state.mode));
  const onLbChange = () => applyState(calculateWeightConverterState(input.value, 'lb-to-kg'));
  const onKgChange = () => applyState(calculateWeightConverterState(input.value, 'kg-to-lb'));
  const onSwap = () => applyState(calculateWeightConverterState(input.value, swapWeightMode(state.mode)));

  const onDocumentClick = (event: MouseEvent) => {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    const target = event.target;
    const clickedInside = Boolean(target) && root.contains(target as Node);
    if (shouldCloseOnOutsideInteraction(isOpen, clickedInside)) {
      closePanel();
    }
  };

  const onDocumentKeydown = (event: KeyboardEvent) => {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (shouldCloseOnEscape(isOpen, event.key)) {
      closePanel();
    }
  };

  const onSharedUpdate = (event: Event) => {
    const detail = (event as CustomEvent<WeightConverterState>).detail;
    if (!detail) return;
    state = detail;
    render();
  };

  const onResize = () => syncPresentation();

  trigger.addEventListener('click', onTriggerClick);
  input.addEventListener('input', onInput);
  modeLb.addEventListener('change', onLbChange);
  modeKg.addEventListener('change', onKgChange);
  swapButton?.addEventListener('click', onSwap);
  closeButton?.addEventListener('click', closePanel);
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onDocumentKeydown);
  window.addEventListener('weight-converter:update', onSharedUpdate as EventListener);
  window.addEventListener('resize', onResize);

  root.dataset.weightConverterReady = 'true';
  syncPresentation();
  render();

  return {
    cleanup() {
      trigger.removeEventListener('click', onTriggerClick);
      input.removeEventListener('input', onInput);
      modeLb.removeEventListener('change', onLbChange);
      modeKg.removeEventListener('change', onKgChange);
      swapButton?.removeEventListener('click', onSwap);
      closeButton?.removeEventListener('click', closePanel);
      document.removeEventListener('click', onDocumentClick);
      document.removeEventListener('keydown', onDocumentKeydown);
      window.removeEventListener('weight-converter:update', onSharedUpdate as EventListener);
      window.removeEventListener('resize', onResize);
      root.dataset.weightConverterReady = 'false';
    },
  };
}
