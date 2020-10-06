import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
export interface Dev {
  id: number;
  name: string;
  skills: any[];
  img: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineOnlineService {

  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  orders = new BehaviorSubject([]);
  products = new BehaviorSubject([]);
  row_data: any = [];

  constructor(private plt: Platform, private sqlite: SQLite, private http: HttpClient) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'orders.db',
        location: 'default'
      }).then((db: SQLiteObject) => {
        this.database = db;
        db.executeSql(
          `CREATE TABLE IF NOT EXISTS ordersnew
          (id INTEGER,batch_number TEXT,batch_date TEXT, branch_name TEXT,
             client_name TEXT, client_id TEXT, client_unique_id TEXT,
             company TEXT, address_line_1 TEXT, landmark TEXT,loan_proposal_id TEXT,
             model TEXT, supplier_name TEXT, address_line_2 TEXT, village TEXT,
             mobile_updated TEXT, bm_number TEXT, out_for_delivery INTEGER,
             status TEXT, urgent INTEGER, order_type TEXT, pod_type TEXT,
             pod_number TEXT, received_by TEXT, pod_front TEXT, pod_end TEXT,
             signed_receipt TEXT, extra TEXT, remarks TEXT, other_remark TEXT,
             new_product_serial_no TEXT, grn_no TEXT, replacement_at TEXT,
             media_file TEXT, husband_name TEXT, geo_tag TEXT, marchant_mobile TEXT,
             main_company TEXT, DeliveryModel TEXT, UN1 TEXT, UN2 TEXT, UN3 TEXT,
             uploded_doc_details TEXT,
             updated_at TEXT, extrafield1 TEXT, extrafield2 TEXT, extrafield3 TEXT)`, [])

          .then(() => {
            console.log('Order table created');
            this.database.executeSql(`CREATE TABLE IF NOT EXISTS error_log
              (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE ,user_id INTEGER, error_type TEXT,
                api TEXT,error TEXT, error_created TEXT)`, []).then(_ => {
            }).then(() => {
              console.log('Error table created');
            }).catch(e => console.log(e));
          }).catch(e => console.log(e));
        this.dbReady.next(true);
      });

    });
  }

  /* modified by dipankar@appycodes */
  insertErrorData(errorData) {
    console.log('insertErrorData:- ', errorData);
    let Errordata = [
      errorData.user_id,
      errorData.error_type,
      errorData.api,
      errorData.error,
      errorData.error_created
    ];

    return this.database.executeSql(`INSERT INTO error_log
    (user_id, error_type, api, error, error_created) VALUES (?, ?, ?, ?, ?)`, Errordata)
      .then(() => {
        this.selectAllErrorLog();
        console.log('row inserted');
      })
      .catch(e => {
        console.log('error ' + JSON.stringify(e));
      });
  }

  selectAllErrorLog() {
    return this.database.executeSql(`SELECT * FROM error_log`, [])
      .then((res) => {
        console.log('local DB result: ', res.rows);
        let offlineError = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            offlineError.push(res.rows.item(i));
          }
        }
        return offlineError;
      });
  }

  deleteErrorLog(id) {
    return this.database.executeSql(`DELETE FROM error_log WHERE id = ?`, [id]).then(_ => {
      console.log('Record Deleted');
    });
  }
  /* modified by dipankar@appycodes */


  getDatabaseState() {
    return this.dbReady.asObservable();
  }

  getOrders(): Observable<Dev[]> {
    return this.orders.asObservable();
  }

  countOrders() {
    return this.database.executeSql(`SELECT * FROM ordersnew where status!='pending'`, []).then(data => {
      return data.rows.length;
    });
  }

  loadOrders(searchedTerm: string = null, page: number = null, param: number = null, orderStatus = null, orderType = null) {
    let sql = 'SELECT * FROM ordersnew ';
    let con = 'where 1 ';
    if (searchedTerm) {
      con += 'and ';
      con += `(branch_name like '%` +
        searchedTerm + `%' or client_name like '%` +
        searchedTerm + `%' or client_id like '%` +
        searchedTerm + `%' or order_type like '%` +
        searchedTerm + `%' or company like '%` +
        searchedTerm + `%' )`;
    }
    sql = sql + con;

    return this.database.executeSql(sql, []).then(data => {
      let offlineOrders = [];

      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          offlineOrders.push(data.rows.item(i));
        }

      }
      console.log('offlineOrders: -> ', offlineOrders);
      return offlineOrders;
    });
  }

  getCompanies() {
    return this.database.executeSql(`SELECT DISTINCT company FROM ordersnew`, []).then(data => {
      let offlineCompany = [];

      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          offlineCompany.push(data.rows.item(i));
        }

      }
      return offlineCompany;
    });
  }
  getOrderTypes() {
    return this.database.executeSql(`SELECT DISTINCT order_type FROM ordersnew`, []).then(data => {
      let offlineOrderType = [];

      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          offlineOrderType.push(data.rows.item(i));
        }

      }
      return offlineOrderType;
    });
  }
  loadSyncableOrders() {
    return this.database.executeSql(`SELECT * FROM ordersnew where status!='pending'`, []).then(data => {
      let offlineOrders = [];

      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          offlineOrders.push(data.rows.item(i));
        }

      }
      return offlineOrders;
    });
  }

  addOrder(odrerData) {

    let rowid = odrerData.id;
    // odrerData.out_for_delivery
    let podFront = { name: '', path: '', filePath: '', isValue: false };
    let podBack = { name: '', path: '', filePath: '', isValue: false };
    let signed = { name: '', path: '', filePath: '', isValue: false };
    let extraBack = { name: '', path: '', filePath: '', isValue: false };
    let extraField1 = '';
    let extraField2 = '';
    let extraField3 = '';

    let outForDelivery = 1;
    let insertdata = [
      odrerData.id,
      odrerData.batch_number,
      odrerData.batch_date,
      odrerData.branch_name,
      odrerData.client_name,
      odrerData.client_id,
      odrerData.client_unique_id,
      odrerData.company,
      odrerData.address_line_1,
      odrerData.landmark,
      odrerData.loan_proposal_id,
      odrerData.model,
      odrerData.supplier_name,
      odrerData.address_line_2,
      odrerData.village,
      odrerData.mobile_updated,
      odrerData.bm_number,
      outForDelivery,
      odrerData.status,
      odrerData.urgent,
      odrerData.order_type,
      odrerData.pod_type,
      odrerData.pod_number,
      odrerData.received_by,
      odrerData.pod_front,
      odrerData.pod_end,
      odrerData.signed_receipt,
      odrerData.extra,
      odrerData.remarks,
      odrerData.other_remark,
      odrerData.new_product_serial_no,
      odrerData.grn_no,
      odrerData.replacement_at,
      odrerData.media_file,
      odrerData.husband_name,
      odrerData.geo_tag,
      odrerData.marchant_mobile,
      odrerData.main_company,
      odrerData.DeliveryModel,
      odrerData.UN1,
      odrerData.UN2,
      odrerData.UN3,
      odrerData.uploded_doc_details,
      odrerData.updated_at,
      extraField1,
      extraField2,
      extraField3
    ];

    return this.database.executeSql(`SELECT * FROM ordersnew WHERE id = ?`, [rowid]).then(data => {
      if (data.rows.length === 0) {
        this.database.executeSql(`INSERT INTO ordersnew
        (id, batch_number, batch_date, branch_name, client_name,
          client_id, client_unique_id, company, address_line_1, landmark,
          loan_proposal_id, model, supplier_name, address_line_2, village,
          mobile_updated, bm_number, out_for_delivery, status, urgent,
          order_type, pod_type, pod_number, received_by, pod_front,
          pod_end, signed_receipt, extra, remarks, other_remark,
          new_product_serial_no, grn_no, replacement_at, media_file,
          husband_name, geo_tag, marchant_mobile, main_company,
          DeliveryModel, un1, un2, un3, uploded_doc_details,
          updated_at,extrafield1,extrafield2,extrafield3)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?,?,?,?
            )`, insertdata).then(() => {

        });
      } else {
        let updatedata = [odrerData.status];
        if (odrerData.status === 'cancelled') {
          this.database.executeSql(`UPDATE ordersnew SET status = ? WHERE id = ${rowid}`, updatedata).then(res => { });
        }
      }
    });

  }

  /* modified by dipankar@appycodes with help of joydeb@appycodes */
  syncOnlyOrders() {
    return this.database.executeSql(`SELECT * FROM ordersnew where status!='pending' limit 5`, []).then(data => {
      let offlineOrders = [];

      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          offlineOrders.push(data.rows.item(i));
        }

      }
      return offlineOrders;
    });
  }
  /* modified by dipankar@appycodes with help of joydeb@appycodes */

  getOrder(id) {
    return this.database.executeSql(`SELECT * FROM ordersnew WHERE id = ?`, [id]).then(data => {
      if (data.rows.length > 0) {

        return data.rows.item(0);
      } else {
        return false;
      }
    });
  }
  checkRow(id) {
    return this.database.executeSql(`SELECT * FROM ordersnew WHERE id = ?`, [id]).then(data => {
      if (data.rows.length > 0) {

        return true;
      } else {
        return false;
      }
    });
  }

  deleteOrder(id) {
    return this.database.executeSql(`DELETE FROM ordersnew WHERE id = ?`, [id]).then(_ => {
      console.log('record delete');
    });
  }

  updateOrder(cdata, odrerData) {

    console.log('updateOrder cdata: ', cdata);
    let rowid = cdata.orderId;
    let data = [
      cdata.podFront,
      cdata.podBack,
      cdata.signedReceipt,
      cdata.extra,
      cdata.podtype,
      cdata.adharnumber,
      cdata.receivedby,
      cdata.delivery,
      cdata.remark,
      cdata.otherremark,
      cdata.new_product_serial_no,
      cdata.grn_no,
      cdata.replacement_at,
      cdata.media_file,
      cdata.current_lat + ',' + cdata.current_lng,
      cdata.uploded_doc_details,
      cdata.updated_at
    ];
    this.database.executeSql('SELECT * FROM ordersnew WHERE id = ?', [rowid]).then(data => {
      if (data.rows.length === 0) {
        this.addOrder(odrerData);
      }
    });
    return this.database.executeSql(`UPDATE ordersnew SET
    pod_front = ?, pod_end=?, signed_receipt=?, extra=?,
    pod_type=?, pod_number=?, received_by=?, status=?,
    remarks=?, other_remark=?, new_product_serial_no=?,
    grn_no=?, replacement_at=?, media_file=?, geo_tag=?,
    uploded_doc_details=?, updated_at=?
     WHERE id = ${rowid}`, data).then(res => {

      return res;
    });
  }

}
