#!/bin/bash

phonegap prepare android
phonegap build android --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./furtrack.keystore ./platforms/android/build/outputs/apk/android-release-unsigned.apk Furtrack

rm -f ./platforms/android/build/outputs/apk/android-release.apk

~/Library/Android/sdk/build-tools/23.0.2/zipalign -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk ./platforms/android/build/outputs/apk/android-release.apk
