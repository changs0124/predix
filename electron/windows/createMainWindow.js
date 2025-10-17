import { BrowserWindow, app } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

export const createMainWindow = ({ onReadyToShow }) => {
    const win = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: false,
        resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "../../preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    const entryURL = isDev
        ? "http://localhost:3000"
        : `file://${path.join(app.getAppPath(), "build/index.html")}`;

    win.loadURL(entryURL).catch(console.error);

    if (onReadyToShow) {
        win.once("ready-to-show", onReadyToShow);
    }

    return win;
};