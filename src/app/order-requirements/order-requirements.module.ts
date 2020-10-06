import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { File } from '@ionic-native/file/ngx';
import { IonicModule } from '@ionic/angular';

import { OrderRequirementsPage } from './order-requirements.page';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { ImageResizer } from '@ionic-native/image-resizer/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

const routes: Routes = [
  {
    path: '',
    component: OrderRequirementsPage
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
    File,
    WebView,
    ImageResizer,
    FileChooser,
    AndroidPermissions,
    Geolocation,
    LocationAccuracy,
  ],
  declarations: [OrderRequirementsPage]
})
export class OrderRequirementsPageModule {}
