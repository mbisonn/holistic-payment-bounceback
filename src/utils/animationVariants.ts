
import { Variants } from 'framer-motion';

export const createAnimationVariant = (config: any): Variants => {
  return config as Variants;
};

export const cardVariants: Variants = createAnimationVariant({
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
});

export const itemVariants: Variants = createAnimationVariant({
  hidden: { y: 60, opacity: 0, scale: 0.8 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
      duration: 0.8
    }
  }
});

export const floatingVariants: Variants = createAnimationVariant({
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
});

export const fadeInVariants: Variants = createAnimationVariant({
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
});
