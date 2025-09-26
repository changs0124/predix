import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10%;
    cursor: pointer;

    & > svg {
        color: #333333;
        font-size: 80px;
    }

    :hover {
        & > svg {
            color: #EF5B25;
        }
    }
`;