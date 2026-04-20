import { c as createComponent } from './astro-component_BYjAEXvK.mjs';
import 'piccolore';
import { Q as renderTemplate, b8 as defineScriptVars, b9 as renderHead } from './sequence_CEhBxCfK.mjs';
import 'clsx';
import { s as supabaseServerClient } from './supabase-server_C-QUcOYR.mjs';
/* empty css                 */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Session = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Session;
  const auth = Astro2.locals.auth;
  const supabase = supabaseServerClient(Astro2.cookies);
  const userId = auth.userId;
  const url = Astro2.url;
  const routineIdParam = url.searchParams.get("routine_id");
  const sessionIdParam = url.searchParams.get("session_id");
  let workoutSession = null;
  let exercises = [];
  let sessionSets = [];
  if (routineIdParam) {
    const { data: existingSession } = await supabase.from("workout_sessions").select("id").eq("user_id", userId).is("completed_at", null).is("cancelled_at", null).order("started_at", { ascending: false }).limit(1).maybeSingle();
    if (existingSession) {
      return Astro2.redirect(`/session?session_id=${existingSession.id}`);
    }
    const { data: routine } = await supabase.from("routines").select(`
      id, name,
      routine_exercises (
        id, order_index, target_sets, target_reps,
        exercises (id, name, muscle_groups)
      )
    `).eq("id", routineIdParam).eq("user_id", userId).single();
    if (routine) {
      const { data: newSession } = await supabase.from("workout_sessions").insert({ user_id: userId, routine_id: routine.id, routine_name: routine.name }).select().single();
      if (newSession) {
        return Astro2.redirect(`/session?session_id=${newSession.id}`);
      }
    }
  }
  if (sessionIdParam) {
    const { data: ws } = await supabase.from("workout_sessions").select(`*, session_sets (*)`).eq("id", sessionIdParam).eq("user_id", userId).is("completed_at", null).is("cancelled_at", null).single();
    if (ws) {
      workoutSession = ws;
      sessionSets = ws.session_sets || [];
      if (ws.routine_id) {
        const { data: routineData } = await supabase.from("routines").select(`
          routine_exercises (
            id, order_index, target_sets, target_reps,
            exercises (id, name, muscle_groups)
          )
        `).eq("id", ws.routine_id).single();
        exercises = (routineData?.routine_exercises || []).sort((a, b) => a.order_index - b.order_index).map((re) => ({
          id: re.exercises.id,
          name: re.exercises.name,
          muscle_groups: re.exercises.muscle_groups,
          target_sets: re.target_sets,
          target_reps: re.target_reps
        }));
      }
    }
  }
  if (!workoutSession) {
    return Astro2.redirect("/routines");
  }
  const sessionJson = JSON.stringify(workoutSession);
  const exercisesJson = JSON.stringify(exercises);
  const setsJson = JSON.stringify(sessionSets);
  const startedAt = workoutSession.started_at;
  return renderTemplate(_a || (_a = __template(['<html lang="en" class="dark" data-astro-cid-3ijzgljf> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sesión activa — ', '</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@100..700,0..1,0,24&display=swap" rel="stylesheet">', '</head> <body class="bg-app-bg text-gray-100 font-display min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black" data-astro-cid-3ijzgljf> <div class="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.06)_0%,transparent_60%)]" data-astro-cid-3ijzgljf></div> <div class="relative z-10 flex flex-col items-center w-full min-h-screen pb-28" data-astro-cid-3ijzgljf> <!-- Top Nav --> <div class="w-full max-w-[600px] px-4 py-6 flex justify-between items-center" data-astro-cid-3ijzgljf> <button id="btn-cancel-session" type="button" class="flex items-center gap-2 text-muted hover:text-white transition-colors" data-astro-cid-3ijzgljf> <span class="material-symbols-outlined text-xl" data-astro-cid-3ijzgljf>close</span> <span class="text-sm font-medium tracking-wide" data-astro-cid-3ijzgljf>Cancelar</span> </button> <div class="glass-card px-4 py-1.5 rounded-full flex items-center gap-2 text-sm text-accent font-mono" data-astro-cid-3ijzgljf> <span class="w-2 h-2 rounded-full bg-accent animate-pulse" data-astro-cid-3ijzgljf></span> <span id="session-timer" data-astro-cid-3ijzgljf>00:00</span> </div> </div> <!-- Exercise Navigator --> <div class="w-full max-w-[600px] px-4 mb-4" data-astro-cid-3ijzgljf> <div class="flex gap-2 overflow-x-auto pb-2" id="exercise-tabs" data-astro-cid-3ijzgljf> <!-- Rendered by JS --> </div> </div> <!-- Main Content --> <div class="w-full max-w-[600px] px-4 flex-1 flex flex-col gap-6" data-astro-cid-3ijzgljf> <!-- Exercise Header --> <header id="exercise-header" class="pt-2 pb-4 border-b border-surface-border" data-astro-cid-3ijzgljf> <div id="session-feedback" class="hidden mb-4 rounded-lg border px-4 py-3 text-sm font-medium" data-astro-cid-3ijzgljf></div> <h1 id="exercise-title" class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1" data-astro-cid-3ijzgljf></h1> <p id="exercise-meta" class="text-muted font-medium text-sm" data-astro-cid-3ijzgljf></p> </header> <!-- Set Tracking --> <div id="sets-container" class="flex flex-col gap-3" data-astro-cid-3ijzgljf></div> <!-- Add Set Button --> <button id="btn-add-set" class="w-full py-4 rounded-md border border-dashed border-white/20 text-muted hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-medium" data-astro-cid-3ijzgljf> <span class="material-symbols-outlined" data-astro-cid-3ijzgljf>add</span> Añadir serie\n</button> <!-- Rest Timer --> <div id="rest-timer-container" class="hidden justify-center my-4" data-astro-cid-3ijzgljf> <div class="relative w-44 h-44 flex items-center justify-center glass-card rounded-full shadow-[0_0_30px_rgba(0,212,255,0.15)]" data-astro-cid-3ijzgljf> <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" data-astro-cid-3ijzgljf> <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.05)" stroke-width="4" data-astro-cid-3ijzgljf></circle> <circle id="rest-circle" class="text-accent transition-all duration-1000 ease-linear" cx="50" cy="50" fill="none" r="45" stroke="currentColor" stroke-dasharray="283" stroke-dashoffset="0" stroke-width="4" data-astro-cid-3ijzgljf></circle> </svg> <div class="flex flex-col items-center z-10" data-astro-cid-3ijzgljf> <span id="rest-display" class="text-2xl font-mono font-bold text-white tracking-wider" data-astro-cid-3ijzgljf>01:30</span> <span class="text-xs text-accent uppercase tracking-widest mt-1" data-astro-cid-3ijzgljf>Descanso</span> </div> <button id="btn-skip-rest" class="absolute -bottom-4 bg-app-bg border border-white/10 text-muted hover:text-white px-4 py-1 rounded-full text-xs font-medium" data-astro-cid-3ijzgljf>Saltar</button> </div> </div> <!-- Next Exercise --> <div id="next-exercise-section" class="hidden" data-astro-cid-3ijzgljf> <button id="btn-next-exercise" class="w-full py-3 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-2 font-medium text-sm" data-astro-cid-3ijzgljf> <span class="material-symbols-outlined text-sm" data-astro-cid-3ijzgljf>skip_next</span>\nSiguiente ejercicio\n</button> </div> </div> <!-- Fixed Footer --> <div class="fixed bottom-0 w-full glass-card border-t border-surface-border p-4 z-30" data-astro-cid-3ijzgljf> <div class="max-w-[600px] mx-auto" data-astro-cid-3ijzgljf> <button id="btn-finish" class="w-full py-4 bg-primary text-black font-bold text-lg rounded-md hover:brightness-110 transition-colors shadow-[0_0_20px_rgba(60,249,26,0.2)]" data-astro-cid-3ijzgljf>\nFinalizar entrenamiento\n</button> </div> </div> </div> <div id="cancel-session-modal" class="hidden fixed inset-0 z-50 items-center justify-center p-4" data-astro-cid-3ijzgljf> <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" data-astro-cid-3ijzgljf></div> <div class="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl" data-astro-cid-3ijzgljf> <h2 class="text-xl font-bold text-white" data-astro-cid-3ijzgljf>Descartar sesión</h2> <p class="mt-3 text-sm text-muted" data-astro-cid-3ijzgljf>La sesión se marcará como cancelada y no contará en tus estadísticas.</p> <div class="mt-6 flex justify-end gap-3" data-astro-cid-3ijzgljf> <button id="cancel-session-close" type="button" class="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white" data-astro-cid-3ijzgljf>Volver</button> <button id="cancel-session-confirm" type="button" class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20" data-astro-cid-3ijzgljf>Descartar</button> </div> </div> </div> <script>(function(){', `
  const workoutSession = JSON.parse(sessionJson);
  const exercises = JSON.parse(exercisesJson);
  // sets grouped by exercise: { [exerciseId]: [{id, set_number, weight, reps, completed}] }
  const persistedSets = JSON.parse(setsJson);
  let feedbackTimeout = null;

  function showSessionMessage(message, type = 'info') {
    const feedback = document.getElementById('session-feedback');
    if (!feedback) return;

    feedback.className = 'mb-4 rounded-lg border px-4 py-3 text-sm font-medium';
    if (type === 'error') {
      feedback.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-300');
    } else if (type === 'success') {
      feedback.classList.add('border-primary/30', 'bg-primary/10', 'text-primary');
    } else {
      feedback.classList.add('border-accent/30', 'bg-accent/10', 'text-accent');
    }

    feedback.textContent = message;
    feedback.classList.remove('hidden');
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => feedback.classList.add('hidden'), 4000);
  }

  function openCancelModal() {
    document.getElementById('cancel-session-modal').classList.remove('hidden');
    document.getElementById('cancel-session-modal').classList.add('flex');
  }

  function closeCancelModal() {
    document.getElementById('cancel-session-modal').classList.add('hidden');
    document.getElementById('cancel-session-modal').classList.remove('flex');
  }

  let currentExerciseIndex = 0;
  // sets[exerciseId] = array of set objects
  const sets = {};
  exercises.forEach(ex => {
    const exSets = persistedSets.filter(s => s.exercise_id === ex.id);
    sets[ex.id] = exSets.length > 0 ? exSets : Array.from({ length: ex.target_sets }, (_, i) => ({
      id: null, set_number: i + 1, weight: 0, reps: 10, rpe: null, rir: null, completed: false
    }));
  });

  // ─── Session Timer ────────────────────────────────────────────────
  const timerEl = document.getElementById('session-timer');
  const sessionStart = new Date(startedAt).getTime();

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    timerEl.textContent = \`\${m}:\${s}\`;
  }
  updateTimer();
  setInterval(updateTimer, 1000);

  // ─── Rest Timer ───────────────────────────────────────────────────
  const REST_DURATION = 90; // seconds
  let restInterval = null;
  let restRemaining = REST_DURATION;

  const restContainer = document.getElementById('rest-timer-container');
  const restDisplay = document.getElementById('rest-display');
  const restCircle = document.getElementById('rest-circle');
  const CIRCUMFERENCE = 283;

  function startRestTimer() {
    restRemaining = REST_DURATION;
    restContainer.classList.remove('hidden');
    restContainer.classList.add('flex');
    clearInterval(restInterval);

    restInterval = setInterval(() => {
      restRemaining--;
      const m = Math.floor(restRemaining / 60).toString().padStart(2, '0');
      const s = (restRemaining % 60).toString().padStart(2, '0');
      restDisplay.textContent = \`\${m}:\${s}\`;
      restCircle.style.strokeDashoffset = CIRCUMFERENCE * (1 - restRemaining / REST_DURATION);

      if (restRemaining <= 0) stopRestTimer();
    }, 1000);
  }

  function stopRestTimer() {
    clearInterval(restInterval);
    restContainer.classList.add('hidden');
    restContainer.classList.remove('flex');
  }

  document.getElementById('btn-skip-rest').addEventListener('click', stopRestTimer);

  // ─── Render Exercise Tabs ─────────────────────────────────────────
  function renderTabs() {
    const tabs = document.getElementById('exercise-tabs');
    tabs.innerHTML = exercises.map((ex, i) => {
      const done = (sets[ex.id] || []).filter(s => s.completed).length;
      const total = (sets[ex.id] || []).length;
      const isActive = i === currentExerciseIndex;
      return \`
        <button data-tab="\${i}" class="tab-btn flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all \${isActive ? 'bg-primary text-app-bg' : 'glass-card text-muted hover:text-white'}">
          \${ex.name.split(' ').slice(0,2).join(' ')}
          \${done > 0 ? \`<span class="ml-1 opacity-70">\${done}/\${total}</span>\` : ''}
        </button>\`;
    }).join('');

    tabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentExerciseIndex = parseInt(btn.dataset.tab);
        renderCurrentExercise();
      });
    });
  }

  // ─── Render Current Exercise ──────────────────────────────────────
  function renderCurrentExercise() {
    const ex = exercises[currentExerciseIndex];
    if (!ex) return;

    document.getElementById('exercise-title').textContent = ex.name;
    const nextEx = exercises[currentExerciseIndex + 1];
    document.getElementById('exercise-meta').textContent =
      ex.muscle_groups.join(', ') + (nextEx ? \` • Next: \${nextEx.name}\` : '');

    const nextSection = document.getElementById('next-exercise-section');
    if (nextEx) nextSection.classList.remove('hidden');
    else nextSection.classList.add('hidden');

    renderSets(ex);
    renderTabs();
  }

  // ─── Render Sets ──────────────────────────────────────────────────
  function renderSets(ex) {
    const container = document.getElementById('sets-container');
    container.innerHTML = '';
    const exSets = sets[ex.id] || [];

    exSets.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = \`glass-card rounded-lg p-4 flex flex-col gap-3 \${s.completed ? 'opacity-50' : 'border-l-4 border-l-accent shadow-[0_0_10px_rgba(0,212,255,0.08)]'}\`;
      row.id = \`set-row-\${i}\`;
      row.innerHTML = \`
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="text-white font-bold text-base">\${s.set_number}</span>
            <span class="text-xs font-mono px-2 py-0.5 bg-white/5 rounded text-muted border border-white/5">Objetivo: \${ex.target_reps} reps</span>
          </div>
          <input data-set-idx="\${i}" class="set-checkbox custom-checkbox" type="checkbox" \${s.completed ? 'checked' : ''}/>
        </div>
        <div class="flex gap-4">
          <div class="flex-1 flex flex-col gap-2">
            <label class="text-xs text-white uppercase tracking-wider font-semibold">Weight (kg)</label>
            <div class="flex items-center justify-between bg-black/60 rounded-md border border-white/20 p-1">
              <button class="stepper-btn" data-set-idx="\${i}" data-field="weight" data-delta="-2.5"><span class="material-symbols-outlined">remove</span></button>
              <input data-set-idx="\${i}" data-field="weight" class="set-input w-[60px] text-center bg-transparent border-none text-white font-bold text-lg outline-none" type="number" step="2.5" value="\${s.weight}"/>
              <button class="stepper-btn" data-set-idx="\${i}" data-field="weight" data-delta="2.5"><span class="material-symbols-outlined">add</span></button>
            </div>
          </div>
          <div class="flex-1 flex flex-col gap-2">
            <label class="text-xs text-white uppercase tracking-wider font-semibold">Reps</label>
            <div class="flex items-center justify-between bg-black/60 rounded-md border border-white/20 p-1">
              <button class="stepper-btn" data-set-idx="\${i}" data-field="reps" data-delta="-1"><span class="material-symbols-outlined">remove</span></button>
              <input data-set-idx="\${i}" data-field="reps" class="set-input w-[60px] text-center bg-transparent border-none text-white font-bold text-lg outline-none" type="number" value="\${s.reps}"/>
              <button class="stepper-btn" data-set-idx="\${i}" data-field="reps" data-delta="1"><span class="material-symbols-outlined">add</span></button>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-xs text-white uppercase tracking-wider font-semibold">RPE</label>
            <div class="flex items-center justify-between bg-black/60 rounded-md border border-white/20 p-1">
              <button class="stepper-btn" data-set-idx="\${i}" data-field="rpe" data-delta="-0.5"><span class="material-symbols-outlined">remove</span></button>
              <input data-set-idx="\${i}" data-field="rpe" class="set-input w-[60px] text-center bg-transparent border-none text-white font-bold text-lg outline-none" type="number" min="0" max="10" step="0.5" value="\${s.rpe ?? ''}" placeholder="8.0"/>
              <button class="stepper-btn" data-set-idx="\${i}" data-field="rpe" data-delta="0.5"><span class="material-symbols-outlined">add</span></button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-xs text-white uppercase tracking-wider font-semibold">RIR</label>
            <div class="flex items-center justify-between bg-black/60 rounded-md border border-white/20 p-1">
              <button class="stepper-btn" data-set-idx="\${i}" data-field="rir" data-delta="-1"><span class="material-symbols-outlined">remove</span></button>
              <input data-set-idx="\${i}" data-field="rir" class="set-input w-[60px] text-center bg-transparent border-none text-white font-bold text-lg outline-none" type="number" min="0" max="10" step="1" value="\${s.rir ?? ''}" placeholder="2"/>
              <button class="stepper-btn" data-set-idx="\${i}" data-field="rir" data-delta="1"><span class="material-symbols-outlined">add</span></button>
            </div>
          </div>
        </div>
      \`;
      container.appendChild(row);

      // Stepper buttons
      row.querySelectorAll('.stepper-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.setIdx);
          const field = btn.dataset.field;
          const delta = parseFloat(btn.dataset.delta);
          const input = row.querySelector(\`input[data-set-idx="\${idx}"][data-field="\${field}"]\`);
          const currentVal = parseFloat(input.value || '0');
          let newVal = Math.max(0, currentVal + delta);
          if (field === 'rpe') newVal = Math.min(10, newVal);
          if (field === 'rir') newVal = Math.min(10, newVal);
          input.value = field === 'weight' || field === 'rpe' ? newVal.toFixed(1) : String(Math.round(newVal));
          sets[ex.id][idx][field] = parseFloat(input.value);
        });
      });

      // Input changes
      row.querySelectorAll('.set-input').forEach(inp => {
        inp.addEventListener('change', () => {
          const idx = parseInt(inp.dataset.setIdx);
          const field = inp.dataset.field;
          if (!inp.value.trim()) {
            sets[ex.id][idx][field] = null;
            return;
          }
          let value = parseFloat(inp.value) || 0;
          if (field === 'rpe') value = Math.max(0, Math.min(10, value));
          if (field === 'rir') value = Math.max(0, Math.min(10, Math.round(value)));
          if (field === 'reps') value = Math.max(0, Math.round(value));
          sets[ex.id][idx][field] = value;
          inp.value = field === 'weight' || field === 'rpe' ? value.toFixed(1) : String(value);
        });
      });

      // Checkbox
      row.querySelector('.set-checkbox').addEventListener('change', async (e) => {
        const idx = parseInt(e.target.dataset.setIdx);
        const s = sets[ex.id][idx];
        s.completed = e.target.checked;

        // Persist to DB
        if (s.id) {
          const updateRes = await fetch(\`/api/sessions/\${workoutSession.id}/sets\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ set_id: s.id, completed: s.completed, weight: s.weight, reps: s.reps, rpe: s.rpe, rir: s.rir }),
          });
          if (!updateRes.ok) {
            showSessionMessage('No se pudo guardar la serie. Intenta de nuevo.', 'error');
            s.completed = false;
            renderSets(ex);
            return;
          }
        } else {
          const res = await fetch(\`/api/sessions/\${workoutSession.id}/sets\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exercise_id: ex.id,
              exercise_name: ex.name,
              set_number: s.set_number,
              weight: s.weight,
              reps: s.reps,
              rpe: s.rpe,
              rir: s.rir,
              completed: s.completed,
            }),
          });
          if (!res.ok) {
            showSessionMessage('No se pudo guardar la serie. Intenta de nuevo.', 'error');
            s.completed = false;
            renderSets(ex);
            return;
          }
          const saved = await res.json();
          sets[ex.id][idx] = {
            ...sets[ex.id][idx],
            ...saved,
          };
        }

        renderSets(ex);
        renderTabs();
        if (e.target.checked) startRestTimer();
      });
    });
  }

  // ─── Add Set ──────────────────────────────────────────────────────
  document.getElementById('btn-add-set').addEventListener('click', () => {
    const ex = exercises[currentExerciseIndex];
    const exSets = sets[ex.id];
    exSets.push({
      id: null,
      set_number: exSets.length + 1,
      weight: exSets[exSets.length - 1]?.weight || 0,
      reps: exSets[exSets.length - 1]?.reps || 10,
      rpe: exSets[exSets.length - 1]?.rpe ?? null,
      rir: exSets[exSets.length - 1]?.rir ?? null,
      completed: false
    });
    renderSets(ex);
  });

  document.getElementById('btn-cancel-session').addEventListener('click', async () => {
    openCancelModal();
  });

  document.getElementById('cancel-session-close').addEventListener('click', closeCancelModal);
  document.getElementById('cancel-session-confirm').addEventListener('click', async () => {
    closeCancelModal();

    const res = await fetch(\`/api/sessions/\${workoutSession.id}\`, { method: 'DELETE' });
    if (!res.ok) {
      showSessionMessage('No se pudo cancelar la sesión. Intenta de nuevo.', 'error');
      return;
    }

    window.location.href = '/';
  });

  // ─── Next Exercise ────────────────────────────────────────────────
  document.getElementById('btn-next-exercise').addEventListener('click', () => {
    if (currentExerciseIndex < exercises.length - 1) {
      currentExerciseIndex++;
      stopRestTimer();
      renderCurrentExercise();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // ─── Finish Workout ───────────────────────────────────────────────
  document.getElementById('btn-finish').addEventListener('click', async () => {
    const btn = document.getElementById('btn-finish');
    const completedSetCount = Object.values(sets).flat().filter((set) => set.completed).length;
    if (completedSetCount === 0) {
      showSessionMessage('Completa al menos una serie antes de finalizar el entrenamiento.', 'error');
      return;
    }

      btn.textContent = 'Guardando...';
    btn.disabled = true;
    clearInterval(restInterval);

    const res = await fetch(\`/api/sessions/\${workoutSession.id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_at: new Date().toISOString() }),
    });

    if (!res.ok) {
      let message = 'No se pudo finalizar la sesión. Intenta de nuevo.';
      try {
        const payload = await res.json();
        if (payload?.error) {
          message = payload.error;
        }
      } catch {}

      btn.textContent = 'Finalizar entrenamiento';
      btn.disabled = false;
      showSessionMessage(message, 'error');
      return;
    }

    window.location.href = '/';
  });

  // ─── Init ─────────────────────────────────────────────────────────
  renderCurrentExercise();
})();<\/script></body></html>`], ['<html lang="en" class="dark" data-astro-cid-3ijzgljf> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sesión activa — ', '</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@100..700,0..1,0,24&display=swap" rel="stylesheet">', '</head> <body class="bg-app-bg text-gray-100 font-display min-h-screen relative overflow-x-hidden selection:bg-primary selection:text-black" data-astro-cid-3ijzgljf> <div class="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.06)_0%,transparent_60%)]" data-astro-cid-3ijzgljf></div> <div class="relative z-10 flex flex-col items-center w-full min-h-screen pb-28" data-astro-cid-3ijzgljf> <!-- Top Nav --> <div class="w-full max-w-[600px] px-4 py-6 flex justify-between items-center" data-astro-cid-3ijzgljf> <button id="btn-cancel-session" type="button" class="flex items-center gap-2 text-muted hover:text-white transition-colors" data-astro-cid-3ijzgljf> <span class="material-symbols-outlined text-xl" data-astro-cid-3ijzgljf>close</span> <span class="text-sm font-medium tracking-wide" data-astro-cid-3ijzgljf>Cancelar</span> </button> <div class="glass-card px-4 py-1.5 rounded-full flex items-center gap-2 text-sm text-accent font-mono" data-astro-cid-3ijzgljf> <span class="w-2 h-2 rounded-full bg-accent animate-pulse" data-astro-cid-3ijzgljf></span> <span id="session-timer" data-astro-cid-3ijzgljf>00:00</span> </div> </div> <!-- Exercise Navigator --> <div class="w-full max-w-[600px] px-4 mb-4" data-astro-cid-3ijzgljf> <div class="flex gap-2 overflow-x-auto pb-2" id="exercise-tabs" data-astro-cid-3ijzgljf> <!-- Rendered by JS --> </div> </div> <!-- Main Content --> <div class="w-full max-w-[600px] px-4 flex-1 flex flex-col gap-6" data-astro-cid-3ijzgljf> <!-- Exercise Header --> <header id="exercise-header" class="pt-2 pb-4 border-b border-surface-border" data-astro-cid-3ijzgljf> <div id="session-feedback" class="hidden mb-4 rounded-lg border px-4 py-3 text-sm font-medium" data-astro-cid-3ijzgljf></div> <h1 id="exercise-title" class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1" data-astro-cid-3ijzgljf></h1> <p id="exercise-meta" class="text-muted font-medium text-sm" data-astro-cid-3ijzgljf></p> </header> <!-- Set Tracking --> <div id="sets-container" class="flex flex-col gap-3" data-astro-cid-3ijzgljf></div> <!-- Add Set Button --> <button id="btn-add-set" class="w-full py-4 rounded-md border border-dashed border-white/20 text-muted hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-medium" data-astro-cid-3ijzgljf> <span class="material-symbols-outlined" data-astro-cid-3ijzgljf>add</span> Añadir serie\n</button> <!-- Rest Timer --> <div id="rest-timer-container" class="hidden justify-center my-4" data-astro-cid-3ijzgljf> <div class="relative w-44 h-44 flex items-center justify-center glass-card rounded-full shadow-[0_0_30px_rgba(0,212,255,0.15)]" data-astro-cid-3ijzgljf> <svg class="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" data-astro-cid-3ijzgljf> <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.05)" stroke-width="4" data-astro-cid-3ijzgljf></circle> <circle id="rest-circle" class="text-accent transition-all duration-1000 ease-linear" cx="50" cy="50" fill="none" r="45" stroke="currentColor" stroke-dasharray="283" stroke-dashoffset="0" stroke-width="4" data-astro-cid-3ijzgljf></circle> </svg> <div class="flex flex-col items-center z-10" data-astro-cid-3ijzgljf> <span id="rest-display" class="text-2xl font-mono font-bold text-white tracking-wider" data-astro-cid-3ijzgljf>01:30</span> <span class="text-xs text-accent uppercase tracking-widest mt-1" data-astro-cid-3ijzgljf>Descanso</span> </div> <button id="btn-skip-rest" class="absolute -bottom-4 bg-app-bg border border-white/10 text-muted hover:text-white px-4 py-1 rounded-full text-xs font-medium" data-astro-cid-3ijzgljf>Saltar</button> </div> </div> <!-- Next Exercise --> <div id="next-exercise-section" class="hidden" data-astro-cid-3ijzgljf> <button id="btn-next-exercise" class="w-full py-3 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors flex items-center justify-center gap-2 font-medium text-sm" data-astro-cid-3ijzgljf> <span class="material-symbols-outlined text-sm" data-astro-cid-3ijzgljf>skip_next</span>\nSiguiente ejercicio\n</button> </div> </div> <!-- Fixed Footer --> <div class="fixed bottom-0 w-full glass-card border-t border-surface-border p-4 z-30" data-astro-cid-3ijzgljf> <div class="max-w-[600px] mx-auto" data-astro-cid-3ijzgljf> <button id="btn-finish" class="w-full py-4 bg-primary text-black font-bold text-lg rounded-md hover:brightness-110 transition-colors shadow-[0_0_20px_rgba(60,249,26,0.2)]" data-astro-cid-3ijzgljf>\nFinalizar entrenamiento\n</button> </div> </div> </div> <div id="cancel-session-modal" class="hidden fixed inset-0 z-50 items-center justify-center p-4" data-astro-cid-3ijzgljf> <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" data-astro-cid-3ijzgljf></div> <div class="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl" data-astro-cid-3ijzgljf> <h2 class="text-xl font-bold text-white" data-astro-cid-3ijzgljf>Descartar sesión</h2> <p class="mt-3 text-sm text-muted" data-astro-cid-3ijzgljf>La sesión se marcará como cancelada y no contará en tus estadísticas.</p> <div class="mt-6 flex justify-end gap-3" data-astro-cid-3ijzgljf> <button id="cancel-session-close" type="button" class="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white" data-astro-cid-3ijzgljf>Volver</button> <button id="cancel-session-confirm" type="button" class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20" data-astro-cid-3ijzgljf>Descartar</button> </div> </div> </div> <script>(function(){', `
  const workoutSession = JSON.parse(sessionJson);
  const exercises = JSON.parse(exercisesJson);
  // sets grouped by exercise: { [exerciseId]: [{id, set_number, weight, reps, completed}] }
  const persistedSets = JSON.parse(setsJson);
  let feedbackTimeout = null;

  function showSessionMessage(message, type = 'info') {
    const feedback = document.getElementById('session-feedback');
    if (!feedback) return;

    feedback.className = 'mb-4 rounded-lg border px-4 py-3 text-sm font-medium';
    if (type === 'error') {
      feedback.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-300');
    } else if (type === 'success') {
      feedback.classList.add('border-primary/30', 'bg-primary/10', 'text-primary');
    } else {
      feedback.classList.add('border-accent/30', 'bg-accent/10', 'text-accent');
    }

    feedback.textContent = message;
    feedback.classList.remove('hidden');
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => feedback.classList.add('hidden'), 4000);
  }

  function openCancelModal() {
    document.getElementById('cancel-session-modal').classList.remove('hidden');
    document.getElementById('cancel-session-modal').classList.add('flex');
  }

  function closeCancelModal() {
    document.getElementById('cancel-session-modal').classList.add('hidden');
    document.getElementById('cancel-session-modal').classList.remove('flex');
  }

  let currentExerciseIndex = 0;
  // sets[exerciseId] = array of set objects
  const sets = {};
  exercises.forEach(ex => {
    const exSets = persistedSets.filter(s => s.exercise_id === ex.id);
    sets[ex.id] = exSets.length > 0 ? exSets : Array.from({ length: ex.target_sets }, (_, i) => ({
      id: null, set_number: i + 1, weight: 0, reps: 10, rpe: null, rir: null, completed: false
    }));
  });

  // ─── Session Timer ────────────────────────────────────────────────
  const timerEl = document.getElementById('session-timer');
  const sessionStart = new Date(startedAt).getTime();

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');
    timerEl.textContent = \\\`\\\${m}:\\\${s}\\\`;
  }
  updateTimer();
  setInterval(updateTimer, 1000);

  // ─── Rest Timer ───────────────────────────────────────────────────
  const REST_DURATION = 90; // seconds
  let restInterval = null;
  let restRemaining = REST_DURATION;

  const restContainer = document.getElementById('rest-timer-container');
  const restDisplay = document.getElementById('rest-display');
  const restCircle = document.getElementById('rest-circle');
  const CIRCUMFERENCE = 283;

  function startRestTimer() {
    restRemaining = REST_DURATION;
    restContainer.classList.remove('hidden');
    restContainer.classList.add('flex');
    clearInterval(restInterval);

    restInterval = setInterval(() => {
      restRemaining--;
      const m = Math.floor(restRemaining / 60).toString().padStart(2, '0');
      const s = (restRemaining % 60).toString().padStart(2, '0');
      restDisplay.textContent = \\\`\\\${m}:\\\${s}\\\`;
      restCircle.style.strokeDashoffset = CIRCUMFERENCE * (1 - restRemaining / REST_DURATION);

      if (restRemaining <= 0) stopRestTimer();
    }, 1000);
  }

  function stopRestTimer() {
    clearInterval(restInterval);
    restContainer.classList.add('hidden');
    restContainer.classList.remove('flex');
  }

  document.getElementById('btn-skip-rest').addEventListener('click', stopRestTimer);

  // ─── Render Exercise Tabs ─────────────────────────────────────────
  function renderTabs() {
    const tabs = document.getElementById('exercise-tabs');
    tabs.innerHTML = exercises.map((ex, i) => {
      const done = (sets[ex.id] || []).filter(s => s.completed).length;
      const total = (sets[ex.id] || []).length;
      const isActive = i === currentExerciseIndex;
      return \\\`
        <button data-tab="\\\${i}" class="tab-btn flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all \\\${isActive ? 'bg-primary text-app-bg' : 'glass-card text-muted hover:text-white'}">
          \\\${ex.name.split(' ').slice(0,2).join(' ')}
          \\\${done > 0 ? \\\`<span class="ml-1 opacity-70">\\\${done}/\\\${total}</span>\\\` : ''}
        </button>\\\`;
    }).join('');

    tabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentExerciseIndex = parseInt(btn.dataset.tab);
        renderCurrentExercise();
      });
    });
  }

  // ─── Render Current Exercise ──────────────────────────────────────
  function renderCurrentExercise() {
    const ex = exercises[currentExerciseIndex];
    if (!ex) return;

    document.getElementById('exercise-title').textContent = ex.name;
    const nextEx = exercises[currentExerciseIndex + 1];
    document.getElementById('exercise-meta').textContent =
      ex.muscle_groups.join(', ') + (nextEx ? \\\` • Next: \\\${nextEx.name}\\\` : '');

    const nextSection = document.getElementById('next-exercise-section');
    if (nextEx) nextSection.classList.remove('hidden');
    else nextSection.classList.add('hidden');

    renderSets(ex);
    renderTabs();
  }

  // ─── Render Sets ──────────────────────────────────────────────────
  function renderSets(ex) {
    const container = document.getElementById('sets-container');
    container.innerHTML = '';
    const exSets = sets[ex.id] || [];

    exSets.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = \\\`glass-card rounded-lg p-4 flex flex-col gap-3 \\\${s.completed ? 'opacity-50' : 'border-l-4 border-l-accent shadow-[0_0_10px_rgba(0,212,255,0.08)]'}\\\`;
      row.id = \\\`set-row-\\\${i}\\\`;
      row.innerHTML = \\\`
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="text-white font-bold text-base">\\\${s.set_number}</span>
            <span class="text-xs font-mono px-2 py-0.5 bg-white/5 rounded text-muted border border-white/5">Objetivo: \\\${ex.target_reps} reps</span>
          </div>
          <input data-set-idx="\\\${i}" class="set-checkbox custom-checkbox" type="checkbox" \\\${s.completed ? 'checked' : ''}/>
        </div>
        <div class="flex gap-4">
          <div class="flex-1 flex flex-col gap-2">
            <label class="text-xs text-white uppercase tracking-wider font-semibold">Weight (kg)</label>
            <div class="flex items-center justify-between bg-black/60 rounded-md border border-white/20 p-1">
              <button class="stepper-btn" data-set-idx="\\\${i}" data-field="weight" data-delta="-2.5"><span class="material-symbols-outlined">remove</span></button>
              <input data-set-idx="\\\${i}" data-field="weight" class="set-input w-[60px] text-center bg-transparent border-none text-white font-bold text-lg outline-none" type="number" step="2.5" value="\\\${s.weight}"/>
              <button class="stepper-btn" data-set-idx="\\\${i}" data-field="weight" data-delta="2.5"><span class="material-symbols-outlined">add</span></button>
            </div>
          </div>
          <div class="flex-1 flex flex-col gap-2">
            <label class="text-xs text-white uppercase tracking-wider font-semibold">Reps</label>
            <div class="flex items-center justify-between bg-black/60 rounded-md border border-white/20 p-1">
              <button class="stepper-btn" data-set-idx="\\\${i}" data-field="reps" data-delta="-1"><span class="material-symbols-outlined">remove</span></button>
              <input data-set-idx="\\\${i}" data-field="reps" class="set-input w-[60px] text-center bg-transparent border-none text-white font-bold text-lg outline-none" type="number" value="\\\${s.reps}"/>
              <button class="stepper-btn" data-set-idx="\\\${i}" data-field="reps" data-delta="1"><span class="material-symbols-outlined">add</span></button>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-xs text-white uppercase tracking-wider font-semibold">RPE</label>
            <div class="flex items-center justify-between bg-black/60 rounded-md border border-white/20 p-1">
              <button class="stepper-btn" data-set-idx="\\\${i}" data-field="rpe" data-delta="-0.5"><span class="material-symbols-outlined">remove</span></button>
              <input data-set-idx="\\\${i}" data-field="rpe" class="set-input w-[60px] text-center bg-transparent border-none text-white font-bold text-lg outline-none" type="number" min="0" max="10" step="0.5" value="\\\${s.rpe ?? ''}" placeholder="8.0"/>
              <button class="stepper-btn" data-set-idx="\\\${i}" data-field="rpe" data-delta="0.5"><span class="material-symbols-outlined">add</span></button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-xs text-white uppercase tracking-wider font-semibold">RIR</label>
            <div class="flex items-center justify-between bg-black/60 rounded-md border border-white/20 p-1">
              <button class="stepper-btn" data-set-idx="\\\${i}" data-field="rir" data-delta="-1"><span class="material-symbols-outlined">remove</span></button>
              <input data-set-idx="\\\${i}" data-field="rir" class="set-input w-[60px] text-center bg-transparent border-none text-white font-bold text-lg outline-none" type="number" min="0" max="10" step="1" value="\\\${s.rir ?? ''}" placeholder="2"/>
              <button class="stepper-btn" data-set-idx="\\\${i}" data-field="rir" data-delta="1"><span class="material-symbols-outlined">add</span></button>
            </div>
          </div>
        </div>
      \\\`;
      container.appendChild(row);

      // Stepper buttons
      row.querySelectorAll('.stepper-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.setIdx);
          const field = btn.dataset.field;
          const delta = parseFloat(btn.dataset.delta);
          const input = row.querySelector(\\\`input[data-set-idx="\\\${idx}"][data-field="\\\${field}"]\\\`);
          const currentVal = parseFloat(input.value || '0');
          let newVal = Math.max(0, currentVal + delta);
          if (field === 'rpe') newVal = Math.min(10, newVal);
          if (field === 'rir') newVal = Math.min(10, newVal);
          input.value = field === 'weight' || field === 'rpe' ? newVal.toFixed(1) : String(Math.round(newVal));
          sets[ex.id][idx][field] = parseFloat(input.value);
        });
      });

      // Input changes
      row.querySelectorAll('.set-input').forEach(inp => {
        inp.addEventListener('change', () => {
          const idx = parseInt(inp.dataset.setIdx);
          const field = inp.dataset.field;
          if (!inp.value.trim()) {
            sets[ex.id][idx][field] = null;
            return;
          }
          let value = parseFloat(inp.value) || 0;
          if (field === 'rpe') value = Math.max(0, Math.min(10, value));
          if (field === 'rir') value = Math.max(0, Math.min(10, Math.round(value)));
          if (field === 'reps') value = Math.max(0, Math.round(value));
          sets[ex.id][idx][field] = value;
          inp.value = field === 'weight' || field === 'rpe' ? value.toFixed(1) : String(value);
        });
      });

      // Checkbox
      row.querySelector('.set-checkbox').addEventListener('change', async (e) => {
        const idx = parseInt(e.target.dataset.setIdx);
        const s = sets[ex.id][idx];
        s.completed = e.target.checked;

        // Persist to DB
        if (s.id) {
          const updateRes = await fetch(\\\`/api/sessions/\\\${workoutSession.id}/sets\\\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ set_id: s.id, completed: s.completed, weight: s.weight, reps: s.reps, rpe: s.rpe, rir: s.rir }),
          });
          if (!updateRes.ok) {
            showSessionMessage('No se pudo guardar la serie. Intenta de nuevo.', 'error');
            s.completed = false;
            renderSets(ex);
            return;
          }
        } else {
          const res = await fetch(\\\`/api/sessions/\\\${workoutSession.id}/sets\\\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exercise_id: ex.id,
              exercise_name: ex.name,
              set_number: s.set_number,
              weight: s.weight,
              reps: s.reps,
              rpe: s.rpe,
              rir: s.rir,
              completed: s.completed,
            }),
          });
          if (!res.ok) {
            showSessionMessage('No se pudo guardar la serie. Intenta de nuevo.', 'error');
            s.completed = false;
            renderSets(ex);
            return;
          }
          const saved = await res.json();
          sets[ex.id][idx] = {
            ...sets[ex.id][idx],
            ...saved,
          };
        }

        renderSets(ex);
        renderTabs();
        if (e.target.checked) startRestTimer();
      });
    });
  }

  // ─── Add Set ──────────────────────────────────────────────────────
  document.getElementById('btn-add-set').addEventListener('click', () => {
    const ex = exercises[currentExerciseIndex];
    const exSets = sets[ex.id];
    exSets.push({
      id: null,
      set_number: exSets.length + 1,
      weight: exSets[exSets.length - 1]?.weight || 0,
      reps: exSets[exSets.length - 1]?.reps || 10,
      rpe: exSets[exSets.length - 1]?.rpe ?? null,
      rir: exSets[exSets.length - 1]?.rir ?? null,
      completed: false
    });
    renderSets(ex);
  });

  document.getElementById('btn-cancel-session').addEventListener('click', async () => {
    openCancelModal();
  });

  document.getElementById('cancel-session-close').addEventListener('click', closeCancelModal);
  document.getElementById('cancel-session-confirm').addEventListener('click', async () => {
    closeCancelModal();

    const res = await fetch(\\\`/api/sessions/\\\${workoutSession.id}\\\`, { method: 'DELETE' });
    if (!res.ok) {
      showSessionMessage('No se pudo cancelar la sesión. Intenta de nuevo.', 'error');
      return;
    }

    window.location.href = '/';
  });

  // ─── Next Exercise ────────────────────────────────────────────────
  document.getElementById('btn-next-exercise').addEventListener('click', () => {
    if (currentExerciseIndex < exercises.length - 1) {
      currentExerciseIndex++;
      stopRestTimer();
      renderCurrentExercise();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // ─── Finish Workout ───────────────────────────────────────────────
  document.getElementById('btn-finish').addEventListener('click', async () => {
    const btn = document.getElementById('btn-finish');
    const completedSetCount = Object.values(sets).flat().filter((set) => set.completed).length;
    if (completedSetCount === 0) {
      showSessionMessage('Completa al menos una serie antes de finalizar el entrenamiento.', 'error');
      return;
    }

      btn.textContent = 'Guardando...';
    btn.disabled = true;
    clearInterval(restInterval);

    const res = await fetch(\\\`/api/sessions/\\\${workoutSession.id}\\\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_at: new Date().toISOString() }),
    });

    if (!res.ok) {
      let message = 'No se pudo finalizar la sesión. Intenta de nuevo.';
      try {
        const payload = await res.json();
        if (payload?.error) {
          message = payload.error;
        }
      } catch {}

      btn.textContent = 'Finalizar entrenamiento';
      btn.disabled = false;
      showSessionMessage(message, 'error');
      return;
    }

    window.location.href = '/';
  });

  // ─── Init ─────────────────────────────────────────────────────────
  renderCurrentExercise();
})();<\/script></body></html>`])), workoutSession.routine_name, renderHead(), defineScriptVars({ sessionJson, exercisesJson, setsJson, startedAt }));
}, "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/pages/session.astro", void 0);

const $$file = "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/pages/session.astro";
const $$url = "/session";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Session,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
