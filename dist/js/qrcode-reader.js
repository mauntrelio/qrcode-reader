;(function( $, window, document, undefined ) {

  "use strict";

  // cross browser request animation frame
  if ( !window.requestAnimationFrame ) {

    window.requestAnimationFrame = ( function() {

      return window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

        window.setTimeout( callback, 1000 / 60 );

      };

    } )();

  }


  var qrr, // our qrcode reader singletone instance 
    QRCodeReader = function() {};

  $.qrCodeReader = {
    jsQRpath: "../dist/js/jsQR/jsQR.min.js",
    beepPath: "../dist/audio/beep.mp3",
    instance: null,
    defaults: {
        // single read or multiple readings/
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
      }
  };

  QRCodeReader.prototype = {

    constructor: QRCodeReader,

    init: function () {

      // build the HTML 
      qrr.buildHTML();
      qrr.scriptLoaded = false;
      qrr.isOpen = false;

      // load the script performing the actual QRCode reading
      $.getScript( $.qrCodeReader.jsQRpath, function( data, textStatus, jqxhr ) {
        if ( jqxhr.status == 200) {
          qrr.scriptLoaded = true;
        } else {
          console.error("Error loading QRCode parser script");
        };

      });

    },

    // build the HTML interface of the widget
    buildHTML: function() {

      qrr.bgOverlay = $('<div id="qrr-overlay"></div>');
      qrr.container = $('<div id="qrr-container"></div>');
      
      qrr.closeBtn = $('<span id="qrr-close">&times;</span>')
      qrr.closeBtn.appendTo(qrr.container);

      qrr.okBtn = $('<a id="qrr-ok">OK</a>');
            
      qrr.loadingMessage = $('<div id="qrr-loading-message">🎥 Unable to access video stream (please make sure you have a webcam enabled)</div>');
      qrr.canvas = $('<canvas id="qrr-canvas" class="hidden"></canvas>');
      qrr.audio = $('<audio hidden id="qrr-beep" src="' + $.qrCodeReader.beepPath + '" type="audio/mp3"></audio>');
      
      qrr.outputDiv = $('<div id="qrr-output"></div>');
      qrr.outputNoData = $('<div id="qrr-nodata">No QR code detected.</div>');
      qrr.outputData = $('<div id="qrr-output-data"></div>');
      
      qrr.outputNoData.appendTo(qrr.outputDiv);
      qrr.outputData.appendTo(qrr.outputDiv);
      
      qrr.loadingMessage.appendTo(qrr.container);
      qrr.canvas.appendTo(qrr.container);
      qrr.outputDiv.appendTo(qrr.container);
      qrr.audio.appendTo(qrr.container);
      qrr.okBtn.appendTo(qrr.container);
    
      qrr.bgOverlay.appendTo(document.body);
      qrr.bgOverlay.on("click", qrr.close);
      qrr.closeBtn.on("click", qrr.close);
      
      qrr.container.appendTo(document.body);

      qrr.video = document.createElement("video");

    },

    // draw a line
    drawLine: function(begin, end, color) {
      var canvas = qrr.canvas[0].getContext("2d");
      canvas.beginPath();
      canvas.moveTo(begin.x, begin.y);
      canvas.lineTo(end.x, end.y);
      canvas.lineWidth = 4;
      canvas.strokeStyle = color;
      canvas.stroke();
    },

    // draw a rectangle around a matched QRCode image
    drawBox: function(location, color) {
      qrr.drawLine(location.topLeftCorner, location.topRightCorner, color);
      qrr.drawLine(location.topRightCorner, location.bottomRightCorner, color);
      qrr.drawLine(location.bottomRightCorner, location.bottomLeftCorner, color);
      qrr.drawLine(location.bottomLeftCorner, location.topLeftCorner, color);
    },

    // merge the options with the element data attributes and then save them
    setOptions: function (element, options) {

      // data-attributes options
      var dataOptions = {
        multiple: $(element).data("qrr-multiple"), 
        qrcodeRegexp: new RegExp($(element).data("qrr-qrcode-regexp")), 
        audioFeedback: $(element).data("qrr-audio-feedback"), 
        repeatTimeout: $(element).data("qrr-repeat-timeout"), 
        target: $(element).data("qrr-target"), 
        skipDuplicates: $(element).data("qrr-skip-duplicates"),  
        lineColor: $(element).data("qrr-line-color"),
        callback: $(element).data("qrr-callback")
      }

      // argument options override data-attributes options
      options = $.extend( {}, dataOptions, options); 
      
      // extend defaults with options
      var settings = $.extend( {},  $.qrCodeReader.defaults, options);

      // save options in the data attributes
      $(element).data("qrr", settings);
    },

    // get the options from the element the reader is attached 
    getOptions: function (element) {
      qrr.settings = $(element).data("qrr");
    },

    // open the QRCode reader interface
    open: function () {

      // prevent multiple opening
      if (qrr.isOpen) return;
      
      // get options for the current called element
      qrr.getOptions(this);

      // show the widget
      qrr.bgOverlay.show();
      qrr.container.slideDown();

      // initialize codes container
      qrr.codes = [];

      // initialize interface
      qrr.outputNoData.show();
      qrr.outputData.empty();
      qrr.outputData.hide();

      if (qrr.settings.multiple) {
        qrr.okBtn.show();
        qrr.okBtn.off("click").on("click", qrr.doneReading);
      } else {
        qrr.okBtn.hide();
      }

      // close on ESC, doneReading on Enter if multiple
      $(document).on('keyup.qrCodeReader', function(e) {
        if(e.keyCode === 27) {
          qrr.close();
        }
        if (qrr.settings.multiple && e.keyCode === 13) {
          qrr.doneReading();
        }
      });

      qrr.isOpen = true;

      if (qrr.scriptLoaded) {
        // start the business
        qrr.start();
      }

    },

    // get the camera, show video, start searching qrcode in the stream
    start: function() {
      // Use {facingMode: environment} to attempt to get the front camera on phones
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
        qrr.video.srcObject = stream;
        qrr.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        qrr.video.play();
        qrr.startReading(); 
      });
    },

    // start continuously searching qrcode in the video stream
    startReading: function() {
      qrr.requestID = window.requestAnimationFrame(qrr.read);
    },

    // done with reading QRcode
    doneReading: function() {

      var value = qrr.codes[0];

      // fill in the target element
      if (qrr.settings.target) {
        if (qrr.settings.multiple) {
          var value = qrr.codes.join("\n");
        }
        $(qrr.settings.target).val(value);
      }

      // call a callback
      if (qrr.settings.callback) {
        try {
          if (qrr.settings.multiple) {
            qrr.settings.callback(qrr.codes);
          } else {
            qrr.settings.callback(value);
          }
        } catch(err) {
          console.error(err);
        }
      }

      // close the widget
      qrr.close();
    },

    // search for a QRCode
    read: function() {
      var codeRead = false;
      var canvas = qrr.canvas[0].getContext("2d");
      
      qrr.loadingMessage.text("⌛ Loading video...");
      qrr.canvas.off("click.qrCodeReader", qrr.startReading);

      if (qrr.video.readyState === qrr.video.HAVE_ENOUGH_DATA) {
        qrr.loadingMessage.hide();
        qrr.canvas.removeClass("hidden");

        qrr.canvas[0].height = qrr.video.videoHeight;
        qrr.canvas[0].width = qrr.video.videoWidth;
        canvas.drawImage(qrr.video, 0, 0, qrr.canvas[0].width, qrr.canvas[0].height);
        
        var imageData = canvas.getImageData(0, 0, qrr.canvas[0].width, qrr.canvas[0].height);
        
        // this performs the actual QRCode reading
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        // a QRCode has been found        
        if (code && qrr.settings.qrcodeRegexp.test(code.data)) {
          // draw lines around the matched QRCode
          qrr.drawBox(code.location, qrr.settings.lineColor);
          codeRead = true;
          qrr.codes.push(code.data);

          qrr.outputNoData.hide();
          qrr.outputData.show();
          // play audio if requested
          if (qrr.settings.audioFeedback) {
            qrr.audio[0].play();
          }

          // read multiple codes
          if (qrr.settings.multiple) {

            // avoid duplicates
            if(qrr.settings.skipDuplicates) {
              qrr.codes = $.unique(qrr.codes);
            }

            // show our reading
            $('<div class="qrr-input"></div>').text(code.data).appendTo(qrr.outputData);
            qrr.outputDiv[0].scrollTop = qrr.outputDiv[0].scrollHeight;
            
            // read again by clicking on the canvas
            qrr.canvas.on("click.qrCodeReader", qrr.startReading);

            // repeat reading after a timeout
            if (qrr.settings.repeatTimeout > 0) {
              setTimeout(qrr.startReading, qrr.settings.repeatTimeout);
            } else {
              qrr.loadingMessage.text("Click on the image to read the next QRCode");
              qrr.loadingMessage.show();
            }

          // single reading
          } else {
            qrr.doneReading();
          }
        }
      }

      if (!codeRead) { 
        qrr.startReading();
      }

    },

    close: function() {

      // cancel the refresh function
      if (qrr.requestID) {
        window.cancelAnimationFrame(qrr.requestID);
      }

      // unbind keyboard
      $(document).off('keyup.qrCodeReader');

      // stop the video
      if (qrr.video.srcObject) {
        qrr.video.srcObject.getTracks()[0].stop();
      }
      
      // hide the GUI
      qrr.canvas.addClass("hidden");
      qrr.loadingMessage.show();
      qrr.bgOverlay.hide();
      qrr.container.hide();

      qrr.isOpen = false;
    }


  };

  $.fn.qrCodeReader = function ( options ) {

    // Instantiate the plugin only once (singletone) in the page:
    // when called again (or on a different element), we simply re-set the options 
    // and display the QrCode reader interface with the right options.
    // Options are saved in the data attribute of the bound element.
    
    if(!$.qrCodeReader.instance) {
      qrr = new QRCodeReader();
      qrr.init();
      $.qrCodeReader.instance = qrr;
    } 

    return this.each(function () {
      qrr.setOptions(this, options);
      $(this).off("click.qrCodeReader").on("click.qrCodeReader", qrr.open);
    });
      
  };

}( jQuery, window, document ));
