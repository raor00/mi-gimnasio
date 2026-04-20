import { c as createComponent } from './astro-component_BYjAEXvK.mjs';
import 'piccolore';
import { Q as renderTemplate, b8 as defineScriptVars, B as maybeRenderHead, a3 as addAttribute } from './sequence_CEhBxCfK.mjs';
import { r as renderComponent } from './entrypoint_CUJOs-4B.mjs';
import { $ as $$Layout, a as $$GlassCard } from './GlassCard_J3z-rMzJ.mjs';
import { s as supabaseServerClient } from './supabase-server_C-QUcOYR.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Routines = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Routines;
  const auth = Astro2.locals.auth;
  const supabase = supabaseServerClient(Astro2.cookies);
  const userId = auth.userId;
  const [routinesResult, exercisesResult] = await Promise.all([
    supabase.from("routines").select(`
      id, name, goal, estimated_duration,
      routine_exercises (
        id, order_index, target_sets, target_reps,
        exercises (id, name, muscle_groups, category, equipment)
      )
    `).eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("exercises").select("id, name, muscle_groups, category, equipment").order("name")
  ]);
  const routines = routinesResult.data;
  const exercises = exercisesResult.data;
  const goalOptions = [
    { value: "hypertrophy", label: "Hipertrofia" },
    { value: "strength", label: "Fuerza" },
    { value: "endurance", label: "Resistencia" }
  ];
  const allMuscleGroups = [...new Set((exercises || []).flatMap((e) => e.muscle_groups))].sort();
  const routinesJson = JSON.stringify(routines || []);
  const exercisesJson = JSON.stringify(exercises || []);
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", `
  const routines = JSON.parse(routinesJson);
  const exercises = JSON.parse(exercisesJson);

  let editingRoutineId = null;
  let timelineExercises = [];
  let activeFilter = 'all';
  let feedbackTimeout = null;

  function showBuilderMessage(message, type = 'info') {
    const feedback = document.getElementById('builder-feedback');
    if (!feedback) return;

    feedback.className = 'rounded-lg border px-4 py-3 text-sm font-medium';
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

  function renderLibrary(filter) {
    if (filter === undefined) filter = '';
    const list = document.getElementById('routine-list');
    const empty = document.getElementById('empty-library');
    const filtered = routines.filter(function(r) { return r.name.toLowerCase().includes(filter.toLowerCase()); });
    if (filtered.length === 0) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    const goalColor = {
      hypertrophy: 'text-primary border-primary/30 bg-primary/10',
      strength: 'text-accent border-accent/30 bg-accent/10',
      endurance: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
    };

    list.innerHTML = filtered.map(function(r) {
      const exCount = r.routine_exercises ? r.routine_exercises.length : 0;
      const isActive = editingRoutineId === r.id;
      const muscles = (r.routine_exercises || []).flatMap(function(re) { return re.exercises ? re.exercises.muscle_groups : []; }).filter(function(v,i,a) { return a.indexOf(v)===i; }).slice(0,2);
      const gc = goalColor[r.goal] || goalColor.hypertrophy;
      const goalLabel = r.goal === 'strength' ? 'Fuerza' : r.goal === 'endurance' ? 'Resistencia' : 'Hipertrofia';
      return '<div data-routine-id="' + r.id + '" class="routine-card glass-card rounded-xl p-4 cursor-pointer transition-all ' + (isActive ? 'border-primary/40 bg-primary/5' : 'hover:bg-surface-hover') + '">'
        + '<div class="flex justify-between items-start mb-2">'
        + '<h3 class="font-bold text-base text-white">' + r.name + '</h3>'
        + '<button data-delete="' + r.id + '" class="text-white/20 hover:text-red-400 transition-colors p-1 -mr-1"><span class="material-symbols-outlined" style="font-size:18px">delete</span></button>'
        + '</div>'
        + '<p class="text-xs text-white/50 mb-3">' + exCount + ' ejercicio' + (exCount!==1?'s':'') + ' · ' + (r.estimated_duration || exCount*10) + ' min aprox.</p>'
        + '<div class="flex gap-2 flex-wrap">'
        + '<span class="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full border ' + gc + '">' + goalLabel + '</span>'
        + muscles.map(function(m) { return '<span class="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full border border-white/10 text-white/50 glass-card capitalize">' + m + '</span>'; }).join('')
        + '</div></div>';
    }).join('');

    list.querySelectorAll('.routine-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('[data-delete]')) return;
        loadRoutineIntoBuilder(card.dataset.routineId);
      });
    });
    list.querySelectorAll('[data-delete]').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); deleteRoutine(btn.dataset.delete); });
    });
  }

  function renderExercisePool() {
    const pool = document.getElementById('exercise-pool');
    if (!exercises.length) {
      document.getElementById('pool-count').textContent = '0 ejercicios';
      pool.innerHTML = '<div class="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-muted">No hay ejercicios cargados en la base de datos. Ejecuta el seed de ejercicios en Supabase.</div>';
      return;
    }
    const filtered = activeFilter === 'all' ? exercises : exercises.filter(function(e) { return e.muscle_groups.includes(activeFilter); });
    document.getElementById('pool-filter-label').textContent = activeFilter === 'all' ? '— Todos' : '— ' + activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1);
    document.getElementById('pool-count').textContent = filtered.length + ' ejercicios';

    pool.innerHTML = filtered.map(function(ex) {
      return '<div class="glass-card rounded-lg p-3 flex items-center justify-between hover:border-primary/40 transition-colors">'
        + '<div><p class="text-sm font-semibold text-white">' + ex.name + '</p>'
        + '<p class="text-[10px] text-white/40 uppercase tracking-wider">' + ex.category + ' · ' + ex.equipment + '</p></div>'
        + '<button type="button" data-ex-id="' + ex.id + '" data-ex-name="' + ex.name + '" class="add-ex-btn text-white/30 hover:text-primary transition-colors p-1 motion-button">'
        + '<span class="material-symbols-outlined" style="font-size:20px">add_circle</span></button></div>';
    }).join('');

    pool.querySelectorAll('.add-ex-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { addExerciseToTimeline(btn.dataset.exId, btn.dataset.exName); });
    });
  }

  function renderTimeline() {
    const timeline = document.getElementById('routine-timeline');
    const placeholder = document.getElementById('timeline-placeholder');
    timeline.querySelectorAll('.timeline-row').forEach(function(el) { el.remove(); });
    placeholder.style.display = timelineExercises.length === 0 ? 'flex' : 'none';

    timelineExercises.forEach(function(ex, i) {
      const row = document.createElement('div');
      row.className = 'timeline-row glass-card rounded-lg p-3 flex items-center gap-3';
      row.innerHTML = '<span class="text-primary font-bold text-sm w-5 text-center">' + (i+1) + '</span>'
        + '<div class="flex-1"><p class="text-sm font-semibold text-white">' + ex.name + '</p>'
        + '<div class="flex items-center gap-2 mt-1">'
        + '<input data-idx="' + i + '" data-field="sets" type="number" value="' + ex.target_sets + '" min="1" max="10" class="sets-input w-12 bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white text-center outline-none focus:border-primary/50"/>'
        + '<span class="text-white/30 text-xs">×</span>'
        + '<input data-idx="' + i + '" data-field="reps" type="text" value="' + ex.target_reps + '" class="reps-input w-14 bg-black/40 border border-white/10 rounded px-1.5 py-0.5 text-xs text-white text-center outline-none focus:border-primary/50"/>'
        + '<span class="text-white/30 text-xs">reps</span></div></div>'
        + '<button data-remove="' + i + '" class="remove-ex-btn text-white/20 hover:text-red-400 transition-colors p-1"><span class="material-symbols-outlined" style="font-size:18px">close</span></button>';
      timeline.appendChild(row);

      row.querySelector('[data-remove="' + i + '"]').addEventListener('click', function() { timelineExercises.splice(i,1); renderTimeline(); });
      row.querySelectorAll('input').forEach(function(inp) {
        inp.addEventListener('change', function() {
          const idx = parseInt(inp.dataset.idx);
          if (inp.dataset.field === 'sets') timelineExercises[idx].target_sets = parseInt(inp.value) || 3;
          if (inp.dataset.field === 'reps') timelineExercises[idx].target_reps = inp.value || '8-12';
        });
      });
    });
  }

  function addExerciseToTimeline(exerciseId, name) {
    if (timelineExercises.some(function(e) { return e.exercise_id === exerciseId; })) {
      showBuilderMessage('Ese ejercicio ya está dentro de la rutina.', 'info');
      return;
    }
    timelineExercises.push({ exercise_id: exerciseId, name: name, target_sets: 3, target_reps: '8-12' });
    renderTimeline();
    showBuilderMessage('Ejercicio añadido a la rutina.', 'success');
  }

  function loadRoutineIntoBuilder(routineId) {
    const routine = routines.find(function(r) { return r.id === routineId; });
    if (!routine) return;
    editingRoutineId = routineId;
    document.getElementById('routine-name-input').value = routine.name;
    document.querySelectorAll('input[name="routine-goal"]').forEach(function(r) { r.checked = r.value === routine.goal; });
    timelineExercises = (routine.routine_exercises || [])
      .sort(function(a, b) { return a.order_index - b.order_index; })
      .map(function(re) { return { exercise_id: re.exercises.id, name: re.exercises.name, target_sets: re.target_sets, target_reps: re.target_reps }; });
    renderTimeline();
    renderLibrary(document.getElementById('search-routines').value);
  }

  function clearBuilder() {
    editingRoutineId = null;
    timelineExercises = [];
    document.getElementById('routine-name-input').value = '';
    document.querySelectorAll('input[name="routine-goal"]').forEach(function(r) { r.checked = r.value === 'hypertrophy'; });
    renderTimeline();
    renderLibrary();
  }

  async function saveRoutine() {
    const name = document.getElementById('routine-name-input').value.trim();
    if (!name) { showBuilderMessage('Ingresa un nombre para la rutina.', 'error'); return; }
    if (name.length > 80) { showBuilderMessage('El nombre de la rutina no puede superar 80 caracteres.', 'error'); return; }
    if (timelineExercises.length === 0) { showBuilderMessage('Agrega al menos un ejercicio.', 'error'); return; }
    const goalEl = document.querySelector('input[name="routine-goal"]:checked');
    const goal = goalEl ? goalEl.value : 'hypertrophy';
    const body = {
      name: name, goal: goal,
      exercises: timelineExercises.map(function(ex, i) { return { exercise_id: ex.exercise_id, order_index: i, target_sets: ex.target_sets, target_reps: ex.target_reps }; })
    };
    const btn = document.getElementById('btn-save-routine');
    btn.textContent = 'Guardando...'; btn.disabled = true;
    try {
      const url = editingRoutineId ? '/api/routines/' + editingRoutineId : '/api/routines';
      const method = editingRoutineId ? 'PUT' : 'POST';
      const res = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
       if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         throw new Error(data.error || 'No se pudo guardar la rutina.');
       }
       showBuilderMessage(editingRoutineId ? 'Rutina actualizada correctamente.' : 'Rutina creada correctamente.', 'success');
       window.location.reload();
     } catch(err) {
       showBuilderMessage(err.message || 'Error guardando la rutina. Intenta de nuevo.', 'error');
       btn.textContent = 'Guardar rutina'; btn.disabled = false;
     }
   }

  async function deleteRoutine(id) {
    const routine = routines.find(function(r) { return r.id === id; });
    const confirmed = window.confirm('¿Eliminar la rutina' + (routine ? ' "' + routine.name + '"' : '') + '?');
    if (!confirmed) return;
    const res = await fetch('/api/routines/' + id, { method: 'DELETE' });
    if (!res.ok) {
      showBuilderMessage('No se pudo eliminar la rutina. Intenta de nuevo.', 'error');
      return;
    }
    const idx = routines.findIndex(function(r) { return r.id === id; });
    if (idx !== -1) routines.splice(idx, 1);
    if (editingRoutineId === id) clearBuilder();
    else renderLibrary(document.getElementById('search-routines').value);
    showBuilderMessage('Rutina eliminada.', 'success');
  }

  document.getElementById('btn-new-routine').addEventListener('click', clearBuilder);
  document.getElementById('btn-cancel').addEventListener('click', clearBuilder);
  document.getElementById('btn-save-routine').addEventListener('click', saveRoutine);
  document.getElementById('search-routines').addEventListener('input', function(e) { renderLibrary(e.target.value); });

  document.querySelectorAll('.muscle-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.muscle-btn').forEach(function(b) {
        b.classList.remove('border-primary/50','bg-primary/10','text-primary');
        b.classList.add('border-white/15','text-white/50');
      });
      btn.classList.add('border-primary/50','bg-primary/10','text-primary');
      btn.classList.remove('border-white/15','text-white/50');
      activeFilter = btn.dataset.muscle;
      renderExercisePool();
    });
  });

  renderLibrary();
  renderExercisePool();
  renderTimeline();
})();<\/script>`])), renderComponent($$result, "Layout", $$Layout, { "title": "Rutinas" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col lg:flex-row gap-6 w-full"> <!-- Left Pane: Library --> <section class="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-4"> <div class="flex items-center justify-between"> <h2 class="text-2xl font-bold tracking-tight text-white">Biblioteca</h2> <button type="button" id="btn-new-routine" class="bg-primary text-app-bg font-bold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_15px_rgba(60,249,26,0.3)] motion-button"> <span class="material-symbols-outlined" style="font-size: 18px;">add</span>
Nueva
</button> </div> ${renderComponent($$result2, "GlassCard", $$GlassCard, { "class": "p-2 flex items-center gap-2 !rounded-lg" }, { "default": async ($$result3) => renderTemplate` <span class="material-symbols-outlined text-white/40 ml-2" style="font-size: 20px;">search</span> <input id="search-routines" class="bg-transparent border-none text-sm text-white placeholder-[var(--color-muted)] focus:ring-0 w-full p-1 font-display outline-none" placeholder="Buscar rutinas..." type="text"> ` })} <div id="routine-list" class="flex flex-col gap-3 pb-4 min-h-[80px]"></div> <div id="empty-library" class="hidden text-center py-8 text-muted text-sm">Todavía no tienes rutinas. Crea la primera y empieza a organizar tus entrenamientos.</div> </section> <!-- Right Pane: Builder --> ${renderComponent($$result2, "GlassCard", $$GlassCard, { "class": "flex-1 flex flex-col gap-5 p-6 min-h-[600px] motion-card fade-in-up content-auto" }, { "default": async ($$result3) => renderTemplate` <div id="builder-feedback" class="hidden rounded-lg border px-4 py-3 text-sm font-medium"></div> <div class="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-muted"> <p class="font-semibold text-white mb-1">Cómo crear una rutina</p> <p>1. Escribe un nombre. 2. Elige el objetivo. 3. Filtra por músculo y añade ejercicios. 4. Ajusta series y repeticiones. 5. Guarda.</p> </div> <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-white/10 pb-4"> <div class="flex flex-col gap-2 flex-1"> <h2 class="text-2xl font-bold tracking-tight text-white">Constructor de rutinas</h2> <input id="routine-name-input" type="text" placeholder="Nombre de la rutina..." class="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 outline-none focus:border-primary/50 transition-colors w-full sm:max-w-[300px]"> <div class="flex gap-2 mt-1"> ${goalOptions.map(({ value, label }) => renderTemplate`<label class="flex items-center cursor-pointer"> <input type="radio" name="routine-goal"${addAttribute(value, "value")} class="sr-only peer"${addAttribute(value === "hypertrophy", "checked")}> <span class="text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-white/10 text-white/40 peer-checked:text-primary peer-checked:border-primary/50 peer-checked:bg-primary/10 transition-all cursor-pointer">${label}</span> </label>`)} </div> </div> <div class="flex gap-3"> <button type="button" id="btn-cancel" class="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors glass-card motion-button">Limpiar</button> <button type="button" id="btn-save-routine" class="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-app-bg hover:brightness-110 transition-colors motion-button">Guardar rutina</button> </div> </div> <div class="flex-1 flex flex-col md:flex-row gap-6"> <!-- Exercise Pool --> <div class="w-full md:w-1/2 flex flex-col gap-4"> <div> <p class="text-xs text-white/50 uppercase tracking-wider mb-2">Filtrar por músculo</p> <div class="flex flex-wrap gap-2"> <button type="button" data-muscle="all" class="muscle-btn text-[11px] font-bold uppercase px-3 py-1.5 rounded-full border border-primary/50 bg-primary/10 text-primary transition-all motion-button">Todos</button> ${allMuscleGroups.map((m) => renderTemplate`<button type="button"${addAttribute(m, "data-muscle")} class="muscle-btn text-[11px] font-bold uppercase px-3 py-1.5 rounded-full border border-white/15 text-white/50 transition-all hover:border-primary/40 hover:text-primary/80 capitalize motion-button">${m}</button>`)} </div> </div> <div class="flex flex-col gap-1.5"> <div class="flex items-center justify-between px-1"> <h3 class="text-sm font-bold text-white/80">Ejercicios <span id="pool-filter-label" class="text-primary">— Todos</span></h3> <span id="pool-count" class="text-xs text-white/40">Cargando...</span> </div> <div id="exercise-pool" class="overflow-y-auto max-h-[380px] flex flex-col gap-1.5 pr-1"></div> </div> </div> <!-- Routine Timeline --> <div class="w-full md:w-1/2 flex flex-col"> <h3 class="text-sm font-bold text-white/80 mb-3 px-1">Estructura de la rutina</h3> <div id="routine-timeline" class="flex-1 border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-4 overflow-y-auto flex flex-col gap-2 min-h-[300px]"> <div id="timeline-placeholder" class="h-20 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center text-primary/50 font-medium text-sm">
Pulsa [+] para añadir ejercicios
</div> </div> </div> </div> ` })} </div> ` }), defineScriptVars({ routinesJson, exercisesJson }));
}, "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/pages/routines.astro", void 0);

const $$file = "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/pages/routines.astro";
const $$url = "/routines";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Routines,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
