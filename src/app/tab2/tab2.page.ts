import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { AuthService } from '../service/auth.service';
import { Subscription } from 'rxjs';
import { LoadingService } from '../service/loading.service';
import { IonInfiniteScroll, IonToggle, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OfflineOnlineService } from '../services/offline-online.service';
import { NetworkService, ConnectionStatus } from '../services/network.service';
import { environment } from 'src/environments/environment.prod';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FormBuilder } from '@angular/forms';
import { SyncOfflineOrdersService } from '../service/sync-offline-orders.service';




@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  API_URL: String = environment.apiUrl;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  @ViewChild('alldeliver') alldeliver: IonToggle;
  @ViewChild('allpending') allpending: IonToggle;

  @ViewChild('replaceorder') replaceorder: IonToggle;
  orderList = {};

  outtoggle = false;
  toast: any;
  alltoggle = true;
  pending = true;
  delivered = false;
  fresh = true;
  replacement = false;
  param = 0;
  orderType = '';
  orderStatus: any = 'pending';
  element: HTMLElement;
  companies: any[];
  results: string[];
  searchTerm = '';
  page = 0;
  perPage = 0;
  totalData = 0;
  totalPage = 0;
  data: any;
  connectionStatus = false;
  onlineMode = true;
  conStat: Subscription;
  allStatus: any[];

  constructor(
    private callNumber: CallNumber,
    public authService: AuthService,
    private changeDe: ChangeDetectorRef,
    public loading: LoadingService,
    private router: Router,
    public formBuilder: FormBuilder,
    public toastController: ToastController,
    private networkService: NetworkService,
    private loaclService: OfflineOnlineService,
    private transfer: FileTransfer,
    private syncOffline: SyncOfflineOrdersService
  ) { }

  ngOnInit() {
    if (localStorage.getItem('userid')) {
      this.router.navigate(['/app/dashbaord/orders']);
    } else {
      this.router.navigate(['/login']);
    }

  }
  ionViewWillLeave() {
    this.conStat.unsubscribe();
  }
  ionViewWillEnter() {
    this.conStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Online) {
        this.onlineMode = true;
        this.searchChanged();
        this.connectionStatus = true;

        this.authService.getCompanies().subscribe((company) => {
          this.companies = company;
        });

        this.authService.getGetOrderStatus().subscribe((allStatus) => {
          this.allStatus = allStatus;
        });
        this.syncOffline.syncOnlyOrders();
        this.syncOffline.syncSyncableImages();
        this.changeDe.detectChanges();
      } else {
        this.onlineMode = false;
        this.searchChanged();
        this.connectionStatus = false;

        this.loaclService.getCompanies().then(
          (res) => {
            this.companies = res;
          }
        );

        this.loaclService.getOrderTypes().then(
          (res) => {
            this.allStatus = res;
          }
        );

      }
    });
    this.changeDe.detectChanges(); /* modified by dipankar@appycodes */
  }

  reSyncLocal(localOrder) {
    this.syncOffline.checnNsyncImage(localOrder);
    this.changeDe.detectChanges(); /* modified by dipankar@appycodes */
  }
  callClient(callingNumber) {
    // let call='02071171100,'+callingNumber+'#';
    this.callNumber.callNumber(callingNumber, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  callBranch(callingNumber) {
    this.callNumber.callNumber(callingNumber, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  getSearchdorders(searchTerm, page, param, orderStatus, orderType) {
    this.authService.getSearchdorders(searchTerm, page, param, orderStatus, orderType).subscribe(
      (res) => {
        // this.loading.present('reload orders');
        if (res) {
          this.results = res;
          this.loading.dismiss();
          this.changeDe.detectChanges();
        } else {
          this.loading.dismiss();
        }
      }
    );
  }

  searchChanged() {
    this.conStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.loaclService.loadOrders(this.searchTerm, this.page, this.param, this.orderStatus, this.orderType).then(
          (res) => {
            this.results = res;
          }
        );
      } else {
        this.page = 0;
        this.getSearchdorders(this.searchTerm, this.page, this.param, this.orderStatus, this.orderType);
      }
    });
  }

  doInfinite(event) {
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Online) {
        event.target.disabled = false;
        this.page = this.page + 1;
        this.authService.getSearchdorders(this.searchTerm, this.page, this.param, this.orderStatus, this.orderType)
          .subscribe(
            res => {
              if (res) {
                this.data = res;
                this.perPage = this.data.per_page;
                this.totalData = this.data.total;
                this.totalPage = this.data.total_pages;
                for (let i = 0; i < this.data.length; i++) {
                  this.results.push(this.data[i]);
                }
                event.target.complete();
                this.changeDe.detectChanges();
              } else {
                event.target.complete();
                this.changeDe.detectChanges();
              }
            },
            () => {
              event.target.complete();
              this.changeDe.detectChanges();
            }
          );
      } else {
        event.target.disabled = true;
      }
    }
    );
  }

  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }

  toggleDelivery(orderArr, status) {
    if (orderArr.out_for_delivery === 0) {
      if ((orderArr.company === 'BFIL') && (orderArr.DeliveryModel === 'New')) {
        this.authService.sendOutForDeliveryNotification(orderArr)
          .subscribe(
            res => {
              let outdel: any = res;
              if (outdel.response === 1) {
                this.loaclService.addOrder(orderArr)
                  .then(_ => {
                    this.orderList = {};
                  });
                if (status === 0) {
                }
                if (status === 1) {
                }
              }
            });

      } else {
        this.loaclService.addOrder(orderArr)
          .then(_ => {
            this.orderList = {};
          });

        if (status === 0) {
        }
        if (status === 1) {
        }
      }
    }
  }

  toggleChangeAll() {
    this.loading.present('change all');
    this.page = 0;
    if (this.outtoggle) {
      this.alltoggle = true;
      this.outtoggle = false;
      this.orderStatus = 'pending';
      this.param = 0;
      this.orderType = '';

    } else {
      this.alltoggle = false;
      this.outtoggle = true;
      this.orderStatus = 'pending';
      this.param = 1;
    }

    this.conStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {

        this.searchChanged();
        this.loading.dismiss();
        this.changeDe.detectChanges();
      } else {
        this.getSearchdorders(this.searchTerm, this.page, this.param, this.orderStatus, this.orderType);
      }
    });

  }

  toggleChangeOrderType(event) {
    this.loading.present('change order type');
    this.page = 0;
    if (this.fresh) {
      this.replacement = true;
      this.fresh = false;
      this.orderType = 'REPLACEMENT';

    } else {
      this.replacement = false;
      this.fresh = true;
      this.orderType = 'FRESH';
    }
    this.orderType = event.target.value;

    this.conStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.searchChanged();
        this.loading.dismiss();
        this.changeDe.detectChanges();
      } else {
        this.getSearchdorders(this.searchTerm, this.page, this.param, this.orderStatus, this.orderType);
      }
    });
  }

  toggleChangeDelivered() {
    this.loading.present('Loading orders');
    if (this.pending) {
      this.pending = false;
      this.delivered = true;
      this.orderStatus = 'delivered';
      this.param = 0;
    } else {
      this.pending = true;
      this.delivered = false;
      this.orderStatus = 'pending';
      this.param = 0;
    }
    this.page = 0;
    this.conStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.searchChanged();
        this.loading.dismiss();
        this.changeDe.detectChanges();
      } else {
        this.getSearchdorders(this.searchTerm, this.page, this.param, this.orderStatus, this.orderType);
      }
    });
  }

  resetAll() {
    this.loading.present('reset all');
    this.pending = true;
    this.delivered = false;
    this.orderStatus = 'pending';
    this.param = 0;
    this.page = 0;

    this.getSearchdorders(this.searchTerm, this.page, this.param, this.orderStatus, this.orderType);
  }

  relodOrders(event) {
    this.pending = true;
    this.delivered = false;
    this.orderStatus = 'pending';
    this.page = 0;
    this.orderType = '';
    this.searchTerm = event.target.value;
    this.conStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.searchChanged();
        this.loading.dismiss();
        this.changeDe.detectChanges();
      } else {
        this.getSearchdorders(this.searchTerm, this.page, this.param, this.orderStatus, this.orderType);
      }
    });
  }

}
