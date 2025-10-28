import { useMutation } from "@tanstack/react-query";
import { exeInstance } from "../apis/instance";
import { toast } from "react-toastify";
import { ROM_EXE_CONSTANTS, ROM_PINN_EXE_CONSTANTS } from "../constants/ExeConstants";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { serverIdAtom, tabIdAtom } from "../atoms/tabAtoms";
import { inputDatasAtom, outPutDatasAtom, serverInfoAtom } from "../atoms/dataAtoms";

export const useProcessMutation = ({ info, setInputStatus }) => {
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));

    const [serverInfo, setServerInfo] = useRecoilState(serverInfoAtom(tabId));

    const setInputDatas = useSetRecoilState(inputDatasAtom(tabId));
    const setOutputDatas = useSetRecoilState(outPutDatasAtom(tabId));
    
    const processTemp = useMutation({
        mutationFn: async (data) => await exeInstance(serverInfo?.port).post("/process", data),
        onSuccess: async (res, variables) => {
            setInputDatas(prev => [...prev, variables]);
            setOutputDatas(prev => [...prev, res?.data]);
            
            if (res?.data) {
                info?.data?.tableHeader?.forEach(header => {
                    const key = header.replace(/\(.*?\)/g, "").trim();
                    const data = res?.data[key];

                    if (data && data?.data > data?.max) {
                        toast.error(`${header} : ${(data?.data - data?.max)?.toFixed(2)} 초과`,
                            {
                                position: "bottom-right", // 알림 위치 (선택 사항)
                                autoClose: 3000, // 3초 후 자동 닫힘 (선택 사항)
                                hideProgressBar: false, // 진행 바 표시 여부 (선택 사항)
                                closeOnClick: true, // 클릭 시 닫힘 여부 (선택 사항)
                                pauseOnHover: true, // 호버 시 일시 정지 여부 (선택 사항)
                                draggable: true, // 드래그 가능 여부 (선택 사항)
                                progress: undefined, // 커스텀 진행 바 (선택 사항)
                            });
                    }
                })
            };
        },
        onError: async () => {
            setInputStatus(false);
            await window.electronAPI.showAlert("An error occurred while processing data.");
        }
    });

    const processSOC = useMutation({
        mutationFn: (data) => exeInstance(serverInfo?.port).post("/process", data),
        onSuccess: async (res) => {
            setOutputDatas(prev => [...prev, res?.data]);
            await window.electronAPI.showAlert("Prediction success");
        },
        onError: async (err) => {
            await window.electronAPI.showAlert(`Prediction failed: ${err?.message || "Unknown error"}`);
        }
    });

    const handleSelectServerOnClick = async () => {
        if (serverId === 1) {
            const res = await window.electronAPI.selectServer(ROM_EXE_CONSTANTS);
            if (res.success) {
                setInputDatas([]);
                setOutputDatas([]);
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                });
            } else if (res?.error === "The server is already running.") {
                await window.electronAPI.showAlert(res?.error);
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                });
            } else {
                await window.electronAPI.showAlert(`${res?.error}`);
            };
        };

        if (serverId === 2) {
            const res = await window.electronAPI.selectServer(ROM_PINN_EXE_CONSTANTS);
            if (res.success) {
                setInputDatas([]);
                setOutputDatas([]);
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                });
            } else if (res?.error === "The server is already running.") {
                await window.electronAPI.showAlert(res?.error);
                setServerInfo({
                    id: res?.id,
                    port: res?.port
                });
            } else {
                await window.electronAPI.showAlert(`${res?.error}`);
            };
        };
    };

    return { processTemp, processSOC, handleSelectServerOnClick }
};