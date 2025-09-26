import * as THREE from 'three';
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { clamp01, mapRange01 } from '../utils/temperature';

export const useTempShaderUniforms = ({ data, min, max, lightPosition = [10, 10, 10] }) => {
    const { camera } = useThree();
    const targetMixRef = useRef(0);
    const isDataAvailableRef = useRef(false);

    // 유니폼 객체는 한 번만 생성
    const uniformsRef = useRef({
        uColorCold: { value: new THREE.Color(0x0000ff) },
        uColorHot: { value: new THREE.Color(0xff0000) },
        uColorMixFactor: { value: 0.0 },
        uIsDataAvailable: { value: false },
        uLightPosition: { value: new THREE.Vector3(10, 10, 10) },
        uCameraPosition: { value: new THREE.Vector3() },
    });

    // lightPosition 변경 시 값만 갱신 (배열 의존성 안전하게 처리)
    useEffect(() => {
        const lp = lightPosition ?? [10, 10, 10];
        uniformsRef.current.uLightPosition.value.set(lp[0], lp[1], lp[2]);
    }, [
        lightPosition?.[0],
        lightPosition?.[1],
        lightPosition?.[2],
    ]);

    // 데이터 → 타겟 믹스 설정
    useEffect(() => {
        const ok = Number.isFinite(data) && Number.isFinite(min) && Number.isFinite(max);
        isDataAvailableRef.current = ok;
        if (ok) {
            const mix = (min === max) ? 0.5 : mapRange01(data, min, max);
            targetMixRef.current = clamp01(mix);
        } else {
            targetMixRef.current = 0.0;
        }
    }, [data, min, max]);

    // 프레임마다 유니폼 값만 업데이트
    useFrame(() => {
        const u = uniformsRef.current;
        u.uIsDataAvailable.value = isDataAvailableRef.current;
        if (isDataAvailableRef.current) {
            u.uColorMixFactor.value = THREE.MathUtils.lerp(
                u.uColorMixFactor.value,
                targetMixRef.current,
                0.03
            );
        }
        u.uCameraPosition.value.copy(camera.position);
    });

    return uniformsRef.current;
};