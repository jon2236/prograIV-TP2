import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    // bearer primero (mete el token saliente), error despues (escucha el 401 entrante)
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    // registra todos los tipos de grafico de chart.js para q ng2-charts los use
    provideCharts(withDefaultRegisterables())
  ]
};
