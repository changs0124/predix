import { css } from "@emotion/react";

export const layout = css`
    box-sizing: border-box;
    width: 100%;
    flex-grow: 1;
    overflow: auto;

    ::-webkit-scrollbar {
        display: none;
    }
`;

export const tableStyle = css`
    border-collapse: collapse;
    width: 100%;
    font-size: 15px;
    font-weight: 500;
    
    th, td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: center;
    }

    thead tr th {
      background-color: #f2f4f7;
      font-size: auto;
      font-weight: 600;
    }

    tbody tr th {
      background-color: #f2f4f7;
      font-size: 18px;
      font-weight: 600;
    }

    input {
      padding: 0;
      width: 100%;
      font-size: 18px;
      font-weight: 600;
      text-align: end;
      cursor: pointer;
    }
`;

export const cusTr = (idx, len) => css`
  background-color: ${idx === len ? '#eeeeee' : 'transparent'};
`;