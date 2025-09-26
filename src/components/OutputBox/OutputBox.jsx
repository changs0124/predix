/** @jsxImportSource @emotion/react */
import * as s from './style';
import OutputTableBox from '../tableBox/OutputTableBox/OutputTableBox';
import { IoMdDownload } from "react-icons/io";
import { useRecoilValue } from 'recoil';
import { outPutDatasAtom } from '../../atoms/dataAtoms';
import { tabIdAtom } from '../../atoms/tabAtoms';

function OutputBox({ info }) {
    const tabId = useRecoilValue(tabIdAtom);
    const outputDatas = useRecoilValue(outPutDatasAtom(tabId));
   
    const handleSaveCSVOnClick = async () => {
        const res = await window.electronAPI.saveCSV(outputDatas);
        if (res.success) {
            await window.electronAPI.showAlert(`Save completed: ${res.filePath}`);
        } else {
            await window.electronAPI.showAlert(res.error);
        }
    }

    return (
        <div css={s.layout}>
            <div css={s.titleBox}>
                <p>DATA TABLE</p>
                <div css={s.iconBox} onClick={handleSaveCSVOnClick}><IoMdDownload /></div>
            </div>
            <OutputTableBox tableHeader={info?.data?.tableHeader} outputDatas={outputDatas} />
        </div>
    );
}

export default OutputBox;