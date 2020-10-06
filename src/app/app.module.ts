import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { TokenInterceptor } from './intercepter/intercepter';
import { File } from '@ionic-native/file/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { Network } from '@ionic-native/network/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    IonicStorageModule.forRoot()

  ],
  providers: [

    StatusBar,
    SplashScreen,
    Camera,
    FilePath,
    FileTransfer,
    File,
    CallNumber,
    BarcodeScanner,
    Network,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLite,
    WebView,
    AppVersion,
    AppUpdate,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
