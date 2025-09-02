export const animationConfig = () => {
  return {
    duration: 1,
    ease: "none",
  };
};

export const morphTarget = (target) => {
  if (target === "로켓") {
    return {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
    };
  }
  if (target === "벛꽃") {
    return {
      0: 1,
      1: 0,
      2: 0,
      3: 0,
    };
  }
  if (target === "사람") {
    return {
      0: 0,
      1: 1,
      2: 0,
      3: 0,
    };
  }
  if (target === "행성") {
    return {
      0: 0,
      1: 0,
      2: 1,
      3: 0,
    };
  }
  if (target === "수화기") {
    return {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
    };
  }
};
