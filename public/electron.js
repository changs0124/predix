import { app } from "electron";
import { createSplashWindow } from "../electron/windows/createSplashWindow.js";
import { createMainWindow } from "../electron/windows/createMainWindow.js";
import { registerCsvIpc } from "../electron/ipc/csvHandlers.js";
import { registerServerIpc } from "../electron/ipc/serverHandlers.js";
import { registerDialogIpc } from "../electron/ipc/dialogHandlers.js";
import { registerStlIpc } from "../electron/ipc/stlHandlers.js";
import { startCsvWatcher } from "../electron/services/csvWatcher.js";

let mainWindow = null;
let splashWindow = null;

const onReady = () => {
    splashWindow = createSplashWindow();
    mainWindow = createMainWindow({
        onReadyToShow: () => {
            if (splashWindow) { splashWindow.destroy(); splashWindow = null; }
            mainWindow.show();
        },
    });

    // IPC 라우팅
    const { getCsvPath } = startCsvWatcher(mainWindow);
    registerCsvIpc({ getCsvPath, mainWindow });
    registerServerIpc(mainWindow);
    registerDialogIpc(mainWindow);
    registerStlIpc(mainWindow);
};

app.whenReady().then(onReady);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});