const path = require("path");
const {app, BrowserWindow} = require("electron");

function createMainWindow(){
  const mainWindow = new BrowserWindow({
    title: "Piga desktop widget manager!",
    width: 500,
    height: 600,
  });

  mainWindow.loadFile(path.join(__dirname, "../frontend/index.html"));
}

app.whenReady().then(() => {
  createMainWindow()
});