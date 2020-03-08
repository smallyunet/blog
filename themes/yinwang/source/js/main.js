if (/mobile/i.test(navigator.userAgent) || /android/i.test(navigator.userAgent)) {
  document.body.classList.add('mobile')
}

document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelectorAll('.highlight').forEach((block) => {
    hljs.highlightBlock(block);
  });
});
