import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    border: 3px solid #dbdbdb;
    border-radius: 15px;
    padding: 10px;
    height: 100%;
`;

export const titleBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #dbdbdb;
    padding-left: 10px;
    padding-bottom: 5px;
    width: 100%;
    min-height: 10%;

    & > p {
        color: #333333;
        font-size: 20px;
        font-weight: 600;
    }
`;

export const iconBox = css`
    box-sizing: border-box;
    display: flex;
    align-items: center;
    width: fit-content;
    cursor: pointer;

    & > svg {
        color: #666666;
        font-size: 30px;

        :hover {
            color: #EF5B25;
        }
    }
`;