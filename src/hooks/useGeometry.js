import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from "react";
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

// filePath > ArrayBuffer > STL 파싱 > bbox/sphere 계산 > centerOffset 반환.
// 언마운트/경로 변경 시 이전 geometry dispose.
export const useStlGeometry = (filePath) => {
    const [geometry, setGeometry] = useState(null);
    const [centerOffset, setCenterOffset] = useState(() => new THREE.Vector3());
    const prevGeoRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!filePath) { setGeometry(null); return; }

            const exists = await window.electronAPI.checkFileExists(filePath);
            if (!exists?.success || !exists?.exists) {
                if (!cancelled) setGeometry(null);
                return;
            }

            const fileBuffer = await window.electronAPI.renderStl(filePath);
            const ab = fileBuffer instanceof ArrayBuffer ? fileBuffer : new Uint8Array(fileBuffer).buffer;

            const loader = new STLLoader();
            const geo = loader.parse(ab);
            geo.computeBoundingBox();
            geo.computeBoundingSphere();

            const c = geo.boundingBox?.getCenter(new THREE.Vector3()) ?? new THREE.Vector3();

            if (!cancelled) {
                // 이전 지오메트리 정리
                if (prevGeoRef.current && prevGeoRef.current !== geo) {
                    prevGeoRef.current.dispose?.();
                }
                prevGeoRef.current = geo;

                setCenterOffset(c);
                setGeometry(geo);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [filePath]);

    // 안전: bbox clone
    const bbox = useMemo(() => {
        if (!geometry) return null;
        if (!geometry.boundingBox) geometry.computeBoundingBox();

        return geometry.boundingBox?.clone() ?? null;
    }, [geometry]);

    // 언마운트 시 메모리 정리
    useEffect(() => {
        return () => {
            if (prevGeoRef.current) prevGeoRef.current.dispose?.();
            prevGeoRef.current = null;
        };
    }, []);

    return { geometry, centerOffset, bbox };
}