import fs from 'fs';
import chokidar from 'chokidar';
import { readCsvAll } from './csvTailer.js';
import { resetCsvRows } from './csvStore.js';
import path from 'path';
import { app } from 'electron';

const PATH_FILE = path.join(app.getPath('userData'), 'path.txt');

const readPathFile = () => {
    try {
        const raw = fs.readFileSync(PATH_FILE, "utf-8");
        const v = raw.trim().replace(/^['"]|['"]$/g, "");
        // 임시 로그
        console.log('[path.txt] value =', JSON.stringify(v));
        return v;
    } catch {
        console.warn('[path.txt] read failed:', e?.message);
        return null;
    }
}

/** CSV 파일의 라이프사이클을 감시, 상태 변화를 렌더러에 브로드캐스트
 * - add: 파일이 생성/등장했을 때, 전체를 파싱해서 메모리 캐시에 적재(csvState.rows) + "ready"알림
 * - change: 파일 내용이 바뀌었을 때, "changed" 알림(실제 tail 읽기는 다른 곳에서 수행)
 * - unlink: 파일이 삭제/이동됐을 때, 캐시를 비우고 "missing" 알림
 * - error: 감시 중 에러 > 렌더러에 "error" 알림
*/
const watchCsv = (csvPath, mainWindow) => {
    // chokidar 감시자 생성
    const watcher = chokidar.watch(csvPath, {
        // 시작 시 파일이 이미 있으면 "add" 이벤트부터 발생시킴
        ignoreInitial: false,
        persistent: true,

        // 풀링 기반 감시: 네트워크 드라이브/권한/가상화 환경에서 안정적
        // (이벤트 기반(usePolling:false)이 더 빠르고 가볍지만, 환경에 따라 선택)
        usePolling: true,
        interval: 3000, // 폴링 주기(ms)

        // 파일이 쓰이는 동안에는 "change" 발행을 잠시 지연
        // 한 번에 라인이 다 써지지 않는 상황에서 "깨진 라인"을 피하려는 목적
        awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 100 },
    });

    // 파일이 생겼을 때: 전체를 한 번 파싱해 메모리 캐시에 넣고, 렌더러에 total 행수와 함께 ready 신호
    watcher.on('add', () => {
        const rows = readCsvAll({ csvPath });
        resetCsvRows(rows);
        mainWindow?.webContents?.send('csv:file-status', { status: 'ready', total: rows.length });
    });

    // 파일 내용 변경: 여기서는 즉시 파싱하지 않고 "바뀌었다" 신호만 보냄
    // (실제 증분 읽기(tail)는 csvTailer의 tailReadNewBytes 쪽 또는 렌더러 루프 트리거에서 수행)
    watcher.on('change', () => {
        mainWindow?.webContents?.send('csv:file-status', { status: 'changed' });
    });

    // 파일 삭제/이동: 메모리 캐시를 비우고 렌더러에 missing 신호
    watcher.on('unlink', () => {
        resetCsvRows([]);
        mainWindow?.webContents?.send('csv:file-status', { status: 'missing' });
    });

    // 감시 중 오류: 에러 메시지와 함께 브로드캐스트
    watcher.on('error', (err) => {
        mainWindow?.webContents?.send('csv:file-status', { status: 'error', message: String(err) });
    });

    // 필요하면 호출자에서 watcher를 더 다루도록 반환
    return watcher;
}


export const startCsvWatcher = (mainWindow) => {
    let currentCsvPath = readPathFile();
    // readPathFile()로 path.txt 내용 읽어옴
    // 유효한 경로가 있다면 watchCsv() 호출해서 감시자 생성 아닌 경우 null
    let csvWatcher = currentCsvPath ? watchCsv(currentCsvPath, mainWindow) : null;

    // path.txt 파일 자체를 감시(메모장 생성 및 변경시 event 발생)
    const pathWatcher = chokidar.watch(PATH_FILE, { ignoreInitial: true });
    const onPathFileUpdate = () => {
        const nextPath = readPathFile();
        if (nextPath && nextPath !== currentCsvPath) {
            csvWatcher?.close();
            csvWatcher = watchCsv(nextPath, mainWindow);
            currentCsvPath = nextPath;
        }
    };

    pathWatcher.on('add', onPathFileUpdate);    // ← 추가
    pathWatcher.on('change', onPathFileUpdate); // 기존

    return { getCsvPath: () => currentCsvPath, pathWatcher, csvWatcher };
}