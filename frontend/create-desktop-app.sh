#!/bin/bash

echo "🚀 Servis Bakım Formu - Masaüstü Uygulaması Builder"
echo "=================================================="
echo ""

cd /app/frontend

# Build warnings'leri temizle
echo "🔧 Paketleri güncelliyoruz..."
yarn add --dev @babel/plugin-proposal-private-property-in-object

# React build yap
echo "📦 React build yapılıyor..."
yarn build

# Kullanıcıya seçenek sun
echo ""
echo "✅ React build tamamlandı! Şimdi hangi platform için uygulama istiyorsunuz?"
echo ""
echo "1️⃣  Linux (.AppImage) - Taşınabilir uygulama"
echo "2️⃣  Windows (.exe) - Kurulum dosyası"
echo "3️⃣  macOS (.dmg) - Mac kurulum dosyası"
echo "4️⃣  Tüm platformlar"
echo ""
echo "🎯 Seçim yapmak için 1-4 arasında bir sayı girin:"
read -p "Seçiminiz: " choice

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
        echo "🌍 Tüm platformlar..."
        yarn electron-builder --linux --win --mac --x64
        ;;
    *)
        echo "❌ Geçersiz seçim. Linux AppImage yapılacak..."
        yarn electron-builder --linux --x64
        ;;
esac

echo ""
echo "⏳ Build işlemi başladı. Lütfen bekleyin..."
echo ""

# Sonuçları göster
sleep 10
if [ -d "dist" ]; then
    echo "✅ ✅ ✅ BAŞARILI! ✅ ✅ ✅"
    echo "========================="
    echo ""
    echo "📦 Oluşturulan dosyalar:"
    find dist/ -name "*.AppImage" -o -name "*.exe" -o -name "*.dmg" | head -10
    echo ""
    echo "📁 Tam liste için: ls -la dist/"
    echo ""
    echo "🎯 KULLANIM:"
    echo "• Bu dosyaları herhangi bir bilgisayara kopyalayın"
    echo "• Çift tıklayın"
    echo "• Uygulama çalışacak!"
    echo ""
    echo "🎉 Artık masaüstü uygulamanız hazır!"
else
    echo "❌ Build başarısız. Tekrar deneyin."
fi