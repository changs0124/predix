import { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { serverIdAtom, tabIdAtom } from "../atoms/tabAtoms";
import { csvSigAtom, inputDatasAtom, outPutDatasAtom } from "../atoms/dataAtoms";
import { inputStatusAtom } from "../atoms/statusAtoms";

const MAX_BACKOFF = 5000;
const IDLE_BASE = 1000; // 줄이 없을 때 기본 대기 시간
const THROTTLE_MS = 3000;

export const useCsvProcess = ({ processTemp }) => {
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));
    
    const [inputDatas, setInputDatas] = useRecoilState(inputDatasAtom(tabId));
    const [inputStatus, setInputStatus] = useRecoilState(inputStatusAtom(tabId));
    const [csvSig, setCsvSig] = useRecoilState(csvSigAtom(tabId));

    const setOutputDatas = useSetRecoilState(outPutDatasAtom(tabId));

    const mountedRef = useRef(false);
    const hasInitRef = useRef(false);
    const timerRef = useRef(null);
    const loopingRef = useRef(false);
    const loopFnRef = useRef(null); // loop 함수 본체를 담아둘 ref (Effect A에서 정의 > Effect B에서 깨움)
    const inputStatusRef = useRef(false);

    useEffect(() => {
        inputStatusRef.current = inputStatus;
    }, [inputStatus]);

    useEffect(() => {
        if (serverId !== 1) return;

        // 상태 초기화
        mountedRef.current = true;
        hasInitRef.current = false;
        loopingRef.current = false;
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }

        let backoff = 1000; // 처리할 줄이 없을 때 재시도 대기 시간

        // loop 함수 정의 (행 단위로 CSV 읽기)
        loopFnRef.current = async () => {
            if (!mountedRef.current || !hasInitRef.current) return; // 준비 안 됐으면 중단
            if (loopingRef.current) return; // 이미 돌고 있으면 중복 방지
            loopingRef.current = true;

            try {
                // 멈춤이면 스케줄 없이 즉시 중단 (Effect B가 재시작 때 깨움)
                if (!inputStatusRef.current) return;

                // 한 루프에 "1줄"만 처리
                const res = await window.electronAPI.csvNext();
                if (!mountedRef.current) return;

                if (res?.success && !res.done) {
                    await processTemp.mutateAsync(res.row);
                    if (!inputStatusRef.current || !mountedRef.current) return;
                    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
                    timerRef.current = setTimeout(loopFnRef.current, THROTTLE_MS);
                } else {
                    if (!inputStatusRef.current) return;
                    backoff = Math.min(Math.floor(backoff * 1.5) || IDLE_BASE, MAX_BACKOFF);
                    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
                    timerRef.current = setTimeout(loopFnRef.current, backoff);
                }
            } catch (e) {
                console.error("[renderer] loop error:", e);
                if (inputStatusRef.current) {
                    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
                    timerRef.current = setTimeout(loopFnRef.current, 1000);
                }
            } finally {
                loopingRef.current = false; // 루프 끝나면 락 해제
            }
        };

        // 파일 상태 이벤트 핸들러 (파일 변경되면 즉시 loop 실행)
        const onStatus = (payload) => {
            if (!mountedRef.current) return;
            if (payload?.status === "changed" || payload?.status === "ready") {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
                if (!inputStatusRef.current || !hasInitRef.current) return;
                loopFnRef.current?.();
            }
        };

        // 초기화 시도
        (async () => {
            try {
                const res = await window.electronAPI.csvInit();
                if (!mountedRef.current) return;

                const sig = res?.sig || "";
                if (sig && csvSig && sig === csvSig) {
                    // 같은 CSV 파일이면 지금까지 읽은 줄까지 점프
                    await window.electronAPI.csvSeek(inputDatas.length);

                } else if (sig && sig !== csvSig) {
                    setCsvSig(sig);
                    setInputDatas([]);
                    setOutputDatas([]);
                    // 다른 CSV 파일이면 초기화
                    await window.electronAPI.csvSeek(0);

                } else {
                    // sig가 없거나 불명확하면 > 기존 데이터 유지
                    await window.electronAPI.csvSeek(inputDatas.length);
                }

                hasInitRef.current = true; // 초기화 완료 플래그
                window.electronAPI?.onCsvFileStatus?.(onStatus);

                // 초기화 직후: inputStatus가 true라면 즉시 루프 시작
                if (inputStatusRef.current) loopFnRef.current?.();
            } catch (e) {
                console.warn("[renderer] csvInit 실패:", e);
                hasInitRef.current = true; // 실패해도 루프 자체는 돌 수 있게
                window.electronAPI?.onCsvFileStatus?.(onStatus);
                if (inputStatusRef.current) loopFnRef.current?.();
            }
        })();

        // 클린업
        return () => {
            mountedRef.current = false;
            if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
            window.electronAPI?.offCsvFileStatus?.(onStatus); // csvReset()은 여기서 호출하지 않음 > 시그니처 mismatch 방지
        };
    }, [serverId, tabId]);

    useEffect(() => {
        if (serverId !== 1) return;
        if (!mountedRef.current || !hasInitRef.current) return;

        if (!inputStatus) {
            // 멈출 때 > 타이머 정지 (loopFn 자체는 그대로 유지)
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        // 다시 시작할 때 > 루프를 즉시 깨워서 소비 재개
        loopFnRef.current?.();
    }, [inputStatus, serverId]);
}