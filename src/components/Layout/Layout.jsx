/** @jsxImportSource @emotion/react */
import * as s from './style';

function Layout({children}) {
    return (
        <div css={s.layout}>
            {children}
        </div>
    );
}

export default Layout;