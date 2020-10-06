import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { OrderDetailsPage } from './order-details.page';
import { FileChooser } from '@ionic-native/file-chooser/ngx';


const routes: Routes = [
  {
    path: '',
    component: OrderDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],providers: [  
   FileChooser   
  ],
  declarations: [OrderDetailsPage]
})
export class OrderDetailsPageModule {}
