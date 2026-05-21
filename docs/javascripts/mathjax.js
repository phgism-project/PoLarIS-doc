window.MathJax = {
  tex: {
    // 把 "$" 加到行内公式的识别符中
    inlineMath: [['$', '$'], ["\\(", "\\)"]],
    displayMath: [['$$', '$$'], ["\\[", "\\]"]]
  },
  options: {
    // 推荐的默认设置，跳过一些不需要渲染代码的标签
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  }
};
