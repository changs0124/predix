import { css } from "@emotion/react";

export const infoBox = (data, max) => css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    padding: 5px 10px;
    background-color: #000000b2;

    & > p {
        box-sizing: border-box;
        display: flex;
        color: ${data > max ? '#EF5B25' : '#ffffff'};
        font-size: 18px;
        font-weight: 500;
        white-space: nowrap;
    }
`;