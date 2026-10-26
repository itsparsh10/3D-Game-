import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../../store/gameStore";
import { ChoiceGateData } from "../../types/game";

interface ChoiceGateProps {
  id: string;
  position: [number, number, number];
  choiceData?: ChoiceGateData;
}

function drawGateSign(val: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;

  const isPositive = val >= 0;
  const bg = isPositive ? "#1f9d4a" : "#c0392b";
  const border = isPositive ? "#4ade80" : "#f87171";

  // Rounded banner background
  g.fillStyle = bg;
  g.beginPath();
  g.roundRect(16, 16, 480, 224, 32);
  g.fill();

  g.strokeStyle = border;
  g.lineWidth = 14;
  g.stroke();

  // Draw small orb icon
  g.fillStyle = "#38bdf8";
  g.beginPath();
  g.arc(120, 128, 48, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.arc(106, 114, 16, 0, Math.PI * 2);
  g.fill();

  // Bold Value Text
  g.fillStyle = "#ffffff";
  g.font = "900 120px 'Fredoka', 'Outfit', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  const text = isPositive ? `+${val}` : `${val}`;
  g.fillText(text, 310, 128);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export const ChoiceGate: React.FC<ChoiceGateProps> = ({
  position,
  choiceData = {
    leftType: "bonus",
    leftValue: 5,
    leftLabel: "+5",
    rightType: "penalty",
    rightValue: -3,
    rightLabel: "-3",
  },
}) => {
  const leftValue = choiceData.leftValue;
  const rightValue = choiceData.rightValue;

  const leftSignTex = useMemo(() => drawGateSign(leftValue), [leftValue]);
  const rightSignTex = useMemo(() => drawGateSign(rightValue), [rightValue]);

  const leftColor = leftValue >= 0 ? "#1f9d4a" : "#c0392b";
  const rightColor = rightValue >= 0 ? "#1f9d4a" : "#c0392b";

  return (
    <group position={position}>
      {/* --- LEFT GATE --- */}
      <group position={[-1.9, 0, 0]}>
        {/* Support Pillars */}
        <mesh position={[-1.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 3.6, 16]} />
          <meshStandardMaterial color={leftColor} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[1.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 3.6, 16]} />
          <meshStandardMaterial color={leftColor} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 2.56, 16]} />
          <meshStandardMaterial color={leftColor} roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Translucent Glowing Energy Field */}
        <mesh position={[0, 1.8, 0]}>
          <planeGeometry args={[2.2, 3.4]} />
          <meshStandardMaterial
            color={leftColor}
            emissive={leftColor}
            emissiveIntensity={0.65}
            transparent
            opacity={0.4}
            roughness={0.1}
          />
        </mesh>

        {/* 2D Canvas Sign Board */}
        <mesh position={[0, 2.9, 0.15]}>
          <planeGeometry args={[2.0, 1.0]} />
          <meshBasicMaterial map={leftSignTex} transparent />
        </mesh>
      </group>

      {/* --- RIGHT GATE --- */}
      <group position={[1.9, 0, 0]}>
        {/* Support Pillars */}
        <mesh position={[-1.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 3.6, 16]} />
          <meshStandardMaterial color={rightColor} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[1.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.15, 3.6, 16]} />
          <meshStandardMaterial color={rightColor} roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 2.56, 16]} />
          <meshStandardMaterial color={rightColor} roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Translucent Glowing Energy Field */}
        <mesh position={[0, 1.8, 0]}>
          <planeGeometry args={[2.2, 3.4]} />
          <meshStandardMaterial
            color={rightColor}
            emissive={rightColor}
            emissiveIntensity={0.65}
            transparent
            opacity={0.4}
            roughness={0.1}
          />
        </mesh>

        {/* 2D Canvas Sign Board */}
        <mesh position={[0, 2.9, 0.15]}>
          <planeGeometry args={[2.0, 1.0]} />
          <meshBasicMaterial map={rightSignTex} transparent />
        </mesh>
      </group>
    </group>
  );
};
