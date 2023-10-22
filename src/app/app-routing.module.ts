import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {MainLayoutComponent} from "./modules/core/shared/components/main-layout/main-layout.component";
import {PageNotFoundComponent} from "./modules/core/shared/components/page-not-found/page-not-found.component";

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'programming',
        pathMatch: 'full'
      },
      {
        path: 'programming',
        loadChildren: () => import('./modules/programming/programming.module').then(module => module.ProgrammingModule)
      },
      {
        path: 'services',
        loadChildren: () => import('./modules/services/services.module').then(module => module.ServicesModule)
      },
      {
        path: 'billing',
        loadChildren: () => import('./modules/billing/billing.module').then(module => module.BillingModule)
      },
      {
        path: '**',
        redirectTo: 'page-not-found',
        pathMatch: "full"
      },
      {
        path: 'page-not-found',
        component: PageNotFoundComponent
      }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    useHash: true,
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
