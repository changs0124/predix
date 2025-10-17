import fs from "fs";
import { ipcMain } from "electron";
import { readCsvAllWithHeader, tailReadNewBytes, readCsvAll } from "../services/csvTailer.js";
import { getState, resetCsvRows, shiftQueue } from "../services/csvStore.js";

/** 렌더러에서 호출하는 CSV 관련 IPC 핸들러들을 등록
 * - csv:init  : CSV 전체 로드 + tail 상태 세팅 + 파일 지문(sig) 반환
 * - csv:seek  : 이미 소비한 행 개수만큼 "파일 전체 rows" 인덱스를 앞으로 점프
 * - csv:next  : 다음 행 하나를 돌려준다(먼저 파일 rows, 다 쓰면 tail 큐)
 * - csv:reset : 파일 전체를 다시 읽어 rows 캐시를 리셋(index=0)
*/
export function registerCsvIpc({ getCsvPath, mainWindow }) {
    /** CSV 초기화
     * - 파일이 없다면 에러 반환
     * - 파일 전체를 파싱(rows, fileds) > 메모리 캐시에 저장(csvState.rows, index=0)
     * - tail(증분 읽기) 기준점을 파일 끝으로 이동(offset=파일 크기, carry="")
     * - 헤더도 tail.header에 세팅해서 append 라인 매핑 준비
     * - 파일 지문(sig) 생성: 경로/사이즈/mtime/헤더 조합 > 동일 CSV 판단 용도
    */
    ipcMain.handle("csv:init", async () => {
        const csvPath = getCsvPath();
        if (!fs.existsSync(csvPath)) return { success: false, error: "File not found" };

        // CSV 전체 파싱 (rows = [{헤더:값}, ...], fields = ["col1", "col2", ...])
        const { rows, fields } = readCsvAllWithHeader({ csvPath });

        // 메모리 캐시 초기화: rows 세팅 + index=0
        resetCsvRows(rows);

        let stat;
        try {
            // 현재 파일 상태 조회(사이즈/mtime)
            stat = fs.statSync(csvPath);

            // tail 상태 초기화: 다음부터는 "append분"만 tail
            const s = getState();
            s.tail.offset = stat.size; // init 시점 이후 추가분만 읽기 시작
            s.lastMtimeMs = stat.mtimeMs;
            s.tail.carry = ""; // 미완성 라인 버퍼 초기화
            s.tail.header = fields; // append 라인 매핑용 헤더 보관
        } catch {
            // stat 실패해도 rows/fields는 설정된 상태 > 아래 sig는 안전하게 널가드
        }

        // 동일 CSV 판단을 위한 지문(signature)
        const sig =
            `${csvPath}|size:${stat?.size ?? 0}|mtime:${stat?.mtimeMs ?? 0}|header:${(fields ?? []).join(",")}`;

        return { success: true, total: rows.length, header: fields, sig };
    });

    /** CSV 인덱스 점프(파일 전체 rows 기준) 
     * - 이미 소비한 행 개수만큼 앞으로 건너뜀
     * - ex) 렌더러가 inputDatas.length = 123 > csv:seek(123) 호출
     * - tail 큐에는 영향 X (파일 rows만 조정)
    */
    ipcMain.handle("csv:seek", async (_e, index) => {
        const s = getState();
        
        // 안전 범위로 클램프: 0 <= n <= rows.length
        const n = Math.max(0, Math.min(Number(index) || 0, s.csvState.rows.length));
        s.csvState.index = n;
        return { success: true, index: n, total: s.csvState.rows.length };
    });

    /** 다음 행 하나 소비
     * - 파일 전체 rows에서 아직 안 쓴 부분(csvState.index < rows.Length)
     * - 다 썼으면 tailReadNewBytes()로 새 바이트를 읽어 큐 채우기 > queue에서 한 건 pop
     * - 더 이상 줄이 없으면 done: true
     * - missing: true는 파일 자체가 없을 때
    */
    ipcMain.handle("csv:next", async () => {
        const csvPath = getCsvPath();
        if (!fs.existsSync(csvPath)) return { success: true, done: true, missing: true };
        const s = getState();

        // 1) 파일 전체 rows에서 아직 남은 게 있으면 그걸 먼저 준다.
        if (s.csvState.index < s.csvState.rows.length) {
            const row = s.csvState.rows[s.csvState.index];
            const current = s.csvState.index++;
            return { success: true, done: false, index: current, row, source: "file" };
        }

        // 2) 다 소비했으면 tail에서 새로 추가된 바이트를 읽어서 큐를 채운다.
        tailReadNewBytes({ csvPath, mainWindow });

        // 3) 큐에 데이터가 있으면 한 건 꺼내서 반환
        const q = shiftQueue();
        if (q) {
            return { success: true, done: false, row: q, source: "tail" };
        };

        // 4) 파일 rows도 다 쓰고, tail 큐에도 없으면 EOF
        return { success: true, done: true };
    });

    /** CSV 리셋
     * - 파일 전체를 다시 읽어서 rows 캐시를 교체하고 index = 0으로 초기화
     * - (tail.offset 등은 건드리지 않음: 필요 시 csv:init 호출이 더 적절함)
    */
    ipcMain.handle("csv:reset", async () => {
        const csvPath = getCsvPath();
        if (!fs.existsSync(csvPath)) {
            return { success: false, error: "File not found" };
        }
        const rows = readCsvAll({ csvPath });
        resetCsvRows(rows);
        return { success: true };
    });
}
