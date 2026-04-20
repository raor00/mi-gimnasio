import { c as createComponent } from './astro-component_BYjAEXvK.mjs';
import 'piccolore';
import { Q as renderTemplate, B as maybeRenderHead } from './sequence_CEhBxCfK.mjs';
import { r as renderComponent } from './entrypoint_CUJOs-4B.mjs';
import { $ as $$Layout, a as $$GlassCard } from './GlassCard_J3z-rMzJ.mjs';
import { s as supabaseServerClient } from './supabase-server_C-QUcOYR.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Login;
  const { cookies } = Astro2;
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    return Astro2.redirect("/routines");
  }
  const error = Astro2.url.searchParams.get("error");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Login - Mi Gimnasio" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center min-h-[80vh] w-full px-4"> ${renderComponent($$result2, "GlassCard", $$GlassCard, { "class": "w-full max-w-[400px] p-8 flex flex-col gap-6" }, { "default": async ($$result3) => renderTemplate` <div class="text-center"> <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">Bienvenido</h1> <p class="text-muted text-sm">Inicia sesión para continuar tu progreso</p> </div> ${error && renderTemplate`<div class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm text-center"> ${error} </div>`}<form action="/api/auth/signin" method="post" class="flex flex-col gap-4"> <div class="flex flex-col gap-2"> <label for="email" class="text-xs font-semibold uppercase tracking-wider text-white">Correo Electrónico</label> <input type="email" name="email" id="email" required class="bg-black/60 border border-surface-border p-3 rounded-md text-white focus:outline-none focus:border-primary transition-colors" placeholder="usuario@gimnasio.com"> </div> <div class="flex flex-col gap-2"> <label for="password" class="text-xs font-semibold uppercase tracking-wider text-white">Contraseña</label> <input type="password" name="password" id="password" required class="bg-black/60 border border-surface-border p-3 rounded-md text-white focus:outline-none focus:border-primary transition-colors" placeholder="••••••••"> </div> <button type="submit" class="w-full mt-4 bg-primary text-black font-bold py-3 rounded-md hover:brightness-110 transition-colors shadow-[0_0_15px_rgba(60,249,26,0.15)]">
Iniciar Sesión
</button> </form> <div class="border-t border-surface-border pt-4 text-center mt-2"> <p class="text-muted text-sm">
¿No tienes una cuenta?
<a href="/register" class="text-primary hover:underline font-medium">Regístrate aquí</a> </p> </div> ` })} </div> ` })}`;
}, "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/pages/login.astro", void 0);

const $$file = "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
