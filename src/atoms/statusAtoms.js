import { atom, atomFamily } from "recoil";

// tab 생성을 위한 tabModal의 Status
export const tabStatusAtom = atom({
    key: "tabStatusAtom",
    default: false
});

// DB에서 input데이터 요청을 위한 Status
export const inputStatusAtom = atomFamily({
    key: "inputStatusAtom",
    default: false
});

// inputStatus가 true인 경우 탭 이동 및 생성 방지를 위한 상태
export const disabledAtom = atom({
  key: "disabledAtom",
  default: false,
});