import { BlipStreamInterceptor } from "./stream-interceptor";

declare global {
  interface Window {
    __BLIP_INTERCEPTOR__?: BlipStreamInterceptor;
    __BLIP_INTERCEPTOR_READY__?: boolean;
  }
}

if (typeof window !== "undefined") {
  if (!window.__BLIP_INTERCEPTOR__) {
    const interceptor = new BlipStreamInterceptor();
    const installed = interceptor.install();
    if (installed) {
      window.__BLIP_INTERCEPTOR__ = interceptor;
      window.__BLIP_INTERCEPTOR_READY__ = true;
    }
  }
}

export { BlipStreamInterceptor };

