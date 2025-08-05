const path = require("path");
const { app, ipcMain, BrowserWindow} = require("electron");
const fs = require("fs");
const { finished } = require("stream");
const { error } = require("console");
const { errorMonitor } = require("events");
 

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
    clockWindow.on("close", () => {
      // get window position when closing
      const windowPosition = clockWindow.getPosition()

      console.log("Position of the window was: ", windowPosition)

      // save window position data as a string
      const JSONWindowPosData = JSON.stringify(windowPosition)
      ////saveData(JSONWindowPosData);

    })
  };
// widget handling
ipcMain.on("spawn-widget", (event, {type}) => {
  if (type === "dateAndTime") {
    createClockWindow()
  }
});

// Save data function
const saveData = (saveFile) => {
  const finished = (error) =>{
    if (error){
      console.error("New error found: ", error)
      return;
    }
  }
  fs.writeFile(path.join(__dirname, "/backend/window-state.json", saveFile, finished))
  console.log("POO POO POO",JSON.stringify(saveFile, undefined, 4))
};

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

