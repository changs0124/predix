/** @jsxImportSource @emotion/react */
import { useEffect, useRef } from 'react';
import * as s from './style';
import { useRecoilState, useRecoilValue } from 'recoil';
import { serverIdAtom, tabIdAtom } from '../../../atoms/tabAtoms';
import { inputDataAtom, inputDatasAtom } from '../../../atoms/dataAtoms';

function InputTableBox({ parameter }) {
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));
    const inputDatas = useRecoilValue(inputDatasAtom(tabId));

    const [inputData, setInputData] = useRecoilState(inputDataAtom(tabId));

    const latestRowRef = useRef(null);

    useEffect(() => {
        if (!!inputDatas?.length && latestRowRef.current) {
            // 최신 행으로 부드럽게 스크롤 이동
            latestRowRef.current.scrollIntoView({
                behavior: 'smooth', // 부드러운 스크롤 효과
                block: 'end'        // 뷰포트의 아래쪽에 맞춤
            });
        }
    }, [inputDatas]);

    const handleInputDataOnChange = (e) => {
        setInputData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    }

    return (
        <div css={s.layout}>
            {
                serverId === 1 &&
                <table css={s.tableStyle}>
                    <thead>
                        <tr>
                            {
                                parameter?.map((param, idx) => (
                                    <th key={idx}>{param?.name}</th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            inputDatas?.map((data, idx) => (
                                <tr key={idx}
                                    ref={idx === inputDatas?.length - 1 ? latestRowRef : null}
                                    css={s.cusTr(idx, inputDatas?.length - 1)}

                                >
                                    {
                                        parameter?.map((param, idx) => (
                                            <td key={idx}>{data[param?.key]}</td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
            {
                serverId === 2 &&
                <table css={s.tableStyle}>
                    <tbody>
                        {
                            parameter?.map((param, idx) => (
                                <tr key={idx}>
                                    <th>{param?.name}</th>
                                    <td><input name={param?.key} type='text' value={inputData[param?.key]} onChange={handleInputDataOnChange} autoFocus={true} /></td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
        </div>
    );
}

export default InputTableBox;