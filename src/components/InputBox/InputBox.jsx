/** @jsxImportSource @emotion/react */
import * as s from './style';
import InputTableBox from '../tableBox/InputTableBox/InputTableBox';
import { BlockMath } from 'react-katex';
import { IoIosFolder } from "react-icons/io";
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { serverIdAtom, tabIdAtom } from '../../atoms/tabAtoms';
import { disabledAtom, inputStatusAtom } from '../../atoms/statusAtoms';
import { useEffect } from 'react';
import { useProcessMutation } from '../../hooks/useProcessMutation';
import { useCsvProcess } from '../../hooks/useCsvProcess';

function InputBox({ info }) {
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));

    const [inputStatus, setInputStatus] = useRecoilState(inputStatusAtom(tabId));
    const setDisabled = useSetRecoilState(disabledAtom);

    const { processTemp, handleSelectServerOnClick } = useProcessMutation({ info, setInputStatus })
    useCsvProcess({ processTemp })

    useEffect(() => {
        if(inputStatus) {
            setDisabled(true);
            return;
        }

        setDisabled(false);
    }, [inputStatus])

    const handleSetInputStatusOnClick = () => {
        setInputStatus(!inputStatus);
    }

    return (
        <div css={s.layout}>
            <div css={s.titleBox}>
                <p>{!!serverId && serverId === 1 ? 'ROM SERVER' : 'ROM & PINN SERVER'}</p>
                <div css={s.iconBox} onClick={handleSelectServerOnClick}><IoIosFolder /></div>
            </div>
            {
                serverId === 1 &&
                <div css={s.exeBox}>
                    <p>{info?.isSuccess ? info?.data?.equation : 'Please Select the .exe'}</p>
                    {
                        info?.isSuccess &&
                        <div css={s.buttonBox}>
                            <button onClick={handleSetInputStatusOnClick}>{inputStatus ? 'Stop Processing' : 'Get Data And Start Processing'}</button>
                        </div>
                    }
                </div>
            }
            {
                serverId === 2 &&
                <div css={s.katexBox}>
                    <BlockMath math={info?.isSuccess ? info?.data?.recursiveEquation : 'Server\\ \\ Not \\ \\ Found'} />
                </div>
            }
            <InputTableBox parameter={info?.data?.parameter} />
        </div >
    );
}

export default InputBox;