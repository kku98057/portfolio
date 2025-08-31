import gsap from "gsap";

export const heroIntroAnimaion = () => {
  console.log("시작!");
  const hero = document.querySelector("#hero");

  const heroTl = gsap.timeline();
  heroTl
    .from(hero, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
    })
    .to("#hero_menu li", {
      opacity: 1,
      duration: 0.2,
    })
    .from(
      "#hero_menu li",
      {
        yPercent: -30,
        stagger: 0.2,
      },
      "-<0.5"
    );
};
