import { css } from "@emotion/react";

export const reset = css`
    html, body, #root {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: transparent;
    }
    
    h1, h2, h3, ul, p {
        margin: 0;
        padding: 0;
        cursor: default;
    }

    td, th {
        padding: 0;
    }

    input {
        border: none;
        outline: none;
    }

    button {
        justify-content: center;
        align-items: center;
        border: none;
        padding: 5px 10px;
        color: #000000;
        background-color: transparent;
        outline: none;
        font-weight: 500;
        cursor: pointer;
    }

    button:active {
        color: #eeeeee;
        background-color: #808080;
    }

    button:disabled {
        color: #eeeeee;
        background-color: #808080;
        cursor: default;
    }
`;