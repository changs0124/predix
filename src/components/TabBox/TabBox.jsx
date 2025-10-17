/** @jsxImportSource @emotion/react */
import * as s from "./style";
import { useRecoilCallback, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { IoIosClose } from "react-icons/io";
import { inputDataAtom, inputDatasAtom, outPutDatasAtom, serverInfoAtom } from "../../atoms/dataAtoms";
import { serverIdAtom, tabIdAtom, tabsAtom } from "../../atoms/tabAtoms";
import { disabledAtom, inputStatusAtom, tabStatusAtom } from "../../atoms/statusAtoms";
import { toast } from "react-toastify";

function TabBox({ tab }) {
    const [tabId, setTabId] = useRecoilState(tabIdAtom);
    const disabled = useRecoilValue(disabledAtom);
    const setTabStatus = useSetRecoilState(tabStatusAtom);

    const handleSelectTabOnClick = (data) => {
        if (disabled) {
            toast.warning("데이터 처리 중에는 탭 이동이 불가능합니다.",
                {
                    position: "bottom-right", // 알림 위치 (선택 사항)
                    autoClose: 3000, // 3초 후 자동 닫힘 (선택 사항)
                    hideProgressBar: false, // 진행 바 표시 여부 (선택 사항)
                    closeOnClick: true, // 클릭 시 닫힘 여부 (선택 사항)
                    pauseOnHover: true, // 호버 시 일시 정지 여부 (선택 사항)
                    draggable: true, // 드래그 가능 여부 (선택 사항)
                    progress: undefined, // 커스텀 진행 바 (선택 사항)
                }
            )
            return;
        }
        setTabId(data?.id);
    }

    const handleDeleteTabOnClick = useRecoilCallback(({ set, reset }) => (data) => {
        if (disabled) {
            toast.warning("데이터 처리 중에는 탭 이동이 불가능합니다.",
                {
                    position: "bottom-right", // 알림 위치 (선택 사항)
                    autoClose: 3000, // 3초 후 자동 닫힘 (선택 사항)
                    hideProgressBar: false, // 진행 바 표시 여부 (선택 사항)
                    closeOnClick: true, // 클릭 시 닫힘 여부 (선택 사항)
                    pauseOnHover: true, // 호버 시 일시 정지 여부 (선택 사항)
                    draggable: true, // 드래그 가능 여부 (선택 사항)
                    progress: undefined, // 커스텀 진행 바 (선택 사항)
                }
            )
            return;
        }
        reset(inputDataAtom(data?.id));
        reset(inputDatasAtom(data?.id));
        reset(outPutDatasAtom(data?.id));
        reset(serverInfoAtom(data?.id));
        reset(inputStatusAtom(data?.id));
        reset(serverIdAtom(data?.id));

        set(tabsAtom, prev => {
            const tempTabs = prev.filter(tab => tab?.id !== data?.id);

            if (data?.id === tabId) {
                if (tempTabs?.length > 0) {
                    setTabId(tempTabs[tempTabs?.length - 1].id);
                } else {
                    setTabStatus(true);
                }
            }

            return tempTabs;
        });
    });

    return (
        <div css={s.layout(tab?.id, tabId)} onClick={() => handleSelectTabOnClick(tab)}>
            <div
                css={s.deleteBox(tab?.id, tabId)}
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTabOnClick(tab);
                }}
            >
                <IoIosClose />
            </div>
            <p>{tab?.title}</p>
        </div>
    );
}

export default TabBox;
