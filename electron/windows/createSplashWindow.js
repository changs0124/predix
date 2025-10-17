import { BrowserWindow, app } from "electron";
import path from "path";

const isDev = !app.isPackaged;

export const createSplashWindow = () => {
    const splash = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const splashURL = isDev
        ? "http://localhost:3000/splash.html"
        : `file://${path.join(app.getAppPath(), "build/splash.html")}`;

    splash.loadURL(splashURL).catch(console.error);
    return splash;
};