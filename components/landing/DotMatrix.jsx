"use client";
import "./DotMatrix.css";
import React, { useMemo } from "react";

import { DottedShader } from "./shaders";

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [97, 218, 251];
};

const DotMatrix = ({
  color = "#61dafb",
  delay = 0,
  speed = 0.01,
  dotSize = 2,
  spacing = 5,
  opacity = 0.85,
}) => {
  const rgbColor = useMemo(() => hexToRgb(color), [color]);

  const shaderCode = useMemo(() => {
    const glslDelay = Number(delay).toFixed(2);
    const glslSpeed = Number(speed).toFixed(2);

    return `
      float intro_offset = distance(u_resolution / 2.0 / u_total_size, st2) * ${glslSpeed} + (random(st2) * 0.15);
      opacity *= step(intro_offset, u_time - ${glslDelay});
      opacity *= clamp((1.0 - step(intro_offset + 0.1, u_time - ${glslDelay})) * 1.25, 1.0, 1.25);
    `;
  }, [delay, speed]);

  const opacityLayers = useMemo(
    () => [
      opacity * 0.4,
      opacity * 0.4,
      opacity * 0.65,
      opacity * 0.65,
      opacity * 0.95,
      opacity,
    ],
    [opacity]
  );

  return (
    <div className="dot-matrix-wrapper">
      <DottedShader
        opacities={opacityLayers}
        colors={[rgbColor]}
        totalSize={spacing}
        dotSize={dotSize}
        center={["x"]}
        shader={shaderCode}
      />
    </div>
  );
};

export default React.memo(DotMatrix);
