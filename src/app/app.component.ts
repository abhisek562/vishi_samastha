import { Component, ChangeDetectorRef } from '@angular/core';

import { Platform, ToastController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NetworkService, ConnectionStatus } from './services/network.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { environment } from 'src/environments/environment';
import { AppUpdate } from '@ionic-native/app-update/ngx';
import { Router } from '@angular/router';
import { AuthService } from './service/auth.service';
declare var VerifyOtp: any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private appVersion: AppVersion,
    private networkService: NetworkService,
    public authService: AuthService,
    public appUpdate: AppUpdate

  ) {
    this.initializeApp();
    this.ionViewWillLeave();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
        this.authService.getAppVersionCheck().subscribe((appcheck) => {
          console.log('appcheck', appcheck.VersionNumber);
        });
      });
    });
  }

  ionViewWillLeave() {
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Online) {
        this.appVersion.getVersionNumber().then(value => {
          console.log('App version : ' + value);
          const updateUrl =   environment.apkUrl + 'apk/update.xml';
          this.appUpdate.checkAppUpdate(updateUrl).then(() => {
            console.log('Update available');
         });
        }).catch(err => {
          console.log(err);
        });
      }
    });
  }

}
