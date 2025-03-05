export const pageTransition = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -25 },
  transition: { duration: 0.4, ease: "easeOut" }
};

export const cardHover = {
  scale: 1.03,
  y: -8,
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
  transition: { duration: 0.3, ease: "easeOut" }
};

export const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
};

export const itemAnimation = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.6, 0.01, -0.05, 0.95] }
};

export const staggerContainer = (staggerChildren: number, delayChildren: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const scrollAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
};

export const staggeredContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.25, delayChildren: 0.2 },
  },
};

export const cardAnimation = {
  hover: { 
    scale: 1.04, 
    y: -8,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

export const buttonHover = {
  scale: 1.05,
  y: -5,
  transition: { 
    duration: 0.3, 
    ease: "easeOut" 
  }
};

export const logoAnimation = {
  initial: { rotate: -10, scale: 0.9 },
  animate: { 
    rotate: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10
    }
  },
  whileHover: { 
    rotate: 5, 
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6 }
};

export const slideFromRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export const slideFromLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export const pulse = {
  scale: [1, 1.05, 1],
  transition: { 
    duration: 1.5, 
    ease: "easeInOut", 
    times: [0, 0.5, 1],
    repeat: Infinity,
    repeatDelay: 0.5
  }
};

export const shimmer = {
  initial: { 
    backgroundPosition: "-500px 0" 
  },
  animate: { 
    backgroundPosition: "500px 0",
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "linear"
    }
  }
};