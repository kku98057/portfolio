import gsap from "gsap";
import { CSSRulePlugin } from "gsap/all";

export const titleAnimation = (className) => {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: className,
        start: "top 60%",
        toggleActions: "play reverse play reverse",
      },
    })
    .from(className, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power4.inOut",
    });
};

export const projectAnimation = (mesh, effect, wrapper) => {
  titleAnimation(".project .title");
  const list = gsap.utils.toArray(".content .project_list > li");
  list.forEach((item) => {
    gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: "top 60%",
        toggleActions: "play reverse play reverse",
      },
    });
  });
};
export const introduceAnimation = (mesh, effect, wrapper) => {
  titleAnimation(".introduce .title");
  const introducetl = gsap.timeline({
    scrollTrigger: {
      trigger: ".intro_section",
      start: "top 60%",

      toggleActions: "play reverse play reverse",
    },
  });

  const skillstl = gsap
    .timeline({
      scrollTrigger: {
        trigger: ".skills_section",
        start: "top 60%",
        toggleActions: "play reverse play reverse",
      },
    })
    .from(".skills_section h3", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power4.inOut",
    })
    .from(
      ".skills_grid .skill_item",
      {
        opacity: 0,
        y: 10,
        stagger: {
          amount: 0.2,
          from: "random",
        },
        duration: 0.5,
        ease: "power4.inOut",
      },
      "<"
    )
    .from(
      CSSRulePlugin.getRule(".self:before"),
      {
        opacity: 0,
        y: 40,
        duration: 0.5,
        ease: "power4.inOut",
      },
      "<"
    );
  const resumetl = gsap
    .timeline({
      scrollTrigger: {
        trigger: ".resume",
        start: "top 60%",
        toggleActions: "play reverse play reverse",
      },
    })
    .from(".resume .cardflip", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power4.inOut",
    });
};

export const scrollAnimation = () => {};
