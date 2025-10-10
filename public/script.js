document.addEventListener("DOMContentLoaded", (e) => {
  const footBar = document.querySelector(".footer");
  const footerOptionBar = document.querySelector(".f-panel");
  const backBar = document.querySelector(".back-nav");
  const userPanelNav = document.querySelector(".user-panel");

  let userRoutes = ["login", "signup", "logout"];
  if (footerOptionBar && window.location.pathname !== "/") {
    footerOptionBar.style.display = "none";
    backBar.style.display = "block";
    console.log("Footbar hidden on non-home route:", window.location.pathname);
  }
  for (route of userRoutes) {
    if (footBar && window.location.pathname.includes(route)) {
      //  e.preventDefault();
      userPanelNav.style.display = "none";
      footBar.style.display = "none";
      console.log(footBar);
    }
  }
});
