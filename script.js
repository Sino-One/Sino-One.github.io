gsap.to("div", {
  y: -40,
  borderColor: "white",
  ease: "sine.inOut",
  stagger: { each: 0.05, from: "end", repeat: -1, yoyo: true },
});

// const header = `
//     <header>
// `;

// document.addEventListener("DOMContentLoaded", (event) => {
//   const homepage = document.querySelector(".homepage");
//   homepage.insertAdjacentHTML("afterbegin", header);
// });
