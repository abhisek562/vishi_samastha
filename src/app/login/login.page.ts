import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingService } from '../service/loading.service';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { NetworkService, ConnectionStatus } from '../services/network.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  submitted = false;
  constructor(
    private formBuilder: FormBuilder,
    public loading: LoadingService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private networkService: NetworkService,
    public toastController: ToastController
  ) { }

  ngOnInit() {

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (localStorage.getItem('userid')) {
      this.router.navigate(['/app/dashbaord/main']);
    } else {

      this.router.navigate(['/login']);
    }
    this.cdr.detectChanges();
  }

  get f() { return this.loginForm.controls; }

  submitLogin() {
    this.loading.present(' Please wait login');
    this.networkService.onNetworkChange().subscribe((status: ConnectionStatus) => {
      if (status === ConnectionStatus.Offline) {
        this.loading.dismiss();
        let toast = this.toastController.create({
          message: `You are now offline`,
          duration: 1000,
          position: 'bottom'
        });
        toast.then(toast => toast.present());
      }
    });


    this.submitted = true;
    if (this.loginForm.invalid) {
      this.loading.setNotice('Please enter login details to login', 'error');
      this.loading.dismiss();
      return;
    } else {


      this.authService.login(this.loginForm.value).subscribe(response => {

        if ((typeof response !== 'undefined') && (response.error === false)) {
          this.loading.dismiss();


          localStorage.setItem('userid', response.id);

          localStorage.setItem('user_name', response.name);

          localStorage.setItem('token', response.token);

          this.router.navigate(['/app/dashbaord/main']);
          // this.router.navigateByUrl('/dashboard');
          // this.cdr.detectChanges();
          // this.router.navigateByUrl('tabs/tab3');
        } else {
          this.loading.setNotice(response.errMsg, 'error');


          this.cdr.detectChanges();
          this.loading.dismiss();
        }


      },
        (err) => {

          // this.cdr.detectChanges();
        });
    }
  }

}
