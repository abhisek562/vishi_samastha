import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { NavController, ToastController } from '@ionic/angular';
import { LoadingService } from '../service/loading.service';

import { AppVersion } from '@ionic-native/app-version/ngx';
import { ConnectionStatus, NetworkService } from '../services/network.service';
import { OfflineOnlineService } from '../services/offline-online.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { SyncOfflineOrdersService } from '../service/sync-offline-orders.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  API_URL: String = environment.apiUrl;
  toast: any;
  onlineMode = true;
  username: any;
  orders: any;
  public Appersion: any;
  AppName: string;
  currentVersion: string | number;
  usingVersion: string | number;
  syncing = false;
  countSyncableOrders: any = 0;
  connectionStatus = true;
  dashConStats: Subscription;

  constructor(
    private router: Router,
    public authService: AuthService,
    private navCtrl: NavController,
    private changeDe: ChangeDetectorRef,
    public loading: LoadingService,
    private appVersion: AppVersion,
    private networkService: NetworkService,
    public toastController: ToastController,
    private loaclService: OfflineOnlineService,
    private syncService: SyncOfflineOrdersService,
  ) {
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Online) {
        this.appVersion.getAppName().then(value => {
          this.AppName = value;
        }).catch(err => {
          console.log(err);
        });
        this.appVersion.getVersionNumber().then(value => {
          this.usingVersion = value;
          this.authService.getAppVersionCheck().subscribe((appcheck) => {
            let appversion = appcheck.VersionNumber;
            console.log('initial check : ', value);
            console.log('latest check : ', appversion);
            if (value < appversion) {
              console.log('Please Update your App');
              this.toastController.create({
                header: 'New Update is Available!',
                message: 'Please Reopen and update your App',
                showCloseButton: false,
                position: 'middle',
                closeButtonText: 'Close',
                animated: true,
                cssClass: 'check-version-class'
              }).then((toastData) => {
                toastData.present();
              });
              if (localStorage.getItem('userid')) {
                this.logout();
              }
            } else {
              console.log('App is Up to Date');
            }
          });
        }).catch(err => {
          console.log(err);
        });
      }
    });

    const now = new Date();
    console.log('date:= ', now.toISOString());

  }

  ngOnInit() {

    if (localStorage.getItem('userid')) {
      this.router.navigate(['/app/dashbaord/main']);
      this.username = localStorage.getItem('user_name');
    } else {
      this.router.navigate(['/login']);
    }
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Online) {
        this.syncService.syncOnlyOrders();
        this.syncService.syncSyncableImages();
        this.changeDe.detectChanges(); /* modified by dipankar@appycodes */
      }
    });
    this.changeDe.detectChanges();
  }

  ionViewWillLeave() {
    this.dashConStats.unsubscribe();
  }

  ionViewWillEnter() {
    this.dashConStats = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.connectionStatus = false;
        this.onlineMode = false;
        this.changeDe.detectChanges();
      } else {
        this.connectionStatus = true;
        this.onlineMode = true;
        this.authService.getDashboard(this.usingVersion).subscribe(
          (res) => {
            if (res) {
              this.orders = res;
              this.currentVersion = res.app_version_details.app_version;
              this.changeDe.detectChanges();
            } else {
              this.changeDe.detectChanges();
            }
          }
        );
        this.changeDe.detectChanges();
      }
    });
    // this.syncService.syncOnlyOrders();
    // this.syncService.syncSyncableImages();
    this.loaclService.countOrders().then(
      (res) => {
        console.log(res);
        this.countSyncableOrders = res;
      });
    this.changeDe.detectChanges(); /* modified by dipankar@appycodes */
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.changeDe.detectChanges();
  }
  syncLocal() {
    this.syncService.syncOnlyOrders();
    this.syncService.syncSyncableImages();
    this.changeDe.detectChanges(); /* modified by dipankar@appycodes */
  }
  SwitchTab() {
    this.navCtrl.navigateForward; // Selects the first tab
  }

  // syncImages() {
  //   this.syncService.syncSyncableImages();
  // }

}
