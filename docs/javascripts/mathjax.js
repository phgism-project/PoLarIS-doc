window.MathJax = {
  tex: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$']],
    processEscapes: true,
    processEnvironments: true
  }
};

window.addEventListener("load", () => {
  MathJax.typesetPromise();
});
