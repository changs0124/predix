import { dialog, ipcMain } from "electron";
import path from "path";
import fs from "fs";

export const registerStlIpc = (mainWindow) => {
    // .stl 파일명 / 파일 경로 리턴
    ipcMain.handle("select-stl", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            filters: [{ name: "STL Files", extensions: ["stl"] }],
            properties: ["openFile"]
        });

        if (canceled || filePaths.length === 0) return { success: false, error: "File selection cancelled" };

        const filePath = filePaths[0];
        const fileName = path.basename(filePath);

        return { success: true, fileName, filePath };
    });

    // .stl 렌더링
    ipcMain.handle("render-stl", async (event, filePath) => {
        try {
            const fileBuffer = fs.readFileSync(filePath);
            return fileBuffer;
        } catch (e) {
            return { success: false, error: e.message };
        }
    });

    // 파일 존재 여부 확인
    ipcMain.handle("check-file-exists", async (event, filePath) => {
        const exists = fs.existsSync(filePath);
        if (exists) {
            return { success: true, exists };
        } else {
            return { success: false, error: "The file does not exist." };
        }
    });
}