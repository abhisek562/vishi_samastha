import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AuthNoticePage } from './auth-notice.page';

const routes: Routes = [
  {
    path: '',
    component: AuthNoticePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
 // declarations: [AuthNoticePage]
 declarations: []
})
export class AuthNoticePageModule {}
