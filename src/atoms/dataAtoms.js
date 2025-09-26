import { atomFamily } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

// ROM & PINN - inputData
export const inputDataAtom = atomFamily({
    key: 'inputDataAtom',
    default: {},
    effects_UNSTABLE: [persistAtom]
});

// ROM - inputDatas(DB에서 가지고 온 데이터 리스트)
export const inputDatasAtom = atomFamily({
    key: 'inputDatasAtom',
    default: [],
    effects_UNSTABLE: [persistAtom]
});

// ROM, ROM & PINN - outputDatas
export const outPutDatasAtom = atomFamily({
    key: 'outPutDatasAtom',
    default: [],
    effects_UNSTABLE: [persistAtom]
});

// .exe의 id, port
export const serverInfoAtom = atomFamily({
    key: 'serverInfoAtom',
    default: {
        id: '',
        port: 0
    },
    effects_UNSTABLE: [persistAtom]
});

// stlLoader - 선택한 .stl 파일의 객체를 담을 배열
export const stlListAtom = atomFamily({
    key: 'stlListAtom',
    default: [],
    effects_UNSTABLE: [persistAtom]
});

// 탭별 현재 csv 지문
export const csvSigAtom = atomFamily({
  key: 'csvSigAtom',
  default: '',
  effects_UNSTABLE: [persistAtom]
});