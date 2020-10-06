import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../service/auth.service';
import { LoadingService } from '../service/loading.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OfflineOnlineService } from '../services/offline-online.service';
import { ConnectionStatus, NetworkService } from '../services/network.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  otherInput = false;
  toast: any;
  orderId: any;
  customer: any;
  requirementForm: FormGroup;
  connectionStatus = true;
  currentOrder: any;
  verifyOtp = false;
  rdspOrder = false;

  submitDoc: Subscription; /* variable added by dipankar@appycodes */
  currentlat: number; /* variable added by dipankar@appycodes */
  currentlang: number; /* variable added by dipankar@appycodes */
  gpsstatus = false; /* variable added by dipankar@appycodes */
  gpschk = 'No GPS Location'; /* variable added by dipankar@appycodes */

  constructor(
    public authService: AuthService,
    public loading: LoadingService,
    public formBuilder: FormBuilder,
    public toastController: ToastController,
    private changeDe: ChangeDetectorRef,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private loaclService: OfflineOnlineService,
    private networkService: NetworkService,
    private androidPermissions: AndroidPermissions, /* plugin added by dipankar@appycodes */
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy /* plugin added by dipankar@appycodes */
  ) { }


  ionViewWillEnter() {
    this.checkGPSPermission(); /* page refesh if change added by dipankar@appycodes */
  }
  /* modified by dipankar@appycodes */
  ionViewWillLeave() {
    this.submitDoc.unsubscribe();
  }
  /* modified by dipankar@appycodes */

  /* GPS Function Enable by dipankar@appycodes */

  enableloc() {
    this.checkGPSPermission();
    this.changeDe.detectChanges();
    // this.ionViewWillEnter();
  }

  // Check if application having GPS access permission
  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {
          this.askToTurnOnGPS();
          this.changeDe.detectChanges();
        } else {
          this.requestGPSPermission();
        }
      },
      err => {
        this.getLocationCoordinates();
      }
    );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log('4');
      } else {
        // Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              // Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error);
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.getLocationCoordinates();
      },
      error => {
        this.getLocationCoordinates();
      });
  }

  // To get device accurate coordinates using device GPS
  getLocationCoordinates() {
    this.geolocation.getCurrentPosition().then((data) => {
      this.currentlat = data.coords.latitude; /* coodinates added by dipankar@appycodes */
      this.currentlang = data.coords.longitude; /* coodinates added by dipankar@appycodes */
      console.log('Latitude : ' + this.currentlat + ' Longitude :' + this.currentlang); /* uncomment by dipankar@appycodes */
      if (this.currentlat > 0 && this.currentlang > 0) {
        this.gpsstatus = true;
        this.gpschk = (this.currentlat + ',' + this.currentlang);
        console.log('GPS: ' + this.gpschk); /* new gps condition added by dipankar@appycodes */
        this.requirementForm.get('current_lat').setValue(this.currentlat);
        this.requirementForm.get('current_lng').setValue(this.currentlang);
      } else {
        this.gpsstatus = false;
        console.log('No GPS Location');
        this.gpschk = 'No GPS Location';
      }
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  requiredField() {
    this.toast = this.toastController.create({
      message: 'Please fill mendatory fields ',
      duration: 4000,
      showCloseButton: true,
      position: 'middle',
      closeButtonText: 'Close',
      animated: true,

      cssClass: 'my-custom-class'
    }).then((toastData) => {

      toastData.present();
    });
  }

  /* end here by dipankar@appycodes */

  ngOnInit() {
    if (!localStorage.getItem('userid')) {
      this.router.navigate(['/login']);
    }
    this.orderId = this.activeRoute.snapshot.params.id;

    let today = new Date();
    let ddates = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate() + ' 10:01:01';

    this.requirementForm = this.formBuilder.group({

      orderId: [this.orderId],
      podtype: [''],
      receivedby: [],
      adharnumber: [''],
      delivery: ['undelivered'],
      remark: ['Address not traceable'],
      podFront: [''],
      podBack: [''],
      signedReceipt: [''],
      extra: [''],
      new_product_serial_no: [''],
      grn_no: [''],
      replacement_at: [''],
      order_type: [''],
      otherremark: [''],
      current_lat: ['', [Validators.required]], /* Validators added by dipankar@appycodes */
      current_lng: ['', [Validators.required]], /* Validators added by dipankar@appycodes */
      uploded_doc_details: [''], /* added by dipankar@appycodes */
      updated_at: [ddates]
    });

    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.connectionStatus = false;
        this.loaclService.getOrder(this.orderId).then(
          (res) => {

            if (res) {
              //  console.log(res);
              if ((res.company === 'BFIL') && (res.DeliveryModel === 'New')) {
                this.verifyOtp = true;
              } else {
                this.verifyOtp = false;
              }

              this.currentOrder = res;

              if (res.order_type === 'RDSP') {
                this.rdspOrder = true;
                this.requirementForm.get('remark').setValue('Member Not Interested');
              } else {
                this.requirementForm.get('remark').setValue('');
                this.rdspOrder = false;
              }

            } else {

              console.log('not done;');
            }
          }
        );
      } else {
        this.connectionStatus = true;
        this.authService.getOrders(this.orderId).subscribe(
          (res) => {
            if (res) {
              //  console.log(res);
              this.currentOrder = res;

              if ((res.company === 'BFIL') && (res.DeliveryModel === 'New')) {
                this.verifyOtp = true;
              } else {
                this.verifyOtp = false;
              }

              if (res.order_type === 'RDSP') {
                this.rdspOrder = true;
                this.requirementForm.get('remark').setValue('Member Not Interested');
              } else {
                this.requirementForm.get('remark').setValue('');
                this.rdspOrder = false;
              }
            } else {
              console.log('not done;');
            }
          }
        );
        // this.changeDe.detectChanges();
      }
    });
  }
  get f() { return this.requirementForm.controls; } /* for invaild vaildation check requirementForm added by dipankar@appycodes */

  saveRemark(event: any) {
    this.loading.present('Saving please wait');
    if (event.target.value) {
      if ((event.target.value === 'Other') || (event.target.value === 'other')) {
        this.otherInput = true;
        this.loading.dismiss();
      } else {
        this.otherInput = false;
        this.loading.dismiss();
        this.requirementForm.get('remark').setValue(event.target.value);

        // this.authService.submitDoc(this.requirementForm.value).subscribe(
        this.authService.getOrders(this.orderId).subscribe(

          (ares) => {

            this.loaclService.updateOrder(this.requirementForm.value, ares).then(
              (res) => {

                if (res) {
                  // this.results = res;
                  this.showToast();
                  this.loading.dismiss();
                  this.changeDe.detectChanges();
                } else {
                  this.loading.dismiss();
                  console.log('not done;');
                }
              }
            );
          }
        );

      }
    } else {
      this.loading.dismiss();
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
  showToast() {
    this.toast = this.toastController.create({
      message: 'Remark has been saved ',
      duration: 4000,
      showCloseButton: true,
      position: 'middle',
      closeButtonText: 'Close',
      animated: true,

      cssClass: 'my-custom-class'
    }).then((toastData) => {

      toastData.present();
    });
  }



  saveOtherRemark() {
    this.getLocationCoordinates(); /* comment here and shift to getLocationCoordinates by dipankar@appycodes */

    // this.authService.submitDoc(this.requirementForm.value).subscribe(

    /* if error occur then msg will display added by dipankar@apycodes */
    if (this.requirementForm.invalid) {
      this.requiredField();
      return;
    } else {
      /* modified by dipankar@appycodes */
      this.submitDoc = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
        if (status === ConnectionStatus.Online) {
          this.authService.submitDoc(this.requirementForm.value).subscribe(
            (res) => {
              if (res) {
                console.log('submitDoc:-->> ', res);
                this.loaclService.deleteOrder(res.order_id).then(() => {
                  this.changeDe.detectChanges();
                  this.router.navigate(['/order-details/' + this.orderId]);
                  this.showToast();
                });
              }
            });
        } else {
          this.loaclService.updateOrder(this.requirementForm.value, this.currentOrder).then(
            (res) => {
              if (res) {
                this.showToast();
                this.changeDe.detectChanges();
                this.router.navigate(['/order-details/' + this.orderId]);
              } else {
                console.log('not done;');
              }
            }
          );
        }
      });
    } /* this is else part added by dipankar@appycodes */
    /* modified by dipankar@appycodes */
  }


  openOther(event) {
    if (event.target.value) {
      if ((event.target.value === 'Other') || (event.target.value === 'other')) {
        this.otherInput = true;
      } else {

        this.otherInput = false;
      }
    }
    this.requirementForm.get('remark').setValue(event.target.value);
  }
  closeModal(id) {
    this.router.navigate(['/order-details/' + id]);
  }
}
