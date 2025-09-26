import { css } from "@emotion/react";

export const layout = (value, tabId) => css`
    box-sizing: border-box;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid ${value === tabId ? '#EF5B25' : '#dbdbdb'};
    border-radius: 15px;
    width: 100%;
    min-height: 90px;
    background-color: ${value === tabId ? '#EF5B25' : 'transparent'};
    cursor: pointer;

    & > p {
        box-sizing: border-box;
        display: flex;
        color:  ${value === tabId ? "#ffffff" : '#666666'};
        font-size: 23px;
        font-weight: 600;
        cursor: pointer;
    }

    :hover {
        border: 2px solid ${value !== tabId ? '#EF5B25' : 'transparent'};

        & > p {
            color: ${value !== tabId ? '#EF5B25' : '#ffffff'};
        }
    }
`;

export const deleteBox = (value, tabId) => css`
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    right: 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
    height: fit-content;

    :hover {
        & > svg {
            color: ${value !== tabId ? '#EF5B25' : '#666666'};
        }   
    }

    & > svg {
        color: ${value === tabId ? "#ffffff" : '#666666'};
        font-size: 35px;
    }
`;