import {app, BrowserWindow, ipcMain, shell} from 'electron';
import ffmpeg, {ffprobe} from 'fluent-ffmpeg'
import axios from "axios";
import os from 'os';
import path from "path";
import fs from "fs";
import qs from "qs";
import updateElectronApp from 'update-electron-app'

const subPath = `${os.homedir()}/Documents/ThunderSub`


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

updateElectronApp({
    repo: 'lichen404/thunderSub',
    updateInterval: '1 hour',
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require('ffmpeg-static').replace(
    'app.asar',
    'app.asar.unpacked'
);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffprobePath = require('ffprobe-static').path.replace(
    'app.asar',
    'app.asar.unpacked'
)

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

declare const MAIN_WINDOW_WEBPACK_ENTRY: never;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

const instance = axios.create({
    baseURL: 'http://subtitle.kankan.xunlei.com:8000/search.json/',
    timeout: 1000 * 60 * 3
})

let mainWindow: BrowserWindow


const createWindow = (): void => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        frame: false,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            contextIsolation: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    mainWindow.on('unmaximize', () => {

        mainWindow.webContents.send('isMaxWindow', false)
    })

}

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
        const videoPath = process.platform === 'win32' ? payload.videoPath.replace(/\\/g, '/') : payload.videoPath
        ffprobe(videoPath, (error: any, metadata: any) => {
            error ? reject(error) : resolve(metadata.format.duration);
        })
    })

    try {
        const {data} = await instance.get(
            qs.stringify({
                mname: payload.videoName,
                videolength: (parseFloat(videoLength as string) * 1000).toString()
            })
        )
        return data
    } catch (error) {
        console.log(error)
        return Promise.reject(error)
    }


})


ipcMain.handle('download-sub', async (event, {name, url}: { name: string, url: string }) => {
    if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath);
    }
    if (url) {
        const myPath = path.resolve(subPath, name);
        const writer = fs.createWriteStream(myPath);
        const response = await axios.get(url, {
            responseType: 'stream'
        })
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {

            writer.on('finish', () => resolve(myPath))
            writer.on('error', () => reject())

        })

    }
})

ipcMain.handle('open-explore', (event, filePath) => {
    if(fs.existsSync(filePath)){
        shell.showItemInFolder(filePath)
        return true

    }
    return false

})

ipcMain.on('close-window', () => {
    mainWindow.close()
})

ipcMain.on('maximize-window', () => {


    mainWindow.maximize()

})

ipcMain.on('fixed-window', (event, isFixed: boolean) => {
    mainWindow.setAlwaysOnTop(isFixed)
})

ipcMain.on('resize-window', () => {
    mainWindow.restore()
})

ipcMain.on('minimize-window', () => {

    mainWindow.minimize()
})


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
