import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(10px);
    z-index: 999;
`;

export const container = css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 2px solid #dbdbdb;
    border-radius: 15px;
    width: 50%;
    height: 30%;
    background-color: #ffffff;
`;

export const titleBox = css`
    box-sizing: border-box;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 2px solid #dbdbdb;
    padding: 10px;
    width: 100%;
    height: 20%;

    & > p {
        color: #333333;
        font-size: 20px;
        font-weight: 600;
    }
`;

export const svgBox = css`
    box-sizing: border-box;
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    height: 100%;
    cursor: pointer;

    & > svg {
        color: #666666;
        font-size: 45px;
    }

    :hover {
        & > svg {
            color: #EF5B25;
        }
    }
`;

export const selectBox = css`
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
    width: 100%;
`;

export const selectItem = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #dbdbdb;
    border-radius: 15px;
    width: 40%;
    height: 80%;
    color: #666666;
    font-size: 23px;
    font-weight: 600;
    cursor: pointer;

    :hover {
        border: 2px solid #EF5B25;
        color: #EF5B25;
    }
`;