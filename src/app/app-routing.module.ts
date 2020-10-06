import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',

  },
  { path: 'app', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'order-details/:id', loadChildren: './order-details/order-details.module#OrderDetailsPageModule' },
  { path: 'order-requirements/:id', loadChildren: './order-requirements/order-requirements.module#OrderRequirementsPageModule' },
  { path: 'auth-notice', loadChildren: './auth-notice/auth-notice.module#AuthNoticePageModule' },
  { path: 'order-undeleivered/:id', loadChildren: './modal/modal.module#ModalPageModule' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
