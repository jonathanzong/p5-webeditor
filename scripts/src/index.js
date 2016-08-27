$(document).ready(function() {
  windowWidth = $('#canvas-wrapper').width();
  windowHeight = $('#canvas-wrapper').height();

  var editor = ace.edit('editor');
  editor.setTheme('ace/theme/monokai');
  editor.getSession().setOptions({
    mode: 'ace/mode/javascript',
    tabSize: 2,
    useSoftTabs: true
  });

  var code = localStorage.getItem('p5editor-code') || $('#default').text();
  editor.setValue(code);
  _executeCode(code);
  _executeCode('setup();');

  var timer, delay = 500;

  editor.getSession().on('change', function(e) {
    if (typeof timer != 'undefined') {
      clearTimeout(timer);
      timer = 0;
    }
    // ignore deltas that are only whitespace or semicolons
    var ignore = e.lines.map(function(el) {
      return (el.trim().length == 0 || el.trim() == ';');
    }).reduce(function(previousValue, currentValue) {
      return previousValue && currentValue;
    });
    if (!ignore) {
      timer = setTimeout(reloadCode, delay);
    }
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
      if (JSHINT.errors.length) return;
      // good to go
      code = nowCode;
      localStorage.setItem('p5editor-code', code);
      _executeCode(code);
      _executeCode('setup();');
    }
  }

  function _executeCode(src) {
    src = src || code;
    var exec = document.getElementById('exec');
    while (exec.firstChild) {
      exec.removeChild(exec.firstChild);
    }
    var script = document.createElement('script');
    script.innerHTML = src;
    $('#error-console').empty();
    try {
      exec.appendChild(script);
    } catch(e){ }
  }

  window.onerror = function(msg, url, line, col, error) {
    var errorConsole = document.getElementById('error-console');
    var div = document.createElement('div');
    div.innerHTML = msg;
    errorConsole.appendChild(div);
    $(errorConsole).animate({ scrollTop: errorConsole.scrollHeight });
  };

});