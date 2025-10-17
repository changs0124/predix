/** @jsxImportSource @emotion/react */
import { useRecoilCallback, useSetRecoilState } from "recoil";
import * as s from "./style";
import { IoIosClose } from "react-icons/io";
import { serverIdAtom, tabIdAtom, tabsAtom } from "../../atoms/tabAtoms";
import { v4 as uuidv4 } from "uuid";
import { tabStatusAtom } from "../../atoms/statusAtoms";

function TabModal() {
    const setTabStatus = useSetRecoilState(tabStatusAtom);

    /** useRecoilCallback
     * - Recoil 상태를 일괄적으로 읽고(set/get/reset), 그 결과를 함수로 만들어서 외부에서 호출할 수 있게 해줌
     * - 한 함수 안에서 여러 atom을 안전하게 조작 가능
     * - const sampleMethod = useRecoilCallback(({set, get, reset}) => (arg1, arg2) => {})
    */
    const handleAddTabOnClick = useRecoilCallback(({ set }) =>
        (serverId) => {
            const id = uuidv4();

            set(tabsAtom, prev => {
                const safePrev = Array.isArray(prev) ? prev : [];

                return [
                    ...safePrev,
                    { id, title: `Tab ${safePrev.length + 1}`, serverId }
                ];
            });
            set(tabIdAtom, id);
            set(serverIdAtom(id), serverId);
            set(tabStatusAtom, false);
        }
    )

    return (
        <div css={s.layout}>
            <div css={s.container}>
                <div css={s.titleBox}>
                    <p>Please click one of the two.</p>
                    <div css={s.svgBox} onClick={() => setTabStatus(false)}>
                        <IoIosClose />
                    </div>
                </div>
                <div css={s.selectBox}>
                    <div css={s.selectItem} onClick={() => handleAddTabOnClick(1)}>ROM</div>
                    <div css={s.selectItem} onClick={() => handleAddTabOnClick(2)}>ROM & PINN</div>
                </div>
            </div>
        </div>
    );
}

export default TabModal;