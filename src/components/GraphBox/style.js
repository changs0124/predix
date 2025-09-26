import { css } from "@emotion/react";

export const layout = (serverId) => css`
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 3px solid #dbdbdb;
    border-radius: 15px;
    padding: 10px;
    width: ${!!serverId && serverId === 1 ? '64.5' : '100'}%;
    height: 100%;
`;

export const titleBox = css`
    box-sizing: border-box;
    display: flex;
    border-bottom: 2px solid #dbdbdb;
    padding-left: 10px;
    padding-bottom: 5px;
    width: 100%;
    height: 10%;
    color: #333333;
    font-size: 20px;
    font-weight: 600;
`;

export const container = css`
    box-sizing: border-box;
    display: flex;
    width: 100%;
    height: 90%;
`;