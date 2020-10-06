# Project Title

Vishi Electronics by Appycodes


### Prerequisites

What things you need to install the software and how to install them

```
Npm
Ionic v4
Android Studio

```

## Generate jks key

`keytool -genkey -v -keystore vishi.keystore -alias vishi -keyalg RSA -keysize 2048 -validity 10000`
 
 Key Password: admin@vishi

`keytool -importkeystore -srckeystore vishi.keystore -destkeystore vishi.keystore -deststoretype pkcs12`


## Build Process

`ionic cordova build android --release --minifycss --minifyjs`

`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore vishi.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk vishi`

## For Ubuntu
`/home/username/Android/Sdk/build-tools/29.0.3/zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk vishi.apk`

## For Windows
`zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk vishi.apk`
