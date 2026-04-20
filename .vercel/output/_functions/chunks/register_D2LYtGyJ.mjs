import { c as createComponent } from './astro-component_BYjAEXvK.mjs';
import 'piccolore';
import { Q as renderTemplate, B as maybeRenderHead, F as Fragment } from './sequence_CEhBxCfK.mjs';
import { r as renderComponent } from './entrypoint_C00J0Ypq.mjs';
import { $ as $$Layout, a as $$GlassCard } from './GlassCard_DtCRIxwO.mjs';
import { s as supabaseServerClient } from './supabase-server_DmlcIR_W.mjs';

const $$Register = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Register;
  const { cookies } = Astro2;
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    return Astro2.redirect("/routines");
  }
  const error = Astro2.url.searchParams.get("error");
  const success = Astro2.url.searchParams.get("success");
  const status = Astro2.url.searchParams.get("status");
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Registro - Mi Gimnasio" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center min-h-[80vh] w-full px-4"> ${renderComponent($$result2, "GlassCard", $$GlassCard, { "class": "w-full max-w-[400px] p-8 flex flex-col gap-6" }, { "default": async ($$result3) => renderTemplate` <div class="text-center"> <h1 class="text-3xl font-bold text-white mb-2 tracking-tight">Crea una cuenta</h1> <p class="text-muted text-sm">Sé parte del sistema y guarda rutinas</p> </div> ${error && renderTemplate`<div class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm text-center"> ${error} </div>`}${success && renderTemplate`<div class="bg-primary/10 border border-primary/20 text-primary p-3 rounded-md text-sm text-center"> ${status === "authenticated" ? renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` <p>Cuenta creada exitosamente. Tu sesión se inició automáticamente.</p> <a href="/routines" class="mt-4 inline-flex items-center gap-2 font-bold underline"> <span>Ir a rutinas</span> <span class="material-symbols-outlined text-base">arrow_forward</span> </a> ` })}` : renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` <p>Cuenta creada correctamente, pero tu proyecto de Supabase exige confirmar el correo antes de iniciar sesión.</p> <p class="mt-3 text-primary/80">Revisa tu bandeja de entrada y confirma el email. Si estás en local y quieres entrar al instante, desactiva <strong>Email Confirmations</strong> en Supabase Auth.</p> <a href="/login" class="mt-4 inline-flex items-center gap-2 font-bold underline"> <span>Ir al login</span> <span class="material-symbols-outlined text-base">login</span> </a> ` })}`} </div>`}${!success && renderTemplate`<form action="/api/auth/register" method="post" class="flex flex-col gap-4"> <div class="flex flex-col gap-2"> <label for="email" class="text-xs font-semibold uppercase tracking-wider text-white">Correo Electrónico</label> <input type="email" name="email" id="email" required class="bg-black/60 border border-surface-border p-3 rounded-md text-white focus:outline-none focus:border-accent transition-colors" placeholder="tu@correo.com"> </div> <div class="flex flex-col gap-2"> <label for="password" class="text-xs font-semibold uppercase tracking-wider text-white">Contraseña (Mínimo 6)</label> <input type="password" name="password" id="password" required minlength="6" class="bg-black/60 border border-surface-border p-3 rounded-md text-white focus:outline-none focus:border-accent transition-colors" placeholder="••••••••"> </div> <button type="submit" class="w-full mt-4 bg-accent text-black font-bold py-3 rounded-md hover:brightness-110 transition-colors shadow-[0_0_15px_rgba(0,212,255,0.15)]">
Registrarse
</button> </form>`}${!success && renderTemplate`<div class="border-t border-surface-border pt-4 text-center mt-2"> <p class="text-muted text-sm">
¿Ya tienes cuenta?
<a href="/login" class="text-accent hover:underline font-medium">Inicia sesión</a> </p> </div>`}` })} </div> ` })}`;
}, "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/pages/register.astro", void 0);

const $$file = "/Users/Jefemac/Documents/GitHub/mi-gimnasio/src/pages/register.astro";
const $$url = "/register";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Register,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
