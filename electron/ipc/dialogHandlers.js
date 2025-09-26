import { ipcMain, dialog, app } from 'electron';
import fs from 'fs';
import path from 'path';

export function registerDialogIpc(mainWindow) {
    ipcMain.handle('showAlert', async (event, message) => {
        const result = await dialog.showMessageBox(mainWindow, { type: 'info', title: 'Inform', message });
        return result.response;
    });

    ipcMain.handle('check-file-exists', async (event, filePath) => {
        const exists = fs.existsSync(filePath);
        return exists ? { success: true, exists } : { success: false, error: 'The file does not exist.' };
    });

    ipcMain.handle('save-csv', async (event, jsonArray) => {
        if (!Array.isArray(jsonArray) || jsonArray.length === 0)
            return { success: false, error: 'Invalid or empty data' };

        const headers = Object.keys(jsonArray[0]);
        const rows = jsonArray.map(obj => headers.map(k => obj[k]?.data));
        const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.join(',')).join('\n');

        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `${dateStr}.csv`;

        const { canceled, filePath } = await dialog.showSaveDialog({
            title: 'Save CSV file',
            defaultPath: path.join(app.getPath('downloads'), filename),
            filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        });

        if (canceled || !filePath) return { success: false, error: 'File save cancelled' };
        try { fs.writeFileSync(filePath, csvContent, 'utf8'); return { success: true, filePath }; }
        catch (e) { return { success: false, error: e.message }; }
    });
}
