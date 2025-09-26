/** @jsxImportSource @emotion/react */
import * as s from './style';

function Container({ children }) {
    return (
        <div css={s.layout}>
            {children}
        </div>
    );
}

export default Container;