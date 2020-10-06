import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { File } from '@ionic-native/file/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,   
    ReactiveFormsModule,
    FormsModule,       
    RouterModule.forChild([{ path: '', component: Tab1Page }])
  ],providers: [
    File,
    WebView,
  ],
  declarations: [Tab1Page]
})
export class Tab1PageModule {}
