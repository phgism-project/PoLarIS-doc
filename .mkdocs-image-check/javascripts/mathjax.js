window.MathJax = {
  tex: {
    // 这里是关键：告诉 MathJax 认识单个 $ 和 双个 $$
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

// 这一段是 MkDocs Material 官方要求的：
// 因为 Material 主题切换页面时不刷新浏览器，这段代码确保切换页面后公式依然能正常渲染
document$.subscribe(() => {
  MathJax.typesetPromise()
})
