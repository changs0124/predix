/** @jsxImportSource @emotion/react */
import * as s from './style';
import { useMutation } from '@tanstack/react-query';
import { exeInstance } from '../../apis/instance';
import { IoIosArrowForward } from "react-icons/io";
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { serverIdAtom, tabIdAtom } from '../../atoms/tabAtoms';
import { inputDataAtom, outPutDatasAtom, serverInfoAtom } from '../../atoms/dataAtoms';

function SvgBox() {
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));
    const serverInfo = useRecoilValue(serverInfoAtom(tabId));
    const inputData = useRecoilValue(inputDataAtom(tabId));

    const setOutputDatas = useSetRecoilState(outPutDatasAtom(tabId));
    
    const processSOC = useMutation({
        mutationFn: async (data) => await exeInstance(serverInfo?.port).post('/process', data),
        onSuccess: async (res) => {
            setOutputDatas(prev => [...prev, res?.data]);
            await window.electronAPI.showAlert('Prediction success');
        },
        onError: async (err) => {
            await window.electronAPI.showAlert(`Prediction failed: ${err?.message || 'Unknown error'}`);
        }
    });

    return (
        <div css={s.layout} onClick={serverId === 2 ? () => processSOC.mutateAsync(inputData).catch(() => { }) : () => { }}>
            <IoIosArrowForward />
        </div>
    );
}

export default SvgBox;