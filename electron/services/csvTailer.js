import fs from "fs";
import Papa from "papaparse";
import { getState, pushQueue } from "./csvStore.js";

/** CSV 파일을 한 번에 읽어 전부 파싱해서 배열로 반환
 * - return [{헤더: 값}, {헤더: 값}, ...] 형태의 배열.
 * - 에러나 파일 없음 > 빈 배열
 *  */
export const readCsvAll = ({ csvPath }) => {
    try {
        // CSV 파일을 텍스트로 읽기
        const text = fs.readFileSync(csvPath, "utf8");

        // Papa.parse: CSV 파서
        const parsed = Papa.parse(text, {
            header: true, // 첫 줄을 "header"로 사용, 각 행은 {헤더: 값} 객체
            skipEmptyLines: true // 빈 줄을 무시
        });

        // 정상적으로 파싱된 데이터가 배열이면 그대로, 아니면 빈 배열
        return Array.isArray(parsed.data) ? parsed.data : [];
    } catch {
        return [];
    }
}

/** CSV 전체를 읽되 rows와 헤더(fileds)를 함께 반환
 * - meta.fields에 헤더가 없으면 첫 행의 키로 대체
 * - 에러 시 { rows: [], fileds: null } 반환
*/
export const readCsvAllWithHeader = ({ csvPath }) => {
    try {
        const text = fs.readFileSync(csvPath, "utf8");
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

        // 전체 데이터(배열)
        const rows = Array.isArray(parsed.data) ? parsed.data : [];

        /** 헤더 이름들
         * - 일반적으로 parsed.meta.filed에 들어있음
         * - 없으면 rows[0]의 키들을 사용
        */
        const fields = parsed.meta?.fields?.length
            ? parsed.meta.fields
            : (rows[0] ? Object.keys(rows[0]) : null);

        return { rows, fields };
    } catch { return { rows: [], fields: null }; }
}

/** CSV 키(헤더명)를 안전하게 정제(null/undefined > "", 공백 제거)
 * - CSV 헤더가 지저분해도 안전하게 키로 쓰기 위한 보조 함수
*/
const keySafe = (k) => String(k ?? "").trim();

/** 완성된 CSV 라인 문자열 배열(lines)을 파싱해서 queue에 적재
 * - tail.header가 없으면 첫 라인을 헤더로 간주하고 저장
 * - tail.header가 있으면, row 배열을 {헤더: 값} 객체로 매핑 후 pushQueue
 * - 주의: 여기서는 header: false로 파싱(이미 줄 단위로 잘려서 들어옴)
*/
const ingestCompleteLinesToQueue = (lines) => {
    const { tail } = getState();
    if (!lines?.length) return;

    // 안전하게 파싱하려고 마지막에 개행(\n)을 하나 붙임
    const csvText = lines.join("\n") + "\n";
    const parsed = Papa.parse(csvText, { header: false, skipEmptyLines: true });
    if (!parsed?.data?.length) return;

    for (const row of parsed.data) {
        if (!row?.length) continue;

        // 아직 헤더가 없다면, 이 줄을 헤더로 저장하고 다음 줄부터 데이터를 처리
        if (!tail.header) {
            tail.header = row.map(h => String(h).trim());
            continue;
        }

        // 헤더에 맞춰 {헤더:값} 형태의 객체 만들기
        const obj = {};
        for (let i = 0; i < tail.header.length; i++) {
            obj[keySafe(tail.header[i])] = row[i];
        }

        // 새로 들어온 한 줄의 데이터를 큐에 쌓는다.(렌더러가 나중에 꺼내서 처리)
        pushQueue(obj);
    }
}

/** 파일의 "새로 추가된 바이트"만 읽어서 줄 단위로 나눠 큐에 적재
 * - CSV가 계속 뒤에 이어 써질 때, 늘어난 부분만 쁘라게 처리하기 위함
 * - 핵심 상태:
 *  - tail.offset: 이전에 파일을 어디까지 읽었는지(바이트 위치)
 *  - tail.carry: 줄이 "반만" 들어왔을 때 다음 청크와 이어 붙이기 위한 임시 문자열
 *  - tail.header: append된 줄들을 { 헤더: 값 }으로 만들기 위한 헤더
 *  - 읽기 후에는 렌더러에 "changed" 신호를 보내서 새 데이터가 대기 중임을 알림
*/
export const tailReadNewBytes = ({csvPath, mainWindow}) => {
    const st = getState(); // 전역 상태(싱글톤)
    const { tail } = st;

    // 이미 읽는 중이면(중복 호출) 탈출 > 재진입 방지
    if (st.reading) return;

    // 파일 없으면 탈출
    if (!fs.existsSync(csvPath)) return;

    // 현재 파일 크기/mtime 등 정보 얻기
    let stat;
    try {
        stat = fs.statSync(csvPath);
    } catch {
        return;
    }

    // 파일이 더 작아졌다면(롤오버/초기화), 처음부터 다시
    if (stat.size < tail.offset) {
        tail.offset = 0;
        tail.carry = "";
    }

    // 변화가 없으면 탈출
    if (stat.size === tail.offset) return;

    // 이제부터 읽는 중
    st.reading = true;

    // 이전 tail.offset부터 현재 파일 끝까지 읽는 스트림
    const rs = fs.createReadStream(csvPath, {
        start: tail.offset,
        end: stat.size - 1, // end는 포함이기에 > -1
        encoding: "utf8",
        highWaterMark: 64 * 1024 // 한 번에 읽는 청크 크기(지연/자원 타협값)
    });
    // 완성된 줄(트림된 문자열) 모음
    const completed = [];

    rs.on("data", chunk => {
        // 기존 carry(지난번에 끊긴 반쪽 줄) + 새 chunk 합치기
        // CRLF(\r\n)를 LF(\n)로 통일
        const text = (tail.carry + chunk).replace(/\r/g, "");

        // "\n" 기준으로 쭉 자르기
        const parts = text.split("\n");

        // 마지막 조각은 "\n"으로 끝나지 않을 수 있음 > carry에 저장해서 다음 청크와 이어 붙임
        tail.carry = parts.pop() ?? "";

        // 중간에 완성된 라인들만 임시 배열에 모으기(양끝 공백 제거)
        for (const line of parts) {
            const t = line.trim();
            if (t) completed.push(t);
        }
    });

    rs.on("close", () => {
        // 다음 tail은 파일 끝에서 시작
        tail.offset = stat.size;
        st.reading = false;

        // 이번에 완성된 줄들이 있으면 > 헤더/객체로 변환해서 큐에 쌓기
        if (completed.length) {
            ingestCompleteLinesToQueue(completed);

            // 렌더러에 "changed" 알림 > 화면 쪽 루프가 바로 소비할 수 있게 트리거
            mainWindow?.webContents?.send("csv:file-status", { status: "changed" });
        }
    });

    rs.on("error", () => {
        // 에러가 나도 읽는 중 상태를 반드시 해제
        st.reading = false;
    });
}
