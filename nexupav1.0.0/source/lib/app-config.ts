// Puede cambiarse sin recompilar desde public/app-config.js (web/app-config.js en la entrega).
declare global { interface Window { NEXO_CONFIG?: { loginUrl?:string; createAccountUrl?:string; providerImage?:string; previewEnabled?:boolean; authApiUrl?:string; socialApiUrl?:string } } }
const runtime = typeof window === "undefined" ? {} : window.NEXO_CONFIG || {};
export const appConfig = {
  createAccountUrl: runtime.createAccountUrl || "",
  loginUrl: runtime.loginUrl || "",
  providerImage: runtime.providerImage || "./login-provider.svg",
  previewEnabled: runtime.previewEnabled === true,
  authApiUrl: (runtime.authApiUrl || "").replace(/\/$/, ""),
  socialApiUrl: (runtime.socialApiUrl || "").replace(/\/$/, ""),
  // Servidor local independiente. GitHub Pages NO puede ejecutarlo.
  localAuthApi: "http://127.0.0.1:8788",
};
