/** @jsxImportSource @emotion/react */
import * as s from "./style";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, TransformControls } from "@react-three/drei";
import { useRecoilState, useRecoilValue } from "recoil";
import { outPutDatasAtom, stlListAtom } from "../../atoms/dataAtoms";
import { IoIosFolder } from "react-icons/io";
import { tabIdAtom } from "../../atoms/tabAtoms";
import ViewerItem from "../ViewerItem/ViewerItem";

function ViewerBox({ info }) {
    const orbitRef = useRef(null);
    const tcRef = useRef(null);

    // 선택된 그룹을 TransformControls에 붙이기 위한 레지스트리
    // React + Three.js 환경에서 각 3D 객체를 참조하고 초기 상태를 저장하기 위한 장치
    const itemRefs = useRef({}); // { [id]: THREE.Group }
    // 각 3D 객체의 초기 변환 상태를 저장 > reset하거나 변화를 계산
    const initTransforms = useRef({}); // { [id]: { pos, rot, scale } }
    // 여러 3D 객체를 렌더링 > id별로 ref를 저장하기 위한 커스텀 함수
    const setItemRef = (id) => (node) => {
        if (node) {
            itemRefs.current[id] = node;
            if (!initTransforms.current[id]) {
                initTransforms.current[id] = {
                    pos: node.position.clone(),
                    rot: node.rotation.clone(),
                    scale: node.scale.clone()
                };
            }
        }
    };

    const tabId = useRecoilValue(tabIdAtom);
    const outputDatas = useRecoilValue(outPutDatasAtom(tabId));
    const [stlList, setStlList] = useRecoilState(stlListAtom(tabId));

    const [tcMode, setTcMode] = useState("rotate");   // "translate" | "rotate" | "scale"
    const [selectedId, setSelectedId] = useState(null);

    // TransfromControls(three/examples, gizmo)로 선택된 오브젝트만 조작(연결/해제)
    // 선택이 바뀔 때 컨트롤 attach/detach (다음 프레임 보장)
    useEffect(() => {
        const tc = tcRef.current; // TransformControls 인스턴스
        if (!tc) return;

        let raf;
        const obj = selectedId ? itemRefs.current[selectedId] : null;
        if (obj) {
            raf = requestAnimationFrame(() => { // 상태가 연쇄적으로 바뀔 때 attach 호출 시 오류 발생 방지
                obj.updateWorldMatrix?.(true, true); // 상태가 연쇄적으로 바뀔 때 attach 호출 시 오류 발생 방지
                tc.attach(obj); // 3D 오브젝트에 조작 핸들(gizmo)를 연결
                tc.setMode?.(tcMode); // 모드 세팅 ("translate" | "rotate" | "scale")
            });
        } else {
            tc.detach(); // 3D 오브젝트에 조작 핸들(gizmo)를 해제
        }

        return () => raf && cancelAnimationFrame(raf);
    }, [selectedId, tcMode, stlList]);

    // TransformControls 드래깅 중엔 Orbit 비활성화
    useEffect(() => {
        const tc = tcRef.current;
        if (!tc) return;

        const handler = (e) => {
            if (orbitRef.current) orbitRef.current.enabled = !e.value; // e.value=true → 드래그 중
        };
        tc.addEventListener("dragging-changed", handler);

        return () => tc.removeEventListener("dragging-changed", handler);
    }, []);

    // 파일 선택 > stlList에 filePath만 저장
    const handleSelectStlOnClick = async () => {
        const res = await window.electronAPI.selectStl();
        if (!res?.success) return window.electronAPI.showAlert(res?.error);

        const exists = await window.electronAPI.checkFileExists(res?.filePath);
        if (!exists?.success || !exists?.exists) {
            return window.electronAPI.showAlert(exists?.error || "File not found");
        }

        setStlList(prev => {
            const id = (prev?.length ? Math.max(...prev.map(v => v.id)) + 1 : 1);
            return [...(prev || []), { id, filePath: res.filePath, fileName: res.fileName }];
        });
    };

    // 선택한 3D 오브젝트 초기화
    const handleResetOneOnClick = (id) => {
        const g = itemRefs.current[id];
        const init = initTransforms.current[id];
        if (!g || !init) return;

        g.position.copy(init.pos);
        g.rotation.set(init.rot.x, init.rot.y, init.rot.z);
        g.scale.copy(init.scale);

        // 선택되어 있었으면, 컨트롤도 대상 오브젝트에 계속 붙어있게 유지
        if (selectedId === id && tcRef.current) {
            tcRef.current.attach(g);
        }
    };

    // 전체 초기화(옵션)
    const handleResetAllOnClick = () => {
        Object.keys(itemRefs.current).forEach((id) => handleResetOneOnClick(id));
    };

    // 선택한 3D 오브젝트 삭제
    const handleDeleteOnClick = (id) => {
        // TransformControls가 이 항목을 잡고 있으면 먼저 분리
        if (selectedId === id && tcRef.current) {
            tcRef.current.detach();
            // 선택 해제
            setSelectedId(null);
        }

        // ref/초기값 정리
        delete itemRefs.current[id];
        delete initTransforms.current[id];

        // 리스트에서 제거
        setStlList((prev) => (Array.isArray(prev) ? prev.filter((v) => v.id !== id) : []));
    };

    return (
        <div css={s.layout}>
            <div css={s.titleBox}>
                <p>VIEWER</p>
                <div css={s.iconBox} onClick={handleSelectStlOnClick}><IoIosFolder /></div>
            </div>
            <div css={s.container}>
                {
                    !!stlList?.length &&
                    <>
                        <div css={s.buttonBox}>
                            <button onClick={() => setTcMode("translate")} disabled={tcMode === "translate"}>TRANSLATE</button>
                            <button onClick={() => setTcMode("rotate")} disabled={tcMode === "rotate"}>ROTATE</button>
                            <button onClick={() => setTcMode("scale")} disabled={tcMode === "scale"}>SCALE</button>
                            <button onClick={() => handleResetAllOnClick()}>RESET</button>
                            {
                                selectedId !== null &&
                                <button onClick={() => handleDeleteOnClick(selectedId)}>DELETE</button>
                            }
                        </div>
                        <Canvas camera={{ position: [0, 0, 100], fov: 45 }} shadows style={{ borderEndStartRadius: 5, borderEndEndRadius: 5 }}>
                            <color attach="background" args={["#dbdbdb"]} />
                            <axesHelper args={[50]} />
                            <ambientLight intensity={0.8} />
                            <directionalLight position={[5, 5, 5]} intensity={1} />

                            <Suspense fallback={<Html center><span style={{ color: "#666666" }}>loading...</span></Html>}>
                                {/* 빈 공간 클릭 시 선택 해제 */}
                                <group
                                    position={[0, 0, 0]}
                                    onPointerDown={(e) => {(!e.intersections?.length) && setSelectedId(null);}}
                                >
                                    {
                                        stlList.map((stl, idx) => {
                                            const key = info?.data?.tableHeader[idx]

                                            return (
                                                <group
                                                    key={stl.id}
                                                    ref={setItemRef(stl.id)}
                                                    position={[idx * 12, 0, 0]}
                                                    rotation={[0, 0, 0]}
                                                    onPointerDown={(e) => { e.stopPropagation(); setSelectedId(stl.id); }}
                                                >
                                                    <ViewerItem
                                                        filePath={stl.filePath}
                                                        data={!!outputDatas?.length && parseFloat(outputDatas[outputDatas?.length - 1][key]?.data)}
                                                        min={!!outputDatas?.length && parseFloat(outputDatas[outputDatas?.length - 1][key]?.min)}
                                                        max={!!outputDatas?.length && parseFloat(outputDatas[outputDatas?.length - 1][key]?.max)}
                                                    />
                                                </group>
                                            )

                                        })
                                    }
                                </group>
                            </Suspense>

                            {/* TransformControls: 항상 하나, 루트에 배치, 선택 대상에 attach */}
                            <TransformControls
                                ref={tcRef}
                                space="local"
                                onMouseDown={() => { if (orbitRef.current) orbitRef.current.enabled = false; }}
                                onMouseUp={() => { if (orbitRef.current) orbitRef.current.enabled = true; }}
                            />
                            <OrbitControls ref={orbitRef} />
                        </Canvas>
                    </>
                }
            </div>
        </div>
    );
}

export default ViewerBox;