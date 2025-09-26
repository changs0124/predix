// 안전한 브릿지: 렌더러에 필요한 것만 노출
const { contextBridge, ipcRenderer } = require('electron');

// 이벤트 off가 제대로 되도록 콜백 ↔︎ 래퍼 매핑 유지
const _csvStatusListeners = new Map();

contextBridge.exposeInMainWorld('electronAPI', {
    // 파일/다이얼로그/서버
    saveCSV: (data) => ipcRenderer.invoke('save-csv', data),
    selectServer: (exeList) => ipcRenderer.invoke('select-and-start-server', exeList),

    // STL 선택/렌더
    selectStl: async () => await ipcRenderer.invoke("select-stl"),
    renderStl: async (filePath) => await ipcRenderer.invoke("render-stl", filePath),

    // 공통 유틸
    showAlert: (message) => ipcRenderer.invoke('showAlert', message),
    checkFileExists: async (filePath) => await ipcRenderer.invoke('check-file-exists', filePath),

    // CSV pull API
    csvInit: () => ipcRenderer.invoke('csv:init'),
    csvSeek: (index) => ipcRenderer.invoke('csv:seek', index),
    csvNext: () => ipcRenderer.invoke('csv:next'),
    csvReset: () => ipcRenderer.invoke('csv:reset'),

    // CSV 상태 알림 (메모리 릭 방지용 on/off)
    onCsvFileStatus: (cb) => {
        if (typeof cb !== 'function') return;
        const wrapped = (_e, data) => cb(data);
        _csvStatusListeners.set(cb, wrapped);
        ipcRenderer.on('csv:file-status', wrapped);
    },
    offCsvFileStatus: (cb) => {
        const wrapped = _csvStatusListeners.get(cb);
        if (wrapped) {
            ipcRenderer.removeListener('csv:file-status', wrapped);
            _csvStatusListeners.delete(cb);
        }
    }
});

// 탭/리로드 시 리스너 정리 (방어)
window.addEventListener('unload', () => {
    for (const wrapped of _csvStatusListeners.values()) {
        ipcRenderer.removeListener('csv:file-status', wrapped);
    }
    _csvStatusListeners.clear();
});
