// 카드 뒤집기 기능

const cards = document.querySelectorAll(".card");

cards.forEach((card) => {
  let isFlipped = false;

  // 클릭 이벤트로 카드 뒤집기
  card.addEventListener("click", (e) => {
    e.preventDefault();

    isFlipped = !isFlipped;

    if (isFlipped) {
      card.classList.add("flipped");
    } else {
      card.classList.remove("flipped");
    }
  });
});
