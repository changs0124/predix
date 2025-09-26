/** CSV 처리용 전역 상태 저장소 (메인 프로세스에서만 사용)
 * - 파일 전체를 한 번 파싱해 둔  rows(csvState.rows)
 * - rows에서 어디까지 소비했는지 나타내는 index(csvState.index)
 * - tail(추가된 바이트만 읽기)용 상태: 파일 오프셋, 라인 carry, 헤더
 * - append된 라인들을객체로 변환해 쌓아두는 queue
 * - 동시에 tail을 두 번 읽지 않기 위한 redding 플래그
 * - 마지막 mtime(ms) 기록(를오버/변경 감지 등 보조용)
 */
const store = {
    // 파일 파싱 결과를 "앞에서부터" 소비하기 위한 캐시
    csvState: {
        index: 0, // 다음에 꺼낼 행의 인덱스 (0부터 시작)
        rows: [] // CSV 전체 파싱 결과(초기 로드/리셋 시 채워짐)
    },

    // tail(증분 읽기) 상태
    tail: {
        offset: 0, // 파일 끝까지 읽어들인 바이트 위치(다음 readStream start 지점)
        carry: '', // 조각난 마지막 줄(개행으로 끝나지 않은 누적 문자열 버퍼)
        header: null // CSV 헤더(append된 라인을 객체로 매핑할 때 사용)
    },

    // tailReadNewBytes()가 만들어낸 "새로운 행"들이 쌓이는 FIFO 큐
    // - 각 원소는 { 헤더키: 값 } 형태의 객체
    queue: [],

    // tailReadNewBytes() 중복 실행 방지 플래그
    // - true면 현재 읽는 중이므로 재진입 방지
    reading: false,

    // 파일의 마지막 수정 시간 기록(ms). 재초기화/롤오버 감지 등에서 보조로 사용 가능
    lastMtimeMs: 0,
};

/** 현재 저장소 객체 참조를 반환
 * - 얕은 복사 X, 실제 store 객체 자체를 넘김(전역 싱글톤)
*/
export const getState = () => store;

/** CSV 전체 파싱 결과를 새로 세팅하고, 소비 인덱스를 0으로 초기화
 * - csv:init, csv:reset 시에 호출됨 
*/
export const resetCsvRows = (rows) => { store.csvState = { index: 0, rows: rows || [] }; };

/** tail에서 새로 들어온 한 줄(객체)을 큐 끝에 추가
 * - ingestCompleteLinesToQueue()에서 호출
*/
export const pushQueue = (obj) => { store.queue.push(obj); };

/** 큐의 맨 앞에서 한 줄(객체)을 꺼내 반환 (없으면 undefined)
 * - csv:next 루틴에서 사용
*/
export const shiftQueue = () => store.queue.shift();