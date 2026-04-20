import { c as createComponent } from './astro-component_BYjAEXvK.mjs';
import 'piccolore';
import { T as createRenderInstruction, F as Fragment, Q as renderTemplate, B as maybeRenderHead, a3 as addAttribute, b9 as renderHead, ba as renderSlot } from './sequence_CEhBxCfK.mjs';
import { r as renderComponent } from './entrypoint_C00J0Ypq.mjs';
/* empty css                 */
import 'clsx';

async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}</script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"></script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}

const $$Sidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Sidebar;
  const currentPath = Astro2.url.pathname;
  const auth = Astro2.locals.auth;
  const session = auth?.session ?? null;
  const displayName = auth?.displayName ?? "Usuario";
  const initials = auth?.initials ?? "US";
  return renderTemplate`${session && renderTemplate`${renderComponent($$result, "Fragment", Fragment, {}, { "default": ($$result2) => renderTemplate`${maybeRenderHead()}<div class="sm:hidden flex items-center justify-between bg-surface backdrop-blur-md border-b border-surface-border p-4 z-30 sticky top-0"><div class="flex items-center gap-3"><div class="rounded-full size-8 bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-xs font-bold">${initials}</div><h1 class="text-white text-base font-medium">Mi Gimnasio</h1></div><button id="mobile-menu-btn" class="text-white p-1 hover:bg-surface-hover rounded-md transition-colors"><span class="material-symbols-outlined">menu</span></button></div><div id="sidebar-drawer" class="fixed sm:static inset-y-0 left-0 w-[240px] transform -translate-x-full sm:translate-x-0 transition-transform duration-300 ease-in-out bg-surface sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-md border-r border-surface-border p-4 z-40 flex flex-col justify-between sm:flex-shrink-0"><div class="flex flex-col gap-8"><!-- Desktop Profile --><div class="hidden sm:flex gap-3 items-center"><div class="rounded-full size-10 bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">${initials}</div><div class="flex flex-col overflow-hidden w-full"><h1 class="text-white text-base font-medium leading-normal truncate">${displayName}</h1><p class="text-primary text-xs font-normal leading-normal">Miembro Registrado</p></div></div><!-- Mobile Drawer Header --><div class="sm:hidden flex justify-between items-center mb-4"><div class="flex flex-col overflow-hidden"><h1 class="text-white text-sm font-medium leading-normal truncate">${displayName}</h1></div><button id="mobile-close-btn" class="text-white p-1 hover:bg-surface-hover rounded-md"><span class="material-symbols-outlined">close</span></button></div><!-- Navigation --><nav class="flex flex-col gap-2"><a href="/"${addAttribute(`flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg transition-colors group ${currentPath === "/" ? "bg-surface-hover border border-surface-border" : "hover:bg-surface-hover"}`, "class")}><div${addAttribute(`transition-colors ${currentPath === "/" ? "text-primary" : "text-muted group-hover:text-white"}`, "class")}><span class="material-symbols-outlined"${addAttribute(currentPath === "/" ? "font-variation-settings: 'FILL' 1;" : "", "style")}>home</span></div><p${addAttribute(`text-sm font-medium leading-normal transition-colors ${currentPath === "/" ? "text-primary" : "text-muted group-hover:text-white"}`, "class")}>Inicio</p></a><a href="/routines"${addAttribute(`flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg transition-colors group ${currentPath === "/routines" ? "bg-surface-hover border border-surface-border" : "hover:bg-surface-hover"}`, "class")}><div${addAttribute(`transition-colors ${currentPath === "/routines" ? "text-primary" : "text-muted group-hover:text-white"}`, "class")}><span class="material-symbols-outlined"${addAttribute(currentPath === "/routines" ? "font-variation-settings: 'FILL' 1;" : "", "style")}>list</span></div><p${addAttribute(`text-sm font-medium leading-normal transition-colors ${currentPath === "/routines" ? "text-primary" : "text-muted group-hover:text-white"}`, "class")}>Rutinas</p></a><a href="/calendar"${addAttribute(`flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg transition-colors group ${currentPath === "/calendar" ? "bg-surface-hover border border-surface-border" : "hover:bg-surface-hover"}`, "class")}><div${addAttribute(`transition-colors ${currentPath === "/calendar" ? "text-primary" : "text-muted group-hover:text-white"}`, "class")}><span class="material-symbols-outlined"${addAttribute(currentPath === "/calendar" ? "font-variation-settings: 'FILL' 1;" : "", "style")}>calendar_month</span></div><p${addAttribute(`text-sm font-medium leading-normal transition-colors ${currentPath === "/calendar" ? "text-primary" : "text-muted group-hover:text-white"}`, "class")}>Calendario</p></a><a href="/statistics"${addAttribute(`flex items-center gap-3 px-3 py-3 sm:py-2 rounded-lg transition-colors group ${currentPath === "/statistics" ? "bg-surface-hover border border-surface-border" : "hover:bg-surface-hover"}`, "class")}><div${addAttribute(`transition-colors ${currentPath === "/statistics" ? "text-primary" : "text-muted group-hover:text-white"}`, "class")}><span class="material-symbols-outlined"${addAttribute(currentPath === "/statistics" ? "font-variation-settings: 'FILL' 1;" : "", "style")}>bar_chart</span></div><p${addAttribute(`text-sm font-medium leading-normal transition-colors ${currentPath === "/statistics" ? "text-primary" : "text-muted group-hover:text-white"}`, "class")}>Estadísticas</p></a></nav></div><!-- Cerrar sesion --><a href="/api/auth/signout" class="flex items-center gap-3 px-3 py-3 sm:py-2 mt-8 rounded-lg transition-colors group hover:bg-red-500/10 border border-transparent hover:border-red-500/20"><div class="transition-colors text-red-500/70 group-hover:text-red-500"><span class="material-symbols-outlined">logout</span></div><p class="text-sm font-medium leading-normal transition-colors text-red-500/70 group-hover:text-red-500">Cerrar Sesión</p></a></div><div id="mobile-overlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 hidden sm:hidden"></div>${renderScript($$result2, "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/components/Sidebar.astro?astro&type=script&index=0&lang.ts")}` })}`}`;
}, "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/components/Sidebar.astro", void 0);

const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="es" class="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="theme-color" content="#050505"><title>${title} | Mi Gimnasio</title><!-- Fonts & Icons --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@100..700,0..1,0,24&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-app-bg text-gray-100 font-display min-h-screen relative overflow-x-hidden"> <!-- Decorative Gradient Orbs --> <div class="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0"></div> <div class="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0"></div> <div class="relative flex min-h-screen w-full flex-col z-10"> <!-- Layout wrapper --> <div class="flex flex-1 flex-col sm:flex-row h-full"> <!-- Sidebar (Mobile optimized to Drawer/Hamburger from inside Sidebar.astro) --> ${renderComponent($$result, "Sidebar", $$Sidebar, {})} <!-- Main Content --> <main class="flex-1 flex flex-col items-center py-8 px-4 sm:px-8 overflow-y-auto"> <div class="w-full max-w-[1000px] flex flex-col gap-8"> ${renderSlot($$result, $$slots["default"])} </div> </main> </div> </div> </body></html>`;
}, "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/layouts/Layout.astro", void 0);

const $$GlassCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$GlassCard;
  const { class: className = "" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div${addAttribute(`glass-card rounded-xl ${className}`, "class")}> ${renderSlot($$result, $$slots["default"])} </div>`;
}, "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/components/GlassCard.astro", void 0);

export { $$Layout as $, $$GlassCard as a };
