import { spawn } from 'child_process';
import path from 'path';

const serverProcesses = {}; // exePath > child

export const isRunning = (exePath) => {
    const cp = serverProcesses[exePath];
    return cp && !cp.killed;
}

export const startExe = (exePath) => {
    const cp = spawn(exePath, [], {
        cwd: path.dirname(exePath),
        detached: true,
        stdio: 'ignore',
        windowsHide: true,
    });
    cp.unref();
    cp.on('exit', () => { delete serverProcesses[exePath]; });
    serverProcesses[exePath] = cp;
    return cp;
}
