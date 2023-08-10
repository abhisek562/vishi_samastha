import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { ActionSheetController, ToastController, IonContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../service/loading.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { environment } from 'src/environments/environment.prod';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import xml2js from 'xml2js';
import { File } from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { OfflineOnlineService } from '../services/offline-online.service';
import { NetworkService, ConnectionStatus } from '../services/network.service';
import { Subscription } from 'rxjs';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';

const STORAGE_KEY = 'pennco_images';
declare var VerifyOtp: any;
const imageFolderName = environment.imageFolderName;

@Component({
  selector: 'app-order-requirements',
  templateUrl: './order-requirements.page.html',
  styleUrls: ['./order-requirements.page.scss'],
})
export class OrderRequirementsPage implements OnInit {
  API_URL: String = environment.apiUrl;
  orderDetailsId: any;
  public image: any = '';
  public image4: any = '';
  public image1: any = '';
  public image2: any = '';
  public image3: any = '';
  public imageData: any = '';
  public xmlData: any;
  toast: any;
  public ionload: any = '/assets/ionloader.gif';
  requirementForm: FormGroup;
  submitted = false;
  pushImagesArr = []; /* variable added by dipankar@appycodes */
  verifyOtp = true;
  otpCheck = false;
  otpVerifiedMsg: boolean = false;
  customer: any;
  orderType: any = 'FRESH';
  encodeData: any;
  scannedData: {};
  images = [];
  currentOrder: any;
  un1: any;
  un2: any;
  un3: any;
  barcodeScannerOptions: BarcodeScannerOptions;
  connectionStatus = true;
  requirementConStat: Subscription;
  submitDoc: Subscription;
  @ViewChild(IonContent) content: IonContent;
  currentlat: any; /* variable added by dipankar@appycodes */
  currentlang: any; /* variable added by dipankar@appycodes */
  gpsstatus = false; /* variable added by dipankar@appycodes */
  gpschk = 'No GPS Location'; /* variable added by dipankar@appycodes */
  mainCompany: any;
  validateEvent: any;
  imgPath: string;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private transfer: FileTransfer,
    private camera: Camera,
    private actionSheetController: ActionSheetController,
    public filePath: FilePath,
    public changeDe: ChangeDetectorRef,
    public http: HttpClient,
    public toastController: ToastController,
    public formBuilder: FormBuilder,
    public authService: AuthService,
    public loading: LoadingService,
    private barcodeScanner: BarcodeScanner,
    private file: File,
    private storage: Storage,
    private webview: WebView,
    private loaclService: OfflineOnlineService,
    private networkService: NetworkService,
    public fileChooser: FileChooser,
    private androidPermissions: AndroidPermissions,
    private geolocation: Geolocation,
    private locationAccuracy: LocationAccuracy
  ) {
    this.barcodeScannerOptions = {
      showTorchButton: true,
      showFlipCameraButton: true
    };

  }
  

  ionViewWillEnter() {
    this.image1 = '/assets/camera.svg';
    this.image2 = '/assets/camera.svg';
    this.image3 = '/assets/camera.svg';
    this.image4 = '/assets/camera.svg';

    this.checkGPSPermission(); /* page refesh if change added by dipankar@appycodes */

    let imgPath = this.file.externalRootDirectory + imageFolderName;
    this.file.checkDir(this.file.externalRootDirectory, imageFolderName)
      .then(chkpth => {
        console.log('checkDir - Directory exists: ', chkpth);
        if (chkpth) {
          console.log('imgPath::', imgPath);
          this.imgPath = imgPath;
        }
      })
      .catch(err => {
        console.log('Directory doesnt exist: ', err);
        this.file.createDir(this.file.externalRootDirectory, imageFolderName, false).then(
          shw => {
            console.log('Directory exists: ', shw);
            imgPath = this.file.externalRootDirectory + imageFolderName;
            this.imgPath = imgPath;
          });
      });

  }
  ionViewWillLeave() {
    if (typeof this.requirementConStat !== 'undefined') {
      this.requirementConStat.unsubscribe();
    }
    if (typeof this.submitDoc !== 'undefined') {
      this.submitDoc.unsubscribe();
    }
  }
  /* GPS Function Enable by dipankar@appycodes */

  enableloc() {
    this.checkGPSPermission();
    this.changeDe.detectChanges();
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
      () => {
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
      () => {
        this.getLocationCoordinates();
      });
  }

  // To get device accurate coordinates using device GPS
  getLocationCoordinates() {
    this.currentlat = 1; /* Done by Swati*/
    this.currentlang = 1;/* Done by Swati*/

    if (this.currentlat > 0 && this.currentlang > 0) {
      this.gpsstatus = true;
      this.gpschk = (this.currentlat + ',' + this.currentlang);
      console.log('GPS: ' + this.gpschk); /* new gps condition added by dipankar@appycodes */
      this.requirementForm.get('current_lat').setValue(this.currentlat);
      this.requirementForm.get('current_lng').setValue(this.currentlang);
      this.requirementForm.get('geo_tag').setValue(this.gpschk);
      /* modified by dipankar@appycodes */
    } else {
      this.gpsstatus = false;
      console.log('No GPS Location');
      this.gpschk = 'No GPS Location';
    }
  }

  /* end here by dipankar@appycodes */

  checkOtp() {
    if (!this.otpCheck) {
      this.otpCheck = true;
    }
    this.requirementForm.get('adharnumber').clearValidators();
    this.requirementForm.get('adharnumber').updateValueAndValidity();
    this.requirementForm.controls['adharnumber'].setValidators([Validators.required]);
    this.requirementForm.get('adharnumber').updateValueAndValidity();

    let podnum = this.requirementForm.get('adharnumber').value;
    this.requirementForm.get('podtype').setValue('UniqueNumber');

    //  console.log(this.un1 +'-------------'+this.un2+'---------'+podnum);

    var verify = new VerifyOtp();
    if (this.orderType === 'RDSP') {
      verify.show(
        { 'un1': this.un3, 'un2': this.un3, 'plain': podnum },
        function (msg) {
          localStorage.removeItem('otpVerified');
          localStorage.setItem('otpVerified', msg);
        },
        function () {
          console.log('error!');
        }
      );
      console.log(localStorage.getItem('otpVerified'));
      this.storage.get('otpVerified').then(() => {
        if (localStorage.getItem('otpVerified') === '1') {
          this.otpVerifiedMsg = true;
        } else {
          this.otpVerifiedMsg = false;
        }
        this.changeDe.detectChanges();
      });

      this.changeDe.detectChanges();
    } else if (this.mainCompany === 'SAMASTHA') {
      if (this.un1 === podnum) {
        this.otpVeridfied();
        this.otpVerifiedMsg = true;
        localStorage.setItem('otpVerified', '1');
      } else {
        this.otpNotVeridfied();
        this.otpVerifiedMsg = false;
        localStorage.setItem('otpVerified', '0');
      }
      this.changeDe.detectChanges();
    } else {
      verify.show(
        { 'un1': this.un1, 'un2': this.un2, 'plain': podnum },
        function (msg) {
          localStorage.removeItem('otpVerified');
          localStorage.setItem('otpVerified', msg);
        },
        function () {
          console.log('error!');
        }
      );

      this.storage.get('otpVerified').then(() => {
        if (localStorage.getItem('otpVerified') === '1') {
          this.otpVerifiedMsg = true;
        } else {
          this.otpVerifiedMsg = false;
        }
        this.changeDe.detectChanges();
      });

    }
  }
  ngOnInit() {

    if (!localStorage.getItem('userid')) {
      this.router.navigate(['/login']);
    }

    this.orderDetailsId = this.activeRoute.snapshot.params.id;

    let today = new Date();
    let ddates = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate() + ' 10:01:01';

    this.requirementForm = this.formBuilder.group({
      orderId: [this.orderDetailsId],
      podtype: ['', [Validators.required]],
      receivedby: [],
      adharnumber: ['', [Validators.required]],
      voternumber:['',[Validators.required]],
      delivery: ['delivered'],
      remark: [''],
      podFront: ['', [Validators.required]],
      podBack: [''],
      signedReceipt: [''],
      extra: [''],
      new_product_serial_no: [''],
      grn_no: [''],
      replacement_at: [''],
      order_type: [''],
      geo_tag: [''], /* added by dipankar@appycodes */
      otherremark: [''],
      media_file: [''],
      has_otp: [''],
      current_lat: ['', [Validators.required]], /* Validators added by dipankar@appycodes */
      current_lng: ['', [Validators.required]], /* Validators added by dipankar@appycodes */
      uploded_doc_details: [''], /* added by dipankar@appycodes */
      updated_at: [ddates]
    });
    this.loading.present('Please wait Loading ');

    this.requirementConStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.connectionStatus = false;
        this.loaclService.getOrder(this.orderDetailsId).then(
          (res) => {
            // console.log('local getOrder: -> ', res);
            if (res) {
              console.log(res);

              if ((res.company === 'BFIL') && (res.DeliveryModel === 'New')) {
                this.verifyOtp = true;
              } else {
                this.verifyOtp = false;
              }
              this.mainCompany = res.main_company;
              this.un1 = res.UN1;
              this.un2 = res.UN2;
              this.un3 = res.UN3;

              this.currentOrder = res;
              this.orderType = res.order_type;
              this.customer = res.client_name;
              this.requirementForm.get('receivedby').setValue(this.customer);
              this.requirementForm.get('order_type').setValue(this.orderType);
              this.loading.dismiss();
            } else {
              console.log('not done;');
            }
          }
        );
      } else {
        this.connectionStatus = true;
        this.authService.getOrders(this.orderDetailsId).subscribe(
          (res) => {
            if (res) {
              //  console.log(res);
              if ((res.company === 'BFIL') && (res.DeliveryModel === 'New')) {
                this.verifyOtp = true;
              } else {
                this.verifyOtp = false;
              }
              this.mainCompany = res.main_company;
              this.un1 = res.UN1;
              this.un2 = res.UN2;
              this.un3 = res.UN3;

              this.currentOrder = res;
              this.orderType = res.order_type;
              this.customer = res.client_name;
              this.requirementForm.get('receivedby').setValue(this.customer);
              this.requirementForm.get('order_type').setValue(this.orderType);
              this.loading.dismiss();
              this.changeDe.detectChanges();
            } else {
              console.log('not done;');
            }
          }
        );
      }
    });

  }
  get f() { return this.requirementForm.controls; }
  navigatebackToDetails(id) {
    this.router.navigate(['/order-details/' + id]);

  }

  async presentActionSheet(id) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Select Image source',
      buttons: [
        {
          text: 'Load from Library',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY, id);
          }
        },
        {
          text: 'Open Camera',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA, id);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  takePicture(sourceType: PictureSourceType, id) {
    if (sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
      var options: CameraOptions = {
        quality: 90,
        sourceType: sourceType,
        saveToPhotoAlbum: false,
        correctOrientation: true,
      };
    } else {
      var options: CameraOptions = {
        quality: 90,
        sourceType: sourceType,
        saveToPhotoAlbum: true,
        correctOrientation: true,
        targetHeight: 800,
      };
    }
    try {
      this.camera.getPicture(options).then(imagePath => {
        if (sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
          this.filePath.resolveNativePath(imagePath)
            .then(filePath => {
              let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
              let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
              this.copyFileToLocalDir(correctPath, currentName, this.createFileName(), id);
            });
        } else {
          var currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
          var correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
          this.copyFileToLocalDir(correctPath, currentName, this.createFileName(), id);
        }
      }, (error) => {
        console.log("Unable to obtain picture: " + error);
        // console.debug("Unable to obtain picture: " + error, "app");
        this.somethingWrong();
      });

    } catch (e) {
      this.somethingWrong();
      return;
    }
  }

  /* uploadImageData updated by dipankar@appycodes */
  uploadImageData(isValue, pod, name, filePath, folderName) {
    this.loaclService.getOrder(this.orderDetailsId).then(
      (res) => {
        if (isValue) {
          /* modified by dipankar@appycodes with help of joydeb@appycodes */
          let saveImageData = {
            'orderId': res.id,
            'imageFolder': folderName,
            'filePath': filePath,
            'fileName': name
          };
          console.log('saveImageData', saveImageData);
          this.pushImagesArr.push(saveImageData);
        }
        this.requirementConStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
          if (status === ConnectionStatus.Online) {
            let options: FileUploadOptions = {
              fileKey: 'file',
              fileName: name,
              chunkedMode: true,
              params: { 'orderId': res.id, 'imageFolder': folderName },
              headers: {}
            };
            const fileTransfer: FileTransferObject = this.transfer.create();
            fileTransfer.upload(filePath, this.API_URL + 'api/upload-image-new', options).then((data) => {
              if (data) {
                console.log('Success');
                console.log('pod:--------->:', pod);
                this.changeDe.detectChanges();
              } else {
                console.log('Fail');
              }
            }, (err) => {
              console.log('Upload error');
            });
          }
        });
      });
  }
  /* endhere by dipankar@appycodes */

  createFileName() {
    var d = new Date(),
      n = d.getTime(),
      newFileName = this.orderDetailsId + n + '.jpg';
    return newFileName;
  }

  deleteImage(id, imageUrl) {
    console.log('delete imageUrl: ', imageUrl);
    if (id == 1) {
      this.image1 = '/assets/camera.svg';
      const index = this.pushImagesArr.findIndex(c => c.imageFolder === 'front');
      this.pushImagesArr.splice(index, 1);
    } else if (id == 2) {
      this.image2 = '/assets/camera.svg';
      const index = this.pushImagesArr.findIndex(c => c.imageFolder === 'back');
      this.pushImagesArr.splice(index, 1);
    } else if (id == 3) {
      this.image3 = '/assets/camera.svg';
      const index = this.pushImagesArr.findIndex(c => c.imageFolder === 'signed');
      this.pushImagesArr.splice(index, 1);
    } else if (id == 4) {
      this.image4 = '/assets/camera.svg';
      const index = this.pushImagesArr.findIndex(c => c.imageFolder === 'extra');
      this.pushImagesArr.splice(index, 1);
    }

    console.log('pushImagesArr: ', this.pushImagesArr);

    let cdata = { 'imageUrl': imageUrl };
    this.authService.deleteImage(cdata).subscribe((res) => {
      console.log('delete:- ', res);
    }, (error) => {
      console.log('delete err:', error);
      const now = new Date();

      let erorrdata = {
        'user_id': localStorage.getItem('userid'),
        'error_type': 'apierror',
        'api': error.url,
        'error': error.message,
        'error_created': now.toISOString()
      };
      console.log('erorrdata::: ', erorrdata);
      this.loaclService.insertErrorData(erorrdata).then((res) => {
      });
    }
    );

    this.changeDe.detectChanges();
  }

  copyFileToLocalDir(namePath, currentName, newFileName, id) {

    this.file.copyFile(namePath, currentName, this.imgPath, newFileName).then(success => {
      // console.log('copyFile:::: ', success);
      this.updateStoredImages(newFileName, id);
    }, error => {
      console.log(error);
    });
  }

  updateStoredImages(name, id) {
    this.storage.get(STORAGE_KEY).then(images => {
      let arr = JSON.parse(images);
      if (!arr) {
        let newImages = [name];
        this.storage.set(STORAGE_KEY, JSON.stringify(newImages));
      } else {
        arr.push(name);
        this.storage.set(STORAGE_KEY, JSON.stringify(arr));
      }

      let filePath = this.imgPath + name;
      // console.log('filePath::: ', filePath);
      // this.resizeImage(filePath,id);
      let resPath = this.pathForImage(filePath);

      let newEntry = {
        name: name,
        path: resPath,
        filePath: filePath,
        isValue: false,
        // is_synced: false
      };

      // console.log('resPath-->>', resPath);
      if (id === 1) {
        this.image1 = resPath;
        newEntry.isValue = true;
        let imgObjFront = JSON.stringify(newEntry);
        this.requirementForm.get('podFront').setValue(newEntry.name);
        /* uploadImageData added by dipankar@appycodes */
        this.uploadImageData(newEntry.isValue, 'podFront', newEntry.name, newEntry.filePath, 'front');
        /* end here */
      } else if (id === 2) {
        this.image2 = resPath;
        newEntry.isValue = true;
        let imgObjBack = JSON.stringify(newEntry);
        this.requirementForm.get('podBack').setValue(newEntry.name);
        /* uploadImageData added by dipankar@appycodes */
        this.uploadImageData(newEntry.isValue, 'podBack', newEntry.name, newEntry.filePath, 'back');
        /* end here */
      } else if (id === 3) {
        this.image3 = resPath;
        newEntry.isValue = true;
        let imgObjSigned = JSON.stringify(newEntry);
        this.requirementForm.get('signedReceipt').setValue(newEntry.name);
        /* uploadImageData added by dipankar@appycodes */
        this.uploadImageData(newEntry.isValue, 'signedReceipt', newEntry.name, newEntry.filePath, 'signed');
        /* end here */
      } else if (id === 4) {
        this.image4 = resPath;
        newEntry.isValue = true;
        let imgObjExtra = JSON.stringify(newEntry);
        this.requirementForm.get('extra').setValue(newEntry.name);
        /* uploadImageData added by dipankar@appycodes */
        this.uploadImageData(newEntry.isValue, 'extra', newEntry.name, newEntry.filePath, 'extra');
        /* end here */
      }
      this.images = [newEntry, ...this.images];
      this.changeDe.detectChanges(); // trigger change detection cycle
    });
  }

  pathForImage(img) {
    if (img === null) {
      return '';
    } else {
      let converted = this.webview.convertFileSrc(img);
      return converted;
    }
  }

  validateAdahar(event) {
    this.validateEvent = event.target.value;
    if (event.target.value === 'aadhaar') {
      this.requirementForm.controls['adharnumber']
        .setValidators([
          Validators.required,
          Validators.minLength(12),
          Validators.minLength(12),
          Validators.pattern('[+-]?([0-9]*[.])?[0-9]+')
        ]);
      this.requirementForm.controls['adharnumber'].updateValueAndValidity();
    }
    if(event.target.value === 'voter'){
      this.requirementForm.controls['aadhaarnumber']
      .setValidators([
        Validators.required,
        Validators.minLength(4),
        Validators.minLength(4),
        Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]+$')
      ]);
    this.requirementForm.controls['aadharnumber'].updateValueAndValidity();
    }
    if(event.target.value === 'loanpassbook'){
      this.requirementForm.controls['aadhaarnumber']
      .setValidators([
        Validators.required,
        Validators.minLength(4),
        Validators.minLength(4),
        Validators.pattern('[a-zA-Z0-9]')
      ]);
    this.requirementForm.controls['aadharnumber'].updateValueAndValidity();
    }
   


    if(event.target.value === 'UniqueNumber'){
      this.verifyOtp = true;
      
      this.requirementForm.controls['aadhaarnumber']
      .setValidators([
        Validators.required,
        Validators.maxLength(6),
        Validators.maxLength(6),
        Validators.pattern('[0-9]')
      ]);
    this.requirementForm.controls['aadhaarnumber'].updateValueAndValidity();
    }

    if (this.mainCompany == 'SAMASTHA') {
      this.requirementForm.get('adharnumber').clearValidators();
      this.requirementForm.get('adharnumber').updateValueAndValidity();
      this.requirementForm.controls['adharnumber']
        .setValidators([
          Validators.minLength(6),
          Validators.pattern('[+-]?([0-9]*[.])?[0-9]+')
        ]);
      this.requirementForm.controls['adharnumber'].updateValueAndValidity();
    } else {
      this.requirementForm.get('adharnumber').clearValidators();
      this.requirementForm.get('adharnumber').updateValueAndValidity();
      this.requirementForm.controls['adharnumber'].setValidators([Validators.required]);
      this.requirementForm.get('adharnumber').updateValueAndValidity();
    }
  }

  submitDocument() {
    // this.loading.present();
    this.submitted = true;
    if (this.mainCompany == 'SAMASTHA') {
      this.requirementForm.get('adharnumber').clearValidators();
      this.requirementForm.get('adharnumber').updateValueAndValidity();
      this.requirementForm.controls['adharnumber'].setValidators([Validators.pattern('[+-]?([0-9]*[.])?[0-9]+')]);
      this.requirementForm.controls['adharnumber'].updateValueAndValidity();
      this.requirementForm.get('podtype').setValue('UniqueNumber');
      localStorage.setItem('otpVerified', '1');
    }

    if (this.requirementForm.invalid) {
      console.log('invalid: ====', this.requirementForm);
      // this.loading.dismiss();
      this.content.scrollToTop(1500);
      let otpmsg = 'Please fill all fields';
      if (!localStorage.getItem('otpVerified')) {
        otpmsg = 'Please fill all fields';
      } else {
        otpmsg = 'Please fill all fields';
      }
      this.requiredField(otpmsg);
      return;
    } else {
      // if only new maharaja then check
      if (this.verifyOtp) {
        // check if otp verified
        if (!localStorage.getItem('otpVerified')) {
          this.content.scrollToTop(1510);
          // this.loading.dismiss();
          this.careOtp();
          return false;
        } else {
          let votp: any = localStorage.getItem('otpVerified');
          if (votp < 1) {
            this.content.scrollToTop(1510);
            // this.loading.dismiss();
            this.careOtp();
            return false;
          }
        }
      }
      /* modified by dipankar@appycodes with help of joydeb@appycodes */
      console.log('pushImagesArr', this.pushImagesArr);
      this.submitDoc = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
        if (status === ConnectionStatus.Online) {
          this.requirementForm.get('uploded_doc_details').setValue(this.pushImagesArr);
          this.authService.submitDoc(this.requirementForm.value).subscribe(
            (res) => {
              if (res) {
                console.log('submitDoc:-->> ', res);
                if (localStorage.getItem('otpVerified')) {
                  localStorage.removeItem('otpVerified');
                }
                // this.loading.dismiss();
                this.loaclService.deleteOrder(res.order_id).then(() => {
                  console.log('Going to delete');
                  this.changeDe.detectChanges();
                  this.router.navigate(['/app/dashbaord/orders']);
                  this.saved();
                });
              }
            });
        } else {
          this.requirementForm.get('uploded_doc_details').setValue(JSON.stringify(this.pushImagesArr));
          this.loaclService.updateOrder(this.requirementForm.value, this.currentOrder).then(
            (res) => {
              if (res) {
                console.log('LocalDB updateOrder details:- ', res);
                if (localStorage.getItem('otpVerified')) {
                  localStorage.removeItem('otpVerified');
                }
                // this.loading.dismiss();
                this.changeDe.detectChanges();
                this.router.navigate(['/app/dashbaord/orders']);
                this.saved();
              }
            }
          );
        }
      });
      /* modified by dipankar@appycodes with help of joydeb@appycodes */
    }
  }

  saved() {
    this.toast = this.toastController.create({
      message: 'Order documents has been saved ',
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

  somethingWrong() {
    this.toast = this.toastController.create({
      message: 'Unable to obtain picture.',
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

  failed() {
    this.toast = this.toastController.create({
      message: 'Error! Not saved ',
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

  requiredField(otpmsg) {
    this.toast = this.toastController.create({
      message: otpmsg,
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

  careOtp() {
    this.toast = this.toastController.create({
      message: 'OTP mismatched ',
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

  otpNotVeridfied() {
    this.toast = this.toastController.create({
      message: 'OTP mismatched ',
      duration: 10000,
      showCloseButton: true,
      position: 'middle',
      closeButtonText: 'Close',
      animated: true,
      cssClass: 'my-custom-class'
    }).then((toastData) => {
      toastData.present();
    });
  }

  otpVeridfied() {
    this.toast = this.toastController.create({
      message: 'OTP Verified ',
      duration: 10000,
      showCloseButton: true,
      position: 'middle',
      closeButtonText: 'Close',
      animated: true,

      cssClass: 'my-custom-class'
    }).then((toastData) => {

      toastData.present();
    });
  }

  openBarcodeReader() {
    this.barcodeScanner.scan()
      .then(barcodeData => {
        this.xmlData = this.parseXML(barcodeData.text, this);
        this.scannedData = barcodeData;
      })
      .catch(err => {
        console.log('Error', err);
      });
  }

  parseXML(data, myobj) {
    new Promise(() => {
      var k,
        parser = new xml2js.Parser(
          {
            trim: true,
            explicitArray: true
          });

      parser.parseString(data, function (err, result) {
        var obj = result.PrintLetterBarcodeData;
        for (k in obj) {
          var item = obj[k].uid;
        }
        myobj.requirementForm.get('adharnumber').setValue(obj[k].uid);
        return item;
      });
    });
  }
}
