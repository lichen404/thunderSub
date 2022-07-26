import { IpcRenderer } from "electron";


export {};

declare global {
    interface Window {
        electron: {
            ipcRenderer:IpcRenderer,
            onResponse:(channel:any, listener:any)=>void;
        };
    }
}
