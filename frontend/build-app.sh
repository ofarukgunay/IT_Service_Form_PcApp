#!/bin/bash

echo "🚀 Electron Masaüstü Uygulaması Build Rehberi"
echo "============================================="
echo ""

cd /app/frontend

# Önce mevcut build'i temizle
echo "🧹 Önceki build dosyalarını temizliyoruz..."
rm -rf dist/
rm -rf build/

# React build yap
echo "📦 React uygulaması build ediliyor..."
echo "Bu işlem 1-2 dakika sürer..."
yarn build

if [ $? -eq 0 ]; then
    echo "✅ React build başarılı!"
else
    echo "❌ React build başarısız! Lütfen hataları kontrol edin."
    exit 1
fi

echo ""
echo "🔧 Hangi platform için uygulama oluşturmak istiyorsunuz?"
echo "1) Linux (.AppImage - Taşınabilir)"
echo "2) Windows (.exe - Kurulum dosyası)"
echo "3) macOS (.dmg - Kurulum dosyası)"
echo "4) Tüm platformlar"
echo ""
read -p "Seçiminizi yapın (1-4): " choice

case $choice in
    1)
        echo "🐧 Linux AppImage oluşturuluyor..."
        yarn electron-builder --linux --x64
        ;;
    2)
        echo "🪟 Windows exe oluşturuluyor..."
        yarn electron-builder --win --x64
        ;;
    3)
        echo "🍎 macOS dmg oluşturuluyor..."
        yarn electron-builder --mac --x64
        ;;
    4)
        echo "🌍 Tüm platformlar için build yapılıyor..."
        yarn electron-builder --linux --win --mac --x64
        ;;
    *)
        echo "❌ Geçersiz seçim!"
        exit 1
        ;;
esac

echo ""
echo "⏳ Build işlemi başladı. Bu 5-10 dakika sürebilir..."
echo "📋 İşlem tamamlandığında 'dist/' klasöründe dosyalar hazır olacak."
echo ""

# Build tamamlandıktan sonra sonuçları göster
if [ -d "dist" ]; then
    echo "✅ Build başarılı! Oluşturulan dosyalar:"
    echo "========================================"
    ls -la dist/
    echo ""
    echo "📱 Kullanım:"
    echo "• Linux: .AppImage dosyasını çift tıklayın"
    echo "• Windows: .exe dosyasını çift tıklayın"
    echo "• macOS: .dmg dosyasını açın ve uygulamayı Applications'a sürükleyin"
    echo ""
    echo "🎯 Artık bu dosyaları başka bilgisayarlara kopyalayabilirsiniz!"
else
    echo "❌ Build başarısız! Lütfen log dosyalarını kontrol edin."
fi