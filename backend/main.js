const path = require("path");
const { app, ipcMain, BrowserWindow} = require("electron");


const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

function createMainWindow(){
  const mainWindow = new BrowserWindow({
    title: "Piga desktop widget manager!",
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      }
    });
  // open devtools if in dev environment

  if (isDev) {
   mainWindow.webContents.openDevTools(); 
  };

  mainWindow.loadFile(path.join(__dirname, "../frontend/index.html"));
};

function createClockWindow(){
  const clockWindow = new BrowserWindow({
      width: 1000,
      height: 300,
      transparent: true,
       frame: false,
       titleBarStyle: 'hidden',
       alwaysOnTop: false,
       resizable: false,
       hasShadow: false,
       skipTaskbar: true,
       webPreferences: {
         contextIsolation: true,
         nodeIntegration: false,
         enableRemoteModule: false
       }

  });
    clockWindow.loadFile(path.join(__dirname, "../frontend/Widgets/dateAndTime.html")); //dateAndTime
    console.log("Attenmpting to create window from html file")


};

// widget handling
ipcMain.on("spawn-widget", (event, {type}) => {
  if (type === "dateAndTime") {
    createClockWindow()
  }
})


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

