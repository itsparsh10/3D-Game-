import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { ChoiceGateData } from '../../types/game';

interface ChoiceGateProps {
  id: string;
  position: [number, number, number];
  choiceData?: ChoiceGateData;
}

export const ChoiceGate: React.FC<ChoiceGateProps> = ({
  position,
  choiceData = {
    leftType: 'bonus',
    leftValue: 5,
    leftLabel: '+5 ORBS',
    rightType: 'penalty',
    rightValue: -3,
    rightLabel: '-3 ORBS'
  }
}) => {
  const playerX = useGameStore((state) => state.playerX);
  const playerZ = useGameStore((state) => state.playerZ);
  const passGate = useGameStore((state) => state.passGate);

  const [hasPassed, setHasPassed] = React.useState(false);

  useFrame(() => {
    if (hasPassed) return;

    // When player crosses Z plane of gate
    if (playerZ <= position[2] && playerZ >= position[2] - 1.2) {
      setHasPassed(true);
      if (playerX < 0) {
        // Chose Left
        passGate(choiceData.leftValue, choiceData.leftLabel);
      } else {
        // Chose Right
        passGate(choiceData.rightValue, choiceData.rightLabel);
      }
    }
  });

  return (
    <group position={position}>
      {/* --- LEFT GATE (Green Bonus) --- */}
      <group position={[-1.8, 0, 0]}>
        {/* Arch Frame */}
        <mesh position={[-1.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 3.6, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[1.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 3.6, 16]} />
          <meshStandardMaterial color="#16a34a" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 2.6, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Translucent Glowing Energy Field */}
        <mesh position={[0, 1.8, 0]}>
          <planeGeometry args={[2.2, 3.4]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#15803d"
            emissiveIntensity={0.6}
            transparent
            opacity={0.45}
            roughness={0.1}
          />
        </mesh>

        {/* Banner with 3D Text */}
        <mesh position={[0, 3.0, 0.1]}>
          <boxGeometry args={[2.0, 0.8, 0.15]} />
          <meshStandardMaterial color="#15803d" />
        </mesh>
        <Text
          position={[0, 3.0, 0.22]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {choiceData.leftLabel}
        </Text>
      </group>

      {/* --- RIGHT GATE (Red Penalty) --- */}
      <group position={[1.8, 0, 0]}>
        {/* Arch Frame */}
        <mesh position={[-1.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 3.6, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[1.2, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 3.6, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 2.6, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.3} />
        </mesh>

        {/* Translucent Glowing Energy Field */}
        <mesh position={[0, 1.8, 0]}>
          <planeGeometry args={[2.2, 3.4]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#b91c1c"
            emissiveIntensity={0.6}
            transparent
            opacity={0.45}
            roughness={0.1}
          />
        </mesh>

        {/* Banner with 3D Text */}
        <mesh position={[0, 3.0, 0.1]}>
          <boxGeometry args={[2.0, 0.8, 0.15]} />
          <meshStandardMaterial color="#b91c1c" />
        </mesh>
        <Text
          position={[0, 3.0, 0.22]}
          fontSize={0.4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {choiceData.rightLabel}
        </Text>
      </group>
    </group>
  );
};
