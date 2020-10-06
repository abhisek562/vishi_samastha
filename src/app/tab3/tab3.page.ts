import { Component, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingService } from '../service/loading.service';
import { NetworkService, ConnectionStatus } from '../services/network.service';
import { Subscription } from 'rxjs';
import { OfflineOnlineService } from '../services/offline-online.service';
import { SyncOfflineOrdersService } from '../service/sync-offline-orders.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  changePassword: FormGroup;
  submitted = false;
  msg: String = '';
  connectionStatus = true;
  settingConStat: Subscription;
  constructor(
    private router: Router,
    public authService: AuthService,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public loading: LoadingService,
    private networkService: NetworkService,
    private loaclService: OfflineOnlineService,
    private syncOffline: SyncOfflineOrdersService
  ) { }


  ngOnInit() {
    if (!localStorage.getItem('userid')) {
      this.router.navigate(['/login']);
    }

    this.changePassword = this.formBuilder.group({
      userId: [localStorage.getItem('userid')],
      oldPass: ['', [Validators.required, Validators.minLength(6)]],
      newPass: ['', [Validators.required, Validators.minLength(6)]],


    });
  }
  get f() { return this.changePassword.controls; }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);

  }
  ionViewWillLeave() {
    this.settingConStat.unsubscribe();
  }
  ionViewWillEnter() {
    this.settingConStat = this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.connectionStatus = false;

      } else {
        this.connectionStatus = true;
      }
    });
  }

  savePassword() {
    this.loading.present(' Password saving');
    this.submitted = true;
    if (this.changePassword.invalid) {
      this.msg = '';
      this.cdr.detectChanges();
      this.loading.dismiss();
      return;
    } else {
      this.authService.changePassword(this.changePassword.value).subscribe(response => {
        if ((typeof response != 'undefined') && (response.error === false)) {
          this.loading.dismiss();

          localStorage.setItem('token', response.token);

          this.router.navigate(['/app/dashbaord/main']);

        } else {
          this.loading.dismiss();
          // this.loading.setNotice(response.errMsg, 'error');

          this.msg = response.errMsg;
          this.cdr.detectChanges();
          this.loading.dismiss();
        }
      });

    }
  }

  sendDebugInfo() {
    console.log('clicking sendDebugInfo function');
    this.syncOffline.postLocalDB();
  }

}
