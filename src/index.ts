import {app, BrowserWindow, ipcMain} from 'electron';
import {ffprobe} from 'fluent-ffmpeg'
import axios from "axios";

declare const MAIN_WINDOW_WEBPACK_ENTRY: never;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}
const instance = axios.create({
    baseURL: 'http://subtitle.kankan.xunlei.com:8000/search.json',
    timeout: 1000 * 30
})

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


ipcMain.handle('upload-file', async (event, payload) => {
    const videoLength = await new Promise((resolve, reject) => {
        ffprobe(payload.videoPath.replace(/\\/g, '/'), (error: any, metadata: any) => {

            error ? reject(error) : resolve(metadata.format.duration);
        })
    })

    const {data} = await instance.get(
        `/mname=${encodeURI(payload.videoName)}&videolength=${(parseFloat(videoLength as string) * 1000).toString()}`
    )
    return data

})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
