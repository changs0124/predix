import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    position: relative;
    display: flex;
    flex-direction: column;
    margin-right: 10px;
    border-radius: 15px;
    padding: 10px;
    min-width: 10%;
    background-color: #ffffff;
`;

export const addBox = css`
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    border: 2px solid #dbdbdb;
    border-radius: 15px;
    width: 100%;
    min-height: 90px;
    cursor: pointer;

    & > svg {
        color: #666666;
        font-size: 70px;
    }

    :hover {
        border: 2px solid #EF5B25;

        & > svg {
            color: #EF5B25;
        }
    }
`;

export const container = css`
    box-sizing: border-box;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    overflow-y: auto;

    ::-webkit-scrollbar {
        display: none;
    }

    & > :not(:nth-last-of-type(1)) {
        margin-bottom: 10px;
    }
`;