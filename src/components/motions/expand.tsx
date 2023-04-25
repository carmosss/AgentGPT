import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

interface MotionProps extends PropsWithChildren {
  className?: string;
  delay?: number;
  type?: "spring" | "tween";
}

const Expand = (props: MotionProps) => (
  <motion.div
    initial={{ scaleX: 0.2, scaleY: 0 }}
    animate={{ scaleX: 0.9, scaleY: 0.9 }}
    transition={{
      duration: 1.75,
      type: props.type ?? "spring",
      delay: props.delay ?? 0,
    }}
    {...props}
  >
    {props.children}
  </motion.div>
);

Expand.displayName = "Expand";
export default Expand;
