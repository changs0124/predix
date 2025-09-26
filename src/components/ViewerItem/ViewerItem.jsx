/** @jsxImportSource @emotion/react */
import * as s from './style';
import { Html } from "@react-three/drei";
import { useRef, useMemo } from "react";
import { useStlGeometry } from '../../hooks/useGeometry';
import { useHoverCursor } from '../../hooks/useHovercursor';
import { labelPosFromBboxTop } from '../../utils/three';
import { fragmentShader, vertexShader } from '../../shaders/temperaturePhong';
import { useTempShaderUniforms } from '../../hooks/useTempShaderUniforms';

function ViewerItem({ filePath, data, min, max, scale = 0.5 }) {
    const meshRef = useRef(null);

    const uniforms = useTempShaderUniforms({ data, min, max });
    const { hovered, onPointerOver, onPointerOut } = useHoverCursor();
    const { geometry, centerOffset, bbox } = useStlGeometry(filePath);

    const position = useMemo(
        () => ([
            -centerOffset.x * scale,
            -centerOffset.y * scale,
            -centerOffset.z * scale,
        ]),
        [centerOffset, scale]
    );

    const labelPos = useMemo(
        () => labelPosFromBboxTop(bbox, scale),
        [bbox, scale]
    );

    const showTooltip = hovered && Number.isFinite(data); // 0도도 표시되도록 수정

    // 로딩 전에는 렌더하지 않음
    if (!geometry) return null;

    return (
        <mesh
            ref={meshRef}
            geometry={geometry}
            position={position}
            scale={[scale, scale, scale]}
            onPointerOver={onPointerOver}
            onPointerOut={onPointerOut}
        >
            <shaderMaterial
                attach="material"
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
            />
            {
                showTooltip &&
                <Html position={labelPos} center>
                    <div css={s.infoBox(data, max)}><p>Temp: {data}°C</p></div>
                </Html>
            }
        </mesh>
    );
}

export default ViewerItem;