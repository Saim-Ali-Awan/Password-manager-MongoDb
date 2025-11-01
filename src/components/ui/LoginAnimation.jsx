// src/components/SliderAnimation.jsx
import { useRef, useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import animationData from './slider.json'; // your JSON file

const SliderAnimation = ({
  width = 800,
  height = 500,
  loop = true,
  autoplay = true,
}) => {
  const lottieRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animInstance, setAnimInstance] = useState(null); // <-- store the player instance

  // -------------------------------------------------
  // 1. Save the Lottie player instance when it's ready
  // -------------------------------------------------
  const handleAnimCreated = (anim) => {
    setAnimInstance(anim);
  };

  // -------------------------------------------------
  // 2. Change colors when hover state changes
  // -------------------------------------------------
  useEffect(() => {
    if (!animInstance) return;               // wait until Lottie is ready
    if (!animInstance.animationData) return; // safety

    const color = isHovered ? [1, 1, 1, 1] : [0, 0, 0, 1]; // white / black

    // Walk through every shape → stroke → color keyframe
    animInstance.animationData.layers.forEach((layer) => {
      if (!layer.shapes) return;
      layer.shapes.forEach((shapeGroup) => {
        if (!shapeGroup.it) return;
        shapeGroup.it.forEach((item) => {
          if (item.ty === 'st' && item.c && item.c.k) {
            item.c.k = color; // mutate the color array
          }
        });
      });
    });

    // Force a redraw
    animInstance.resize();
  }, [isHovered, animInstance]);

  // -------------------------------------------------
  // 3. Render
  // -------------------------------------------------
  return (
    <div
      style={{
        width,
        height,
        cursor: 'pointer',
        transition: 'filter 0.2s ease',
        filter: isHovered ? 'brightness(1.3)' : 'brightness(1)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        onLoadedImages={handleAnimCreated}   // <-- this fires when data is ready
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default SliderAnimation;