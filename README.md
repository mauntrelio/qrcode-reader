# qrcode-reader

**qrcode-reader** is a jQuery plugin implementing a browser interface for the [cozmo jsQR](https://github.com/cozmo/jsQR) QR code reading library.

**jsQR** is designed to be a completely standalone library for scanning QR codes: the current plugin redistributes the standalone `jsQR.js` browser script under the Apache 2.0 license. In principle a different library (which should provide the same interface) could be used.

**qrcode-reader** implements a web GUI to make use of the webcam available to the browser client in order to scan QR Codes, based on the example provided by **jsQR** at https://cozmo.github.io/jsQR/

Demo available at https://mauntrelio.github.io/demos/qrcode-reader/

# Usage

Include files from the dist folder:

```html
<!-- qrcode-reader core CSS file -->
<link rel="stylesheet" href="css/qrcode-reader.min.css">

<!-- jQuery -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>

<!-- qrcode-reader core JS file -->
<script src="js/qrcode-reader.min.js"></script>
```

**qrcode-reader** initialization should be executed after document ready, for example:

HTML:
```html
<input type="button" id="openreader-btn" value="Scan QRCode"/>
```

Javascript:
```javascript
$("#openreader-btn").qrCodeReader();
```

Please note that, in order to use the client's webcam, some browsers may require the content to be served over HTTPS (Chrome requires that).

**qrcode-reader** binds the click of the jQuery target element to the opening of the QRCode reader widget interface. The plugin keeps a single instance of the widget across the page, resetting the options according to the clicked bound element.

Options can be specified via data-attributes (with `data-qrr-*` prefix) on the target element, or at runtime, when binding the element. Runtime options have precedence over the data-attributes options.

## Example of options in data attributes

```html
<input type="text" id="target-input"/>
<input type="button" id="openreader-btn" 
  data-qrr-target="#target-input" 
  data-qrr-audio-feedback="false" 
  value="Scan QRCode"/>
```

## Example of options at runtime

HTML:
```html
<textarea id="target-input"></textarea>
<input type="button" id="openreader-btn" value="Scan QRCode"/>
```

Javascript:
```javascript
$("#openreader-btn").qrCodeReader({
  target: "#target-input",
  audioFeedback: true,
  multiple: true,
  skipDuplicates: false,
  callback: function(codes) {
    console.log(codes);
  }
});
```

## Available options and defaults

**qrcode-reader** provides the following options:

```javascript
// single read or multiple readings
multiple: false, 

// only triggers for QRCodes matching the regexp
qrcodeRegexp: /./, 

// play "Beep!" sound when reading qrcode successfully 
audioFeedback: true, 

// in case of multiple readings, after a successful reading,
// wait for repeatTimeout milliseconds before trying for the next lookup. 
// Set to 0 to disable automatic re-tries: in such case user will have to 
// click on the webcam canvas to trigger a new reading tentative
repeatTimeout: 1500, 

// target input element to fill in with the readings in case of successful reading 
// (newline separated in case of multiple readings).
// Such element can be specified as jQuery object or as string identifier, e.g. "#target-input"
target: null, 

// in case of multiple readings, skip duplicate readings
skipDuplicates: true,  

// color of the lines highlighting the QRCode in the image when found
lineColor: "#FF3B58",

// In case of multiple readings, function to call when pressing the OK button (or Enter), 
// in such case read QRCodes are passed as an array. 
// In case of single reading, call immediately after the successful reading 
// (in the latter case the QRCode is passed as a single string value)
callback: function(code) {} 
```

## Overriding defaults

The `$.qrCodeReader` object gives access to the defaults settings.

E.g.: 

```javascript
$.qrCodeReader.defaults.repeatTimeout = 2000;
```

allows you to set the default repeat timeout globally, in case you have different qrcode-reader widgets associated with different buttons.

Since the library itself does not include directly the jsQR script, but it loads it dynamically on initialization, you may need to re-address the path to it.

```javascript
$.qrCodeReader.jsQRpath = "https://www.example.com/jsQR/jsQR.js";
```

The same for the *beep* feedback sound (you can replace it with your preferred audio clip):

```javascript
$.qrCodeReader.beepPath = "https://www.example.com/audio/beep.mp3";
```

## Advanced bindings

In some special cases you may want to re-bind your button conditionally (e.g. you may want the click on the button to open the **qrcode-reader** widget only if the target input is empty): to do so you have to unbind the `click.qrCodeReader` event and re-bind the click with a conditional call:

```javascript
  $("#openreader-btn").qrCodeReader({
    target: "#target-input",
    callback: function(code) {
    // do something with the read QRCode
    }
  }).off("click.qrCodeReader").on("click", function(){
    var qrcode = $("#target-input").val().trim();
    // if a value is already in the target input
    if (qrcode) {
     // do something with the value already present in the input
    } else {
      // otherwise open a qrcode reader widget
      $.qrCodeReader.instance.open.call(this);
    }
  });

```

## TODO

- Give feedback on ignored duplicate readings
- Improve examples page