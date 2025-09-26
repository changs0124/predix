import { atom, atomFamily } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

// 각 tab의 고유 ID값을 위한 상태
export const tabIdAtom = atom({
    key: 'tabIdAtom',
    default: '',
    effects_UNSTABLE: [persistAtom]
})

// tabs를 나열하기 위한 상태
export const tabsAtom = atom({
    key: 'tabsAtom',
    default: [],
    effects_UNSTABLE: [persistAtom]
})

// 각 tab의 serverId를 위한 상태
export const serverIdAtom = atomFamily({
    key: 'serverIdAtom',
    default: 0,
    effects_UNSTABLE: [persistAtom]
})

