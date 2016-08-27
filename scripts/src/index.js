$(document).ready(function() {
  // http://www.simonewebdesign.it/how-to-make-browser-editor-with-html5-contenteditable/
  var timer,
      js = document.getElementById('js'),
      delay = 1000;

  var code = localStorage.getItem("p5editor-code") || js.textContent.trim();

  js.onkeyup = function(event) {

    if (typeof timer != "undefined") {

      clearTimeout(timer);
      timer = 0;
    }

    timer = setTimeout(reloadCode, delay);
  };

  function reloadCode() {
    var nowCode = js.textContent.trim();
    if (code !== nowCode) {
      // code changed
      try {
        var syntax = esprima.parse(nowCode);
        // validated
        code = nowCode;
        localStorage.setItem("p5editor-code", code);
        executeCode();
      } catch(e) {}
    }
  }

  function executeCode() {
    $('script:not(#js)').remove();
    var script = document.createElement("script");
    script.innerHTML = code;
    js.parentNode.insertBefore(script, js);
  }

});