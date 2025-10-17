import { ipcMain, dialog } from "electron";
import path from "path";
import { isRunning, startExe } from "../services/processManager.js";

const getPortAndIdByExeKey = (exeName, exeList) => {
    const temp = exeList.find(c => c.key === exeName);
    return temp ? { port: temp.port, id: temp.id } : null;
}

export const registerServerIpc = (mainWindow) => {
    ipcMain.handle("select-and-start-server", async (event, exeList) => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: "Please select the .exe file",
            filters: [{ name: "Executable", extensions: ["exe"] }],
            properties: ["openFile"],
        });
        if (canceled || !filePaths.length) return { success: false, error: "File selection cancelled" };

        const exePath = filePaths[0];
        const fileName = path.basename(exePath);

        const serverInfo = getPortAndIdByExeKey(fileName, exeList);
        if (!serverInfo) return { success: false, error: `This file is not allowed: ${fileName}` };

        if (isRunning(exePath)) return { success: false, error: "The server is already running.", fileName, ...serverInfo };

        try {
            startExe(exePath);
            return { success: true, fileName, exePath, ...serverInfo };
        } catch (e) {
            return { success: false, error: e.message, fileName };
        }
    });
}