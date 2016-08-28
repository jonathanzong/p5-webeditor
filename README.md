# p5-webeditor
In-browser editor for p5.js with live reloading, tightening the creative feedback loop.

## Design Goals
I was motivated to develop ``p5-webeditor`` because I wanted to reduce the friction between having an idea to explore in p5 and being able to see it live. Being able to quickly try a concept without setting up a new project is powerful; so is not needing to refresh the page every few seconds after making short edits. The power of ``p5`` is that it runs in a browser environment, and this project hopes to leverage that into a more fluid experience.

Initially, my two main interface goals were:
* Intelligent reloading
    * Reloading the sketch disrupts flow, and should happen as infrequently as possible in order to keep the canvas up to date. In particular, the sketch should never reload on syntactically invalid/unfinished code that a user would not have intended to reload.
* Code persistence
    * Ever filled out a form and accidentally pressed the back button and lost everything? The editor should regularly save state and act as a metaphorical sketchbook.

The technical challenges that came up around executing code from user input in the browser raised more interesting opportunities to develop those general goals into informed implementation decisions.

## Implementation Details

### Static analysis
On each text change event, ``p5-webeditor`` checks the text deltas to make sure they are not insignificant edits, like whitespace or semicolons. If there are significant edits, a timeout will be set to fire after typing has paused. The timeout runs the code through ``JSHint``, which will run static analysis on the code to check for errors. JSHint is configured to suppress most warnings and only raise for fatal errors like syntax or undefined symbols. It is also configured to understand that the code has ``p5.prototype``'s fields in global variable scope.

### Code persistence and execution
Once the code passes both the delta and static analysis filters, the code is stored in memory and in ``localstorage``, in order to persist across browser sessions (and survive accidental back button navigation). ``p5-webeditor`` will then execute the code by creating a ``<script>`` node, populating it with the code, and appending it to the document.

### Clearing scope
In order to simulate a true reload, ``p5-webeditor`` must clean the global scope before executing the new code. For example, if the user defines the ``mousePressed`` function and then removes it, the old ``mousePressed`` must be unset because there is nothing in the new code to overwrite the old behavior. ``p5-webeditor`` keeps a list of ``p5`` functions that the user might define in the global scope, and sets each to ``undefined`` before overriding them with the new code. Then, ``setup`` is called in order to trigger a restart of the sketch.

### Runtime error handling
The program may still fail on execution due to runtime errors not found in static analysis, like ``ReferenceError``. ``p5-webeditor`` intercepts errors thrown by functions in ``p5.prototype`` with shims that surround the original function with a try/catch block. When one of these functions throws a runtime error, instead of crashing the browser javascript runtime the error will be caught and displayed in a UI console attached to the editor.
