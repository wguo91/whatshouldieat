"use strict";
/**
 * methods: fadeOut()
 */
window.onload = function(ele) {
  function fadeOut(ele) {
    ele.style.opacity = 1;
    (function fade() {
      if((ele.style.opacity -= 0.05) < 0)
        ele.style.display = "none";
      else
        requestAnimationFrame(fade);
    })();
  }
  // for loading screen
  fadeOut(document.getElementById("loading-screen"));
};
