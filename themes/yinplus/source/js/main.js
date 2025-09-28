function getUrlRelativePath() {
  var url = document.location.toString();
  var arrUrl = url.split("//");

  var start = arrUrl[1].indexOf("/");
  var relUrl = arrUrl[1].substring(start);

  if (relUrl.indexOf("?") != -1) {
    relUrl = relUrl.split("?")[0];
  }
  return relUrl;
}

$(()=> {
  var blocks = document.querySelectorAll("pre code");
  if (window.hljs) {
    if (typeof hljs.highlightElement === 'function') {
      blocks.forEach(function(block){ hljs.highlightElement(block); });
    } else if (typeof hljs.highlightBlock === 'function') {
      blocks.forEach(function(block){ hljs.highlightBlock(block); });
    }
  }
});