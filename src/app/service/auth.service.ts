import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { OfflineOnlineService } from '../services/offline-online.service';
@Injectable({
	providedIn: 'root'
})
export class AuthService {
	API_URL: String = environment.apiUrl;
	API_ENDPOINT_LOGIN = 'api/login';
	API_ENDPOINT_UPDATE_PASSWORD = 'api/reset-pass';
	API_ENDPOINT_SEARCHED_ORDERS = 'api/get-orders';
	API_ENDPOINT_GET_ORDERS = 'api/get-order';
	API_ENDPOINT_UPDATE_ORDER = 'api/update-order';
	API_ENDPOINT_UPDATE_NEW_ORDER = 'api/update-order-new';
	API_ENDPOINT_POST_LOCAL_DB = 'api/post-local-db';
	API_ENDPOINT_OUT_FOR_DELIVERY = 'api/update-out-for-delivery';
	API_ENDPOINT_DELETE_IMAGE = 'api/delete-image';
	API_ENDPOINT_GET_DASHBOARD = 'api/dashboard';
	API_ENDPOINT_CRASH_REPORT = 'api/log-report';
	API_ENDPOINT_GET_COMPANIES = 'api/get-companies';
	API_ENDPOINT_GET_ORDER_STATUS = 'api/get-all-order-status';
	API_ENDPOINT_GET_VERSION_CHECK = 'api/get-appversion';
	API_ENDPOINT_SEND_OUT_FOR_DELIVERY = 'api/order/out_for_delivery';
	API_ENDPOINT_SEARCH_ORDER_FOR_COMPANIES = 'api/get-orders-by-company';
	API_ENDPOINT_GET_SYNCABLE_IMAGES = 'api/get-syncable-images';

	constructor(
		private http: HttpClient,
		private loaclService: OfflineOnlineService
	) { }

	/* modified by dipankar@appycodes */
	// Handle API errors
	handleError(error: HttpErrorResponse) {
		// console.log('handle error: ', error);
		// const now = new Date();
        
		// let erorrdata = {
		// 	'user_id' : localStorage.getItem('userid'),
        //     'error_type' : 'apierror',
		// 	'api': error.url,
		// 	'error': error.message,
		// 	'error_created' : now.toISOString()
		// }
		// console.log('erorrdata::: ', erorrdata);
		// this.loaclService.insertedData(erorrdata);
		// this.loaclService.insertErrorData(erorrdata).then((res) => {
		// });

		if (error.error instanceof ErrorEvent) {
			console.log('inside if error: ', error);
			// A client-side or network error occurred. Handle it accordingly.
			console.error('An error occurred:', error.error.message);
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			console.error(
				`Backend returned code ${error.status}, ` +
				`body was: ${error.error}`);
		}
		// return an observable with a user-facing error message
		return throwError(
			'Something bad happened; please try again later.');
	}
	/* modified by dipankar@appycodes */
	public login(credential): Observable<any> {

		// Expecting response from API
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };

		return this.http.post(this.API_URL + this.API_ENDPOINT_LOGIN, credential, options).pipe(
			map((result: any) => {
				// 	console.log(result);
				if (result instanceof Array) {
					return result.pop();
				}
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	public changePassword(credential): Observable<any> {

		// Expecting response from API
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };

		return this.http.post(this.API_URL + this.API_ENDPOINT_UPDATE_PASSWORD, credential, options).pipe(
			map((result: any) => {
				if (result instanceof Array) {
					return result.pop();
				}
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}
	public logout(refresh?: boolean): void {
		localStorage.clear();
		return;
	}

	getSearchdorders(searchedTerm: string, page: number, param: number, orderStatus, orderType): Observable<any> {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		let userid = localStorage.getItem('userid');
		let cdata = {
			'branch_name': searchedTerm,
			'page': page, 'param': param,
			'userid': userid,
			'order_status': orderStatus,
			'order_type': orderType
		};
		return this.http.post(this.API_URL + this.API_ENDPOINT_SEARCHED_ORDERS, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	getOrderByCompany(searchedTerm: string, page: number, param: number, orderStatus, orderType): Observable<any> {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		let userid = localStorage.getItem('userid');
		let cdata = {
			'company': searchedTerm,
			'page': page,
			'param': param,
			'userid': userid,
			'order_status': orderStatus,
			'order_type': orderType
		};
		return this.http.post(this.API_URL + this.API_ENDPOINT_SEARCH_ORDER_FOR_COMPANIES, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	getOrders(id): Observable<any> {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		let cdata = { 'order_id': id };
		return this.http.post(this.API_URL + this.API_ENDPOINT_GET_ORDERS, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	updateOutofDelivery(orderId, status): Observable<any> {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		let cdata = { 'orderId': orderId, 'out_of_delivery': status };
		return this.http.post(this.API_URL + this.API_ENDPOINT_OUT_FOR_DELIVERY, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	submitDoc(cdata): Observable<any> {
		console.log('Updating order...');
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		return this.http.post(this.API_URL + this.API_ENDPOINT_UPDATE_ORDER, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	syncLocalOrders(cdata): Observable<any> {
		console.log('Updating order LocalOrders');
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		return this.http.post(this.API_URL + this.API_ENDPOINT_UPDATE_NEW_ORDER, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	postLocalDB(cdata): Observable<any> {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		return this.http.post(this.API_URL + this.API_ENDPOINT_POST_LOCAL_DB, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}


	deleteImage(cdata): Observable<any> {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		return this.http.post(this.API_URL + this.API_ENDPOINT_DELETE_IMAGE, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			// retry(1),
			// catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	getDashboard(appversion): Observable<any> {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		let userid = localStorage.getItem('userid');
		let cdata = { 'user_id': userid, 'app_version': appversion };
		return this.http.post(this.API_URL + this.API_ENDPOINT_GET_DASHBOARD, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	getCompanies() {
		return this.http.get(this.API_URL + this.API_ENDPOINT_GET_COMPANIES).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	getGetOrderStatus() {
		return this.http.get(this.API_URL + this.API_ENDPOINT_GET_ORDER_STATUS).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	getAppVersionCheck() {
		return this.http.get(this.API_URL + this.API_ENDPOINT_GET_VERSION_CHECK).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);
	}

	public getToken(): string {
		return localStorage.getItem('token');
	}

	// appCrashReport(crashString): Observable<any> {
	// 	let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
	// 	let options = { headers: headers };
	// 	let userid = localStorage.getItem('userid');
	// 	let cdata = { 'user_id': userid, 'report': crashString };
	// 	return this.http.post(this.API_URL + this.API_ENDPOINT_CRASH_REPORT, cdata, options).pipe(
	// 		map((result: any) => {
	// 			return result;
	// 		}),
	// 	);
	// }

	public sendOutForDeliveryNotification(order) {
		console.log(order);
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		let cdata = {
			'LoanProposalID': order.loan_proposal_id,
			'VendorId': order.vendor_id,
		};
		return this.http.post(this.API_URL + this.API_ENDPOINT_SEND_OUT_FOR_DELIVERY, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			/* modified by dipankar@appycodes */
			retry(1),
			catchError(this.handleError)
			/* modified by dipankar@appycodes */
		);

	}

	/* modified by dipankar@appycodes */
	syncLocalImages() {
		let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		let options = { headers: headers };
		let cdata = { 'user_id': localStorage.getItem('userid') };
		return this.http.post(this.API_URL + this.API_ENDPOINT_GET_SYNCABLE_IMAGES, cdata, options).pipe(
			map((result: any) => {
				return result;
			}),
			retry(1),
			catchError(this.handleError)
		);
	}
	/* modified by dipankar@appycodes */
}
