$(document).ready(function() {
  windowWidth = $('#canvas-wrapper').width();
  windowHeight = $('#canvas-wrapper').height();

  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");

  var code = localStorage.getItem("p5editor-code") || $('#default').text();
  editor.setValue(code);
  _executeCode();

  var timer, delay = 500;

  editor.getSession().on('change', function() {
    if (typeof timer != "undefined") {
      clearTimeout(timer);
      timer = 0;
    }
    timer = setTimeout(reloadCode, delay);
  });

  var jshint_opts = {
    asi: true,
    boss: true,
    eqnull: true,
    loopfunc: true,
    noyield: true,
    proto: true,
    supernew: true,
    withstmt: true
  };

  function reloadCode() {
    var nowCode = editor.getValue().trim();
    if (code !== nowCode) {
      // code changed
      JSHINT(nowCode, jshint_opts, Object.keys(p5.prototype))
      if (JSHINT.errors.length) {console.log(JSHINT.errors)}
      if (JSHINT.errors.length) return;
      // good to go
      code = nowCode;
      localStorage.setItem("p5editor-code", code);
      _executeCode(code);
      _executeCode("setup();");
    }
  }

  function _executeCode(src) {
    var exec = document.getElementById('exec');
    while (exec.firstChild) {
      exec.removeChild(exec.firstChild);
    }
    var script = document.createElement("script");
    script.innerHTML = src;
    exec.appendChild(script);
  }

});