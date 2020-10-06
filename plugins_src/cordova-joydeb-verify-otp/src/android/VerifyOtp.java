package com.joydeb.verifyotp;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import android.widget.Toast;
import com.bfil.encryptionmodule.EncryptionModule;
/**
 * This class echoes a string called from JavaScript.
 */
public class VerifyOtp extends CordovaPlugin {

@Override
public boolean execute(String action, JSONArray args, final CallbackContext callbackContext) throws JSONException {
    if ("coolMethod".equals(action)) {
        String message = args.getString(0);
        cordova.getActivity().runOnUiThread(new Runnable() {
            public void run() {
                
                coolMethod(message, callbackContext);
            }
        });
        return true;
    }
    return false;
}
    private void coolMethod(String message, CallbackContext callbackContext) {
        if (message != null && message.length() > 0) {
            try {
                    JSONObject obj = new JSONObject(message);
                    String UN1=obj.getString("un1");
                    String UN2=obj.getString("un2");
                    String plain=obj.getString("plain");
                    int res=0;
                    int res1 = EncryptionModule.EncryptionToCompare(UN1, plain);
                    int res2 = EncryptionModule.EncryptionToCompare(UN2, plain);

                    if((res1==1)||(res2==1)){
                        res=1;
                        Toast.makeText(webView.getContext(), "OTP verified successfully", Toast.LENGTH_LONG).show();
                        callbackContext.success(res);
                    }else{
                         res=0;
                        Toast.makeText(webView.getContext(), "OTP not verified ", Toast.LENGTH_LONG).show();
                        callbackContext.success(res);
                    }
                                            
                } catch (Throwable t) {
                     callbackContext.success("Java error!");
                }
            
        } else {
            callbackContext.error("Expected one non-empty string argument.");
        }
    }
}
