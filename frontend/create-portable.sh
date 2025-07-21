#!/bin/bash

# Servis Bakım Formu - Masaüstü Uygulaması Kurulum Scripti
# Bu script uygulamayı herhangi bir bilgisayarda çalıştırmak için gerekli dosyaları hazırlar

echo "🚀 Servis Bakım Formu - Masaüstü Uygulaması Kurulum"
echo "================================================="

# Proje dizinine git
cd /app/frontend

# React build oluştur
echo "📦 React uygulaması build ediliyor..."
yarn build

# Portable uygulama klasörü oluştur
PORTABLE_DIR="ServisBakimFormu-Portable"
rm -rf $PORTABLE_DIR
mkdir -p $PORTABLE_DIR

# Gerekli dosyaları kopyala
cp -r build $PORTABLE_DIR/
cp public/electron.js $PORTABLE_DIR/
cp package.json $PORTABLE_DIR/

# Basit electron wrapper oluştur
cat > $PORTABLE_DIR/electron-simple.js << 'EOF'
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    title: 'Servis Bakım Formu - Kartepe Belediyesi',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'build/index.html'));
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
EOF

# Başlat scripti oluştur
cat > $PORTABLE_DIR/start.sh << 'EOF'
#!/bin/bash
echo "Servis Bakım Formu başlatılıyor..."
if command -v electron &> /dev/null; then
    electron electron-simple.js
else
    echo "Electron bulunamadı. Lütfen önce Node.js ve Electron'u yükleyin:"
    echo "npm install -g electron"
    echo "Veya tarayıcıda build/index.html dosyasını açın"
    
    # Tarayıcıda aç
    if command -v xdg-open &> /dev/null; then
        xdg-open build/index.html
    elif command -v open &> /dev/null; then
        open build/index.html
    else
        echo "build/index.html dosyasını tarayıcınızda açın"
    fi
fi
EOF

# Windows batch dosyası
cat > $PORTABLE_DIR/start.bat << 'EOF'
@echo off
echo Servis Bakim Formu baslatiliyor...
if exist "%ProgramFiles%\nodejs\node.exe" (
    "%ProgramFiles%\nodejs\node.exe" "%~dp0electron-simple.js"
) else (
    echo Node.js bulunamadi. Tarayicida aciliyor...
    start build\index.html
)
pause
EOF

# Çalıştırma izni ver
chmod +x $PORTABLE_DIR/start.sh

# README dosyası oluştur
cat > $PORTABLE_DIR/README.md << 'EOF'
# Servis Bakım Formu - Masaüstü Uygulaması

## Kurulum & Çalıştırma

### Linux/Mac:
```bash
./start.sh
```

### Windows:
```
start.bat
```

### Manuel (Herhangi bir tarayıcıda):
```
build/index.html dosyasını açın
```

## Özellikler:
- ✅ Offline çalışır
- ✅ PDF oluşturma
- ✅ Yazdırma
- ✅ Yerel veri saklama
- ✅ Çoklu form yönetimi

## Sistem Gereksinimleri:
- Herhangi bir modern tarayıcı
- Electron için: Node.js (opsiyonel)

## Kullanım:
1. Formu doldurun
2. "Kaydet" butonu ile kaydedin
3. "PDF İndir" ile PDF oluşturun
4. "Yazdır" ile yazdırın
EOF

# Arşiv oluştur
echo "📦 Portable arşiv oluşturuluyor..."
tar -czf ServisBakimFormu-Portable.tar.gz $PORTABLE_DIR/

# Sonuç
echo "✅ Kurulum tamamlandı!"
echo ""
echo "📁 Portable klasör: $PORTABLE_DIR/"
echo "📦 Arşiv dosyası: ServisBakimFormu-Portable.tar.gz"
echo ""
echo "🚀 Kullanım:"
echo "1. Arşivi çıkartın"
echo "2. Linux/Mac: ./start.sh"
echo "3. Windows: start.bat"
echo "4. Veya build/index.html'i tarayıcıda açın"
echo ""
echo "💡 Bu dosyalar herhangi bir bilgisayarda çalışır!"