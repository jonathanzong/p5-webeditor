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
    var ignore = e.lines.every(function(el) {
      return (el.trim().length == 0 || el.trim() == ';');
    })
    console.log(ignore);
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
    errors = {};
    $('#error-console').empty();
    exec.appendChild(script);
  }

  var errors = {};

  suppressUncaughtErrors(p5.prototype, function(e) {
    if (errors[e.message]) return;
    errors[e.message] = true;
    var errorConsole = document.getElementById('error-console');
    var div = document.createElement('div');
    div.innerHTML = e.message;
    errorConsole.appendChild(div);
    $(errorConsole).animate({ scrollTop: errorConsole.scrollHeight });
  });

  //by Nicholas C. Zakas (MIT Licensed)
  function suppressUncaughtErrors(object, onError) {
    var name, method;
    for (name in object) {
      method = object[name];
      if (typeof method == "function") {
        object[name] = function(name, method){
          return function(){
            try {
              return method.apply(this, arguments);
            } catch (ex) {
              onError(ex);
            }
          };
        }(name, method);
      }
    }
  }
});