# This script builds the App Bundle for Play Store
cd apps\mobile_flutter
flutter pub get
flutter build appbundle --release
echo "Build complete! Your .aab file is located at apps/mobile_flutter/build/app/outputs/bundle/release/app-release.aab"
