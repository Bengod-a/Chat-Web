'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import StarField from './randomInSphere'; 

type i = {
    count:number
    radius:number
    color:string
    size:number
}

export default function Animation() {
  const starFields = [
    { count: 1000, radius: 0.88, color: "#ffffff", size: 0.004 }, 
    { count: 500, radius: 0.7, color: "#8ab4f8", size: 0.003 },   
    { count: 300, radius: 0.6, color: "#c1d1f0", size: 0.002 }   
  ];

  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          {starFields.map((field:i, index) => (
            <StarField 
              key={index} 
              count={field.count} 
              radius={field.radius} 
              color={field.color}
              size={field.size}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}