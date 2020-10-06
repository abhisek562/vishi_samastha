import { Injectable } from '@angular/core';
import { OfflineOnlineService } from '../services/offline-online.service';
import { FileTransfer, FileTransferObject, FileUploadOptions } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { NetworkService, ConnectionStatus } from '../services/network.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncOfflineOrdersService {
  API_URL: String = environment.apiUrl;

  syncing = false;
  countSyncableOrders: any = 0;
  loaderCount = 0; /* modified by dipankar@appycodes with help of joydeb@appycodes */
  submitDoc: Subscription;
  today: string;
  constructor(
    private loaclService: OfflineOnlineService,
    private transfer: FileTransfer,
    private networkService: NetworkService,
    public authService: AuthService,
    private file: File
  ) { }
  ngOnInit() {

  }

  checnNsyncImage(localOrder) {

    localOrder.startedsync = false;
    localOrder.needSyncing = false;

    for (let imageData of localOrder.uploded_doc_details) {
      if (imageData.filePath) {

        this.syncUpload(imageData);
      }
    }
  }

  syncUpload(imagedata) {
    console.log('checking in syncUpload');
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: 'file',
      fileName: imagedata.fileName,
      chunkedMode: false,
      mimeType: 'multipart/form-data',
      params: {
        'orderId': imagedata.orderId,
        'imageFolder': imagedata.imageFolder,
        'id' : imagedata.id,
        'filePath': imagedata.filePath
      },
      headers: {}
    };
    // console.log('options:::::: ', options);
    this.file.checkFile(this.file.dataDirectory, imagedata.fileName).then(
      (res) => {

        fileTransfer.upload(imagedata.filePath, this.API_URL + 'api/upload-syncable-image', options).then((data) => {
          if (data) {
            // console.log('success upload-syncable-image:---- ', data);
            return true;
          } else {
            return true;
          }
        }, (err) => {
          console.log('Upload error');
        });
      },
      (err) => {
        console.log('..');
      }
    );
  }



  /* modified by dipankar@appycodes with help of joydeb@appycodes */
  syncOnlyOrders() {

    this.loaclService.syncOnlyOrders().then(
      (res) => {

        if (res.length > 0) {
          for (let localOrder of res) {
            let uploded_doc_details = '';
            if (localOrder.status === 'delivered') {
              uploded_doc_details = JSON.parse(localOrder.uploded_doc_details); /* modified by dipankar@appycodes */
            }
            let formdata = {
              'orderId': localOrder.id,
              'podtype': localOrder.pod_type,
              'adharnumber': localOrder.pod_number,
              'delivery': localOrder.status,
              'failedDeliveryCause': '',
              'grn_no': localOrder.grn_no,
              'new_product_serial_no': localOrder.new_product_serial_no,
              'replacement_at': localOrder.replacement_at,
              'remark': localOrder.remarks,
              'receivedby': localOrder.received_by,
              'geo_tag': localOrder.geo_tag,
              'uploded_doc_details': uploded_doc_details, /* modified by dipankar@appycodes */
              'updated_at': localOrder.updated_at
            };
            /* modified by dipankar@appycodes */
            if (localOrder) {;
              this.submitDoc = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
                if (status === ConnectionStatus.Online) {
                  this.authService.syncLocalOrders(formdata).subscribe(
                    (response) => {
                      console.log('LocalOrders synced');
                      if (response) {
                        this.loaclService.deleteOrder(response.order_id).then(() => {
                        });
                        this.loaclService.countOrders().then(
                          (result) => {
                            this.countSyncableOrders = result;
                          });
                      }
                    }
                  );
                }
              });
            }
          }
          /* modified by dipankar@appycodes */
        } else {
          this.loaclService.countOrders().then(
            (response) => {
              this.countSyncableOrders = response;
            });
        }

      }
    );

  }
  /* modified by dipankar@appycodes */
  postLocalDB() {
    // console.log('in postLocalDB function');
    this.loaclService.syncOnlyOrders().then(
      (res) => {

        if (res.length > 0) {
          // console.log('total order to sync' + res.length);
          for (let localOrder of res) {
            let uploded_doc_details = '';
            if (localOrder.status === 'delivered') {
              uploded_doc_details = JSON.parse(localOrder.uploded_doc_details); /* modified by dipankar@appycodes */
            }
            let formdata = {
              'orderId': localOrder.id,
              'podtype': localOrder.pod_type,
              'adharnumber': localOrder.pod_number,
              'delivery': localOrder.status,
              'failedDeliveryCause': '',
              'grn_no': localOrder.grn_no,
              'new_product_serial_no': localOrder.new_product_serial_no,
              'replacement_at': localOrder.replacement_at,
              'remark': localOrder.remarks,
              'receivedby': localOrder.received_by,
              'geo_tag': localOrder.geo_tag,
              'uploded_doc_details': uploded_doc_details,
              'updated_at': localOrder.updated_at
            };
            const now = new Date();
            this.today = now.toISOString();
            let errorData = {
              'user_id': localStorage.getItem('userid'),
              'error_type': 'orderdata',
              'api': 'no api',
              'error': JSON.stringify(formdata),
              'error_created': this.today
            };
            if (localOrder) {
              // console.log('errorData:>- ', errorData);
              this.submitDoc = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
                if (status === ConnectionStatus.Online) {
                  this.authService.postLocalDB(errorData).subscribe(
                    (response) => {
                      // console.log('Error Data synced');
                      if (response) {
                        console.log(response);
                      }
                    }
                  );
                  this.loaclService.selectAllErrorLog().then((offlineError) => {
                    if (offlineError.length > 0) {
                      this.authService.postLocalDB(offlineError).subscribe(
                        (response) => {
                          // console.log('offlineError Data synced');
                          if (response) {
                            console.log(response);
                          }
                        }
                      );
                    }
                  }
                  );

                } else {
                  this.loaclService.insertErrorData(errorData).then(
                    () => {
                      this.loaclService.selectAllErrorLog().then((offlineError) => {
                        console.log('offlineError: -> ', offlineError.length);
                      }
                      );
                    }
                  );
                }
              });
            }
          }
          /* modified by dipankar@appycodes */
        } else {
          this.loaclService.countOrders().then(
            (response) => {
              this.countSyncableOrders = response;
            });
        }
      }
    );
  }


  syncSyncableImages() {
    this.submitDoc = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Online) {
        this.authService.syncLocalImages().subscribe((res) => {
          for (let imageData of res.images) {
            // console.log('imageData>>>>>>>', imageData);
            if (imageData.filePath) {
              this.syncUpload(imageData);
            }
          }
        });
      }
    });
  }
  /* modified by dipankar@appycodes with help of joydeb@appycodes */
}
