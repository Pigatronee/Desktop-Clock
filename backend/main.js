const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require("fs");

const STATE_PATH = path.join(app.getPath("userData"), "window-state.json");

function loadWindowState() {
  try {
    const data = fs.readFileSync(STATE_PATH);
    return JSON.parse(data);
  } catch {
    return { x: undefined, y: undefined };
  }
}

function saveWindowState(window) {
  if (!window) return;
  const bounds = window.getBounds();
  fs.writeFileSync(STATE_PATH, JSON.stringify({
    x: bounds.x,
    y: bounds.y
  }));
}

let win;

function createWindow () {
  const state = loadWindowState();

  win = new BrowserWindow({
    width: 1000,
    height: 300,
    x: state.x,
    y: state.y,
    transparent: true,
    frame: false,
    titleBarStyle: 'hidden',
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  win.loadFile('index.html');

  // Initially: click-through and non-focusable
  win.setFocusable(false);

  win.setAlwaysOnTop(false);

  win.on('move', () => saveWindowState(win));
  win.on('close', () => saveWindowState(win));

  // When window loses focus, return to click-through
  win.on('blur', () => {
    win.setIgnoreMouseEvents(true, { forward: true });
    win.setFocusable(false);
  });
}

// IPC handlers to toggle interaction
ipcMain.on('clock:enableInteraction', () => {
  if (win) {
    win.setIgnoreMouseEvents(false);  // receive mouse events to drag
    win.setFocusable(true);            // allow focus for dragging
    win.focus();
  }
});

ipcMain.on('clock:resetInteraction', () => {
  if (win) {
    win.setIgnoreMouseEvents(true, { forward: true }); // back to click-through
    win.setFocusable(false);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
