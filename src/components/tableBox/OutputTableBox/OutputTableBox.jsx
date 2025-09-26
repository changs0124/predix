/** @jsxImportSource @emotion/react */
import { useEffect, useRef } from 'react';
import * as s from './style';

function OutputTableBox({ tableHeader, outputDatas }) {
    const latestRowRef = useRef(null);

    useEffect(() => {
        if(!outputDatas.length) return;
        if (!!outputDatas?.length && latestRowRef.current) {
            // 최신 행으로 부드럽게 스크롤 이동
            latestRowRef.current.scrollIntoView({
                behavior: 'smooth', // 부드러운 스크롤 효과
                block: 'end' // 뷰포트의 아래쪽에 맞춤
            });
        }
    }, [outputDatas]);

    return (
        <div css={s.layout}>
            {
                !!outputDatas?.length &&
                <table css={s.tableStyle}>
                    <thead>
                        <tr>
                            {
                                tableHeader?.map((header, idx) => (
                                    <th key={idx}>{header}</th>
                                ))
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            outputDatas?.map((data, idx) => (
                                <tr
                                    key={idx}
                                    ref={idx === outputDatas.length - 1 ? latestRowRef : null}
                                    css={s.cusTr(idx, outputDatas.length - 1)}
                                >
                                    {
                                        tableHeader?.map((header, colIdx) => (
                                            <td key={colIdx} css={s.cusTd(data[header]?.data, data[header]?.max)}>{(data[header]?.data).toFixed(2)}</td>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            }
        </div>
    );
}

export default OutputTableBox;