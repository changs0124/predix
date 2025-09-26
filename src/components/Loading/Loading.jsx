/** @jsxImportSource @emotion/react */
import * as s from './style';
import { ClipLoader } from 'react-spinners';

function Loading() {
    return (
        <div css={s.layout}>
            <div css={s.container}>
                <div css={s.loaderBox}>
                    <ClipLoader
                        cssOverride={{
                            marginBottom: "10px"    

                        }}
                        color='#EF5B25'
                        size={100}
                        aria-label='Loading...'
                    />
                    <p>Loading...</p>
                </div>
            </div> 
        </div>
    );
}

export default Loading;