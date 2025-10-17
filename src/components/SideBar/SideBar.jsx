/** @jsxImportSource @emotion/react */
import * as s from "./style";
import TabBox from "../TabBox/TabBox";
import { IoIosAdd } from "react-icons/io";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { tabsAtom } from "../../atoms/tabAtoms";
import { disabledAtom, tabStatusAtom } from "../../atoms/statusAtoms";
import { toast } from "react-toastify";

function SideBar() {
    const tabs = useRecoilValue(tabsAtom);
    const disabled = useRecoilValue(disabledAtom);
    const setTabStatus = useSetRecoilState(tabStatusAtom);

    const handleAddTabOnClick = () => {
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
        setTabStatus(true);
    }

    return (
        <div css={s.layout}>
            <div css={s.addBox} onClick={handleAddTabOnClick}>
                <IoIosAdd />
            </div>
            <div css={s.container}>
                {
                    !!tabs?.length && tabs?.map(tab => (
                        <TabBox key={tab?.id} tab={tab} />
                    ))
                }
            </div>
        </div>
    );
}

export default SideBar;