import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LoadingService {
  isLoading = false;

  onNoticeChanged$: BehaviorSubject<AuthNotice>;

  constructor(private loadingCtrl: LoadingController) {
    this.onNoticeChanged$ = new BehaviorSubject(null);
  }

  async present(msg = null) {
    if (!msg) {
      msg = 'Please wait...';
    }
    this.isLoading = true;
    return await this.loadingCtrl.create({
      message: msg,
    }).then(a => {
      a.present().then(() => {
        // console.log('presented');
        if (!this.isLoading) {
          a.dismiss(null , 'cancel').then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async dismiss() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss(null , 'cancel').then(() => console.log('dismissed'));
  }
  setNotice(message: string, type?: string) {
    const notice: AuthNotice = {
      message: message,
      type: type,

    };
    this.onNoticeChanged$.next(notice);
  }
}
export interface AuthNotice {
  type?: string;
  message: string;
}
