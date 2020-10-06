var exec = cordova.require('cordova/exec');

var VerifyOtp = function() {
    console.log('VerifyOtp instanced');
};

VerifyOtp.prototype.show = function(msg, onSuccess, onError) {
    var errorCallback = function(obj) {
        onError(obj);
    };

    var successCallback = function(obj) {
        onSuccess(obj);
    };

    exec(successCallback, errorCallback, 'VerifyOtp', 'coolMethod', [msg]);
};

if (typeof module != 'undefined' && module.exports) {
    module.exports = VerifyOtp;
}