import { useMemo } from "react";
import { LINE_COLORS_CONSTANTS } from "../constants/colorConstants";
import { useRecoilValue } from "recoil";
import { tabIdAtom } from "../atoms/tabAtoms";
import { outPutDatasAtom } from "../atoms/dataAtoms";

export const useGraphPlotData = ({ graphInfo }) => {
    const tabId = useRecoilValue(tabIdAtom);
    const outputDatas = useRecoilValue(outPutDatasAtom(tabId));

    return useMemo(() => {
        // 데이터가 없으면 빈 그래프 리턴
        if (!Array.isArray(outputDatas) || outputDatas.length === 0) {
            return { data: [], layout: {} };
        }

        // 1) 라인별 key 목록 추출
        //   - 첫 행의 프로퍼티들 중 {data: ...} 형태만 선택
        const firstRow = outputDatas[0] ?? {};
        const dataKeys = Object.keys(firstRow).filter((k) => {
            const v = firstRow[k];
            return v && typeof v === "object" && "data" in v;
        });

        // 2) X축: 행 개수만큼 1..N 시퀀스
        const xValues = outputDatas.map((_, i) => i + 1);

        // 3) traces 생성 + y 최대값 추적
        let maxY = 0;
        const traces = dataKeys.map((keyName, idx) => {
            const y = outputDatas.map((row) => {
                const v = row?.[keyName]?.data;
                if (typeof v === "number") {
                    if (v > maxY) maxY = v;
                    return v;
                }
                // Plotly에서 결측은 null 권장
                return null;
            });

            const color = LINE_COLORS_CONSTANTS[idx % LINE_COLORS_CONSTANTS.length];

            return {
                x: xValues,
                y,
                type: "scatter",
                mode: "lines+markers",
                marker: { color, size: 8 },
                line: { color, width: 3 },
                name: keyName,
            };
        });

        // 4) y축 상한(여유 10%)
        const yAxisMax = maxY > 0 ? maxY * 1.1 : 1;

        // 5) 레이아웃 구성
        const layout = {
            title: graphInfo?.title,
            xaxis: {
                title: graphInfo?.xTitle,
                showspikes: true,
                spikemode: "across",
                spikesnap: "data",
                showline: true,
                showgrid: true,
            },
            yaxis: {
                title: graphInfo?.yTitle,
                range: [0, yAxisMax],
            },
            hovermode: "x unified",
            showlegend: true,
            legend: { x: 1.02, xanchor: "left", y: 1 },
        };

        return { data: traces, layout };
    }, [outputDatas, graphInfo?.title, graphInfo?.xTitle, graphInfo?.yTitle]);
}