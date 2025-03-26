import { useMemo, useRef } from 'react';
import { PointMaterial, Points } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const randomInSphere = (count: number, radius: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

interface StarFieldProps {
  count: number;
  radius: number;
  color?: string;
  size?: number;
}

export default function StarField({
  count,
  radius,
  color = "#ffffff",
  size = 0.004
}: StarFieldProps) {
  const ref = useRef<THREE.Points>(null);
  const sphere = useMemo(() => randomInSphere(count, radius), [count, radius]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 60;
      ref.current.rotation.y -= delta / 60;
    }
  });

  return (
    <Points ref={ref} positions={sphere} stride={3}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}