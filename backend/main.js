const path = require("path");
const { app, ipcMain, BrowserWindow} = require("electron");
const fs = require("fs");
const SaveFileLocation = path.join(__dirname, "../backend/window-state.json")

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let WidgetsInUse = {
  "clock": false
}

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
  const windowPos = getWidgetPosition("clock", [100, 100]);
  const clockWindow = new BrowserWindow({
    
      width: 1000,
      height: 300,
      x: windowPos[0],
      y: windowPos[1],
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

    clockWindow.on("close", () => {
      // get window position when closing
      const windowPosition = clockWindow.getPosition()
      // save window position data as a string
      saveWidgetPosition("clock", windowPosition);
      saveWidgetState("clock", true);
      // Save that this window has been closed
      saveWidgetState("clock", false);
    })
  };

// widget handling
ipcMain.on("spawn-widget", (event, {type}) => {
  if (type === "dateAndTime") {
    createClockWindow();
  }
});

const loadData = () => {
  try {
    console.log("Loading data from", SaveFileLocation);
    const data = fs.readFileSync(SaveFileLocation, "utf8");
    console.log("Loaded data:", data);
    return JSON.parse(data);
  } catch (error) {
    console.log("Load error or file not found:", error.message);
    return {};
  }
};

const saveData = (position) => {
  try {
    console.log("Saving data to", SaveFileLocation);
    fs.writeFileSync(SaveFileLocation, JSON.stringify(position));
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

const saveWidgetPosition = (widgetName, position) =>{
  const alldata = loadData();
  alldata[widgetName] = position;
  saveData(alldata);
};

const saveWidgetState = (widgetName, state) => {
  const alldata = loadData();
  alldata[widgetName] = {
    ...alldata[widgetName],
    inuse: state
  };
  saveData(alldata);
}

const getWidgetPosition = (widgetname, defaultPosition = [0,0]) => {
  const alldata = loadData();
  return alldata[widgetname] || defaultPosition;
}

const isWidgetInUse = (widgetName) => {
  const alldata = loadData();
  return alldata[widgetName]?.inuse === true;
}

app.whenReady().then(() => {
  createMainWindow()

  // Make sure there's a window
  app.on("activate", () => {
    createMainWindow()
  });

  // Load the widgets that have previously been turned on:
  if (isWidgetInUse("clock")) {
    createClockWindow();
  }

});

// if OS is a mac, then term the app if all windows are closed
app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit()
  }
});

