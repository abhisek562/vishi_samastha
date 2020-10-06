import { Component, OnInit, Output } from '@angular/core';
import { LoadingService } from '../service/loading.service';

@Component({
  selector: 'app-auth-notice',
  templateUrl: './auth-notice.page.html',
  styleUrls: ['./auth-notice.page.scss'],
})
export class AuthNoticePage implements OnInit {
  @Output() type: any;
	@Output() message: any = '';

  constructor(public loading: LoadingService) { }

  ngOnInit() {

    this.loading.onNoticeChanged$.subscribe(
			(notice: AuthNotice) => {
				if(notice){
					this.message = notice.message;
					//this.message = '';
					this.type = notice.type;
				}
			
			}
		);
  }

}
export interface AuthNotice {
	type?: string;
	message: string;
}