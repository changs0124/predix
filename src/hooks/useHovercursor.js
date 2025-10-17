import { useState } from "react";

export const useHoverCursor = () => {
    const [hovered, setHovered] = useState(false);

    const onPointerOver = () => {
        document.body.style.cursor = "pointer";
        setHovered(true);
    };
    
    const onPointerOut = () => {
        document.body.style.cursor = "default";
        setHovered(false);
    };

    return { hovered, onPointerOver, onPointerOut };
}