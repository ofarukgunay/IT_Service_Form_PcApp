const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Preload dosyasını burada tanımla
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, "images", "logo.png"), // App iconu
    title: "Servis Bakım Formu - Kartepe Belediyesi",
    show: false, // Pencere yüklenmeden gösterme
  });

  const startUrl = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "index.html")}`; // build klasörü production'da asar kökünde

  mainWindow.loadURL(startUrl);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Menü tanımı
  const template = [
    {
      label: "Dosya",
      submenu: [
        {
          label: "Yeni Form",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow.webContents.send("menu-new-form");
          },
        },
        {
          label: "Kaydet",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            mainWindow.webContents.send("menu-save-form");
          },
        },
        {
          label: "PDF Dışa Aktar",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            mainWindow.webContents.send("menu-export-pdf");
          },
        },
        {
          label: "Yazdır",
          accelerator: "CmdOrCtrl+P",
          click: () => {
            mainWindow.webContents.send("trigger-print");
          },
        },
        { type: "separator" },
        {
          label: "Çıkış",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Görünüm",
      submenu: [
        { role: "reload", label: "Yenile" },
        { role: "toggleDevTools", label: "Geliştirici Araçları" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Tam Ekran" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
