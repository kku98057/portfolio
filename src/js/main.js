import "../scss/main.scss";
import { heroIntroAnimaion } from "./animations/intro";

const heroMenuAction = () => {
  const HOVER_DELAY = 200;
  const heroMenuWrap = document.querySelector("#hero_menu");
  const heroMenus = document.querySelectorAll("#hero_menu li");
  const heroTooltip = document.querySelector(".hero_tooltip");

  //툴팁출력 함수
  const showTooltip = (e) => {
    const targets = e.target;
    const clientX = e.clientX;
    const clientY = e.clientY;
    heroTooltip.style.left = `${clientX + 20}px`;
    heroTooltip.style.top = `${clientY - 20}px`;
    heroTooltip.style.opacity = 1;

    if (targets.tagName === "A") {
      heroTooltip.children[0].innerHTML = targets.dataset.menu;
    }
  };

  //툴팁숨김 함수
  const hideTooltip = (e) => {
    heroTooltip.style.opacity = 0;
  };

  //마우스 움직일시 툴팁출력
  heroMenuWrap.addEventListener("mousemove", showTooltip);

  //마우스 뗄시 툴팁숨김
  heroMenuWrap.addEventListener("mouseleave", hideTooltip);
  heroMenus.forEach((menu) => {
    menu.addEventListener("click", (e) => {
      visibleOverFlow();
    });
    let hoverTimeout;
    const dataset = menu.children[0].dataset.menu;
    console.log(dataset);
    menu.addEventListener("mouseenter", (e) => {
      // 기존 타이머가 있다면 제거
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }

      // 즉시 호버 상태 적용
      scaleUp(menu);
    });

    menu.addEventListener("mouseleave", () => {
      // 지연 후 호버 해제
      hoverTimeout = setTimeout(() => {
        scaleDown(menu);
      }, HOVER_DELAY);
    });
  });
};
const scaleUp = (menu) => {
  menu.style.marginLeft = "5px";
  menu.style.marginRight = "5px";
  menu.children[0].style.transform = "scale(1.2)";
};

const scaleDown = (menu) => {
  menu.style.marginLeft = "0px";
  menu.style.marginRight = "0px";
  menu.children[0].style.transform = "scale(1)";
};

const visibleOverFlow = () => {
  document.querySelector("body").classList.remove("active");
};
heroMenuAction();
heroIntroAnimaion();
