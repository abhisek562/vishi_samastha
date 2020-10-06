import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonSelect, ToastController } from '@ionic/angular';
import { LoadingService } from '../service/loading.service';
import { AuthService } from '../service/auth.service';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';

import { CallNumber } from '@ionic-native/call-number/ngx';
import { NetworkService, ConnectionStatus } from '../services/network.service';
import { OfflineOnlineService } from '../services/offline-online.service';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

import { environment } from 'src/environments/environment';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {
  API_URL: String = environment.apiUrl;
  toast: any;
  orderId: any;
  results: Observable<any>;
  requirementForm: FormGroup;
  otherInput = false;
  connectionStatus = true;
  orderStatus = false;
  detailsConStat: Subscription;
  out_for_delivery = true;
  order_cancelled = false;
  @ViewChild('mySelect') selectRef: IonSelect;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private changeDe: ChangeDetectorRef,
    private networkService: NetworkService,
    public authService: AuthService,
    public formBuilder: FormBuilder,
    public toastController: ToastController,
    private callNumber: CallNumber,
    private loaclService: OfflineOnlineService,
    public loading: LoadingService,
    public fileChooser: FileChooser,
    private transfer: FileTransfer,
    public filePath: FilePath) {
  }

  ngOnInit() {
    if (!localStorage.getItem('userid')) {
      this.router.navigate(['/login']);
    }

    this.orderId = this.activeRoute.snapshot.params.id;
    this.requirementForm = this.formBuilder.group({
      orderId: [this.orderId],
      delivery: ['undelivered'],
      remark: ['']
      // failedDeliveryCause:['',[Validators.required]]
    });
  }
  navigateback() {
    this.changeDe.detectChanges();
    this.router.navigate(['/app/dashbaord/main']);
  }
  ionViewWillLeave() {
    this.detailsConStat.unsubscribe();
  }
  ionViewWillEnter() {
    this.detailsConStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.loading.present('Loading order details');
        this.connectionStatus = false;
        this.loaclService.getOrder(this.orderId).then(
          (res) => {
            if (res) {
              if (res.status === 'cancelled') {
                this.order_cancelled = true;
              }
              this.results = res;
              this.loading.dismiss();
            }
          }
        );
      } else {
        this.connectionStatus = true;
        this.loading.present('Order deatils');
        this.authService.getOrders(this.orderId).subscribe(
          (onlineRes) => {
            if (onlineRes) {
              this.results = onlineRes;
              this.loading.dismiss();
              // ================  need to uncoment
              if ((onlineRes.company === 'BFIL') && (onlineRes.DeliveryModel === 'New')) {

                // ------------ if out for delivery is success msg from bfil then save to local-------------
                if (onlineRes.out_for_delivery === 1) {
                  this.loaclService.addOrder(onlineRes)
                    .then(_ => {
                      this.loaclService.getOrder(this.orderId).then(
                        (res1) => {
                          if (res1) {
                            this.results = res1;
                            if (res1.status === 'cancelled') {
                              this.order_cancelled = true;
                            }
                            this.loading.dismiss();

                          } else {
                            this.loading.dismiss();
                          }
                        }
                      );
                    });
                } else {
                  this.out_for_delivery = false;
                  this.results = onlineRes;
                }
                // ------------------------------------------------
              } else {
                this.loaclService.addOrder(onlineRes)
                  .then(_ => {
                    this.loaclService.getOrder(this.orderId).then(
                      (res1) => {
                        if (res1) {
                          this.results = res1;
                          if (res1.status === 'cancelled') {
                            this.order_cancelled = true;
                          }
                          this.loading.dismiss();

                        } else {
                          this.loading.dismiss();
                        }
                      }
                    );
                  });
              }
              // ===============================
            } else {
              this.loading.dismiss();
              console.log('not done;');
            }
          }
        );
      }
    });
  }
  saveRemark(event: any) {
    if (event.target.value) {
      if (event.target.value === 'other') {
        this.otherInput = true;
      } else {
        this.authService.submitDoc(this.requirementForm.value).subscribe(
          (res) => {
            if (res) {
              // this.results = res;
              this.showToast();
              this.changeDe.detectChanges();
            } else {
              console.log('not done;');
            }
          }
        );
      }
    } else {

      this.toast = this.toastController.create({
        message: 'Please choose a remark ',
        duration: 4000,
        showCloseButton: true,
        position: 'middle',
        closeButtonText: 'Yeah',
        animated: true,
        cssClass: 'my-custom-class'
      }).then((toastData) => {
        toastData.present();
      });
    }
  }

  saveOtherRemark() {
    this.authService.submitDoc(this.requirementForm.value).subscribe(
      (res) => {
        if (res) {
          // this.results = res;
          this.showToast();
          this.changeDe.detectChanges();
        } else {
          console.log('not done;');
        }
      }
    );
  }
  showToast() {
    this.toast = this.toastController.create({
      message: 'Remark has been saved ',
      duration: 4000,
      showCloseButton: true,
      position: 'middle',
      closeButtonText: 'Yeah',
      animated: true,
      cssClass: 'my-custom-class'
    }).then((toastData) => {
      toastData.present();
    });
  }
  HideToast() {
    this.toast = this.toastController.dismiss();
  }

  openModal() {

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

  uploadAudio() {
    this.fileChooser.open().then(uri => {
      this.loading.present('Wait uploading voc ...');
      const fileTransfer: FileTransferObject = this.transfer.create();

      this.filePath.resolveNativePath(uri)
        .then(filePath => {
          let filen = filePath.substring(filePath.lastIndexOf('/') + 1);
          let options: FileUploadOptions = {
            fileKey: 'file',
            fileName: this.orderId + filen,
            chunkedMode: false,
            mimeType: 'audio/mpeg, video/mp4',
            params: { 'orderId': this.orderId, 'imageFolder': 'media' },
            headers: {}
          };

          fileTransfer.upload(filePath, this.API_URL + 'api/upload-audio', options).then((data) => {
            if (data) {
              this.loading.dismiss();
            }
          }, (err) => {
            this.loading.dismiss();
            console.log(err);
          });
        });

    })
      .catch(e => alert('uri' + JSON.stringify(e)
      ));
  }
}
