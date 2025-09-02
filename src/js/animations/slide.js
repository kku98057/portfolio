import Swiper from "swiper";
import "swiper/css";

new Swiper(".resume_swiper", {
  slidesPerView: "auto",
  spaceBetween: 10,
  breakpoints: {
    768: {
      spaceBetween: 20,
    },
  },
});
