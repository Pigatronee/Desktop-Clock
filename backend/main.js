const path = require("path");
const { app, ipcMain, BrowserWindow} = require("electron");


const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

function createMainWindow(){
  const mainWindow = new BrowserWindow({
    title: "Piga desktop widget manager!",
    width: isDev ? 1000 : 500,
    height: 600,
  });

  // open devtools if in dev environment

  if (isDev) {
   mainWindow.webContents.openDevTools(); 
  };

  mainWindow.loadFile(path.join(__dirname, "../frontend/index.html"));
}

app.whenReady().then(() => {
  createMainWindow()

  // Make sure there's a window
  app.on("activate", () => {
    createMainWindow()
  });
});

// if OS is a mac, then term the app if all windows are closed
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit()
  }
});

// Handle IPC from manager to spawn a widget
ipcMain.on("spawn-widget", (event, { type, x, y }) => {
  const widgetPath = {
    "dateAndTime": path.join(__dirname, "../frontend/widgets/dateAndTime.html"),
    // Add more widget mappings here
  }[type];

  if (!widgetPath) return;

  const widgetWindow = new BrowserWindow({
    width: 300,
    height: 150,
    x: x - 150, // center under mouse
    y: y - 75,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    }
  });

  widgetWindow.loadFile(widgetPath);
});
