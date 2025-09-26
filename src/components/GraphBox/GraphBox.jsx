/** @jsxImportSource @emotion/react */
import * as s from './style';
import Plot from 'react-plotly.js';
import { useRecoilValue } from 'recoil';
import { serverIdAtom, tabIdAtom } from '../../atoms/tabAtoms';
import { useGraphPlotData } from '../../hooks/useGraphPlotData';

function GraphBox({ graphInfo }) {
    const tabId = useRecoilValue(tabIdAtom);
    const serverId = useRecoilValue(serverIdAtom(tabId));

    const { data: plotData, layout: plotLayout } = useGraphPlotData({ graphInfo });

    return (
        <div css={s.layout(serverId)}>
            <p css={s.titleBox}>DATA GRAPH</p>
            <div css={s.container}>
                {
                    !!graphInfo &&
                    <Plot

                        data={plotData}
                        layout={plotLayout}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ responsive: false }}
                    />
                }
            </div>
        </div>
    );
}

export default GraphBox;