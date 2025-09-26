import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    display: flex;
    width: 100%;
    overflow: auto;

    ::-webkit-scrollbar {
        display: none;
    }
`;

export const tableStyle = css`
    width: 100%;
    border-collapse: collapse;
    font-size: 15px;
    font-weight: 500;

    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: center;
    }

    thead tr {
      background-color: #f2f4f7;
      font-weight: 600;
    }
`;

export const cusTr = (idx, len) => css`
  background-color: ${idx === len ? '#eeeeee' : 'transparent'};
`;

export const cusTd = (data, max) => css`
  color: ${(data > max) ? '#EF5B25' : '#000000'}
`;