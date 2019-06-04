<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>qrcode-reader usage example</title>
  <link rel="stylesheet" href="../dist/css/qrcode-reader.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato">
  <style>
    body {
      font-family: 'Lato', sans-serif;
    }
  </style>
</head>

<body>
  
<h1>QRCode reader plugin examples</h1>

<form>
  
  <label for="single">Single input (settings in data attributes: no audio, regexp to match URLs):</label> 
  <input id="single" type="text" size="50"> 
  <button type="button" class="qrcode-reader" id="openreader-single" 
    data-qrr-target="#single" 
    data-qrr-audio-feedback="false" 
    data-qrr-qrcode-regexp="^https?:\/\/">Read QRCode</button>
  <br>
  <br>

  <label for="single">Single input (rebound click, depending on target input's content):</label> 
  <input id="single2" type="text" size="50"> 
  <button type="button" id="openreader-single2" 
    data-qrr-target="#single2" 
    data-qrr-audio-feedback="true">Read or follow QRCode</button>
  <br>
  <br>
  
  <label for="multiple">Multiple input (settings in data attributes: exclude duplicates, disable repeat timeout):</label><br>
  <textarea id="multiple" cols="50" rows="15"></textarea> 
  <br>
  <button class="qrcode-reader" type="button" id="openreader-multi" 
    data-qrr-multiple="true" 
    data-qrr-repeat-timeout="0"
    data-qrr-line-color="#00FF00"
    data-qrr-target="#multiple">Read QRCodes</button>
  <br>
  <br>
  
  <label for="multiple">Multiple input 2 (include duplicates, settings in runtime call):</label><br>
  <textarea id="multiple2" cols="50" rows="15"></textarea> 
  <br>
  <button type="button" id="openreader-multi2">Read QRCodes</button>  <br>
  <br>
  <br>
  
  <label for="multiple">Multiple input 3 (settings in data attributes overridden in runtime call):</label><br>
  <textarea id="multiple3" cols="50" rows="15"></textarea> 
  <br>
  <button type="button" id="openreader-multi3" 
    data-qrr-multiple="false" 
    data-qrr-target="#multiple" 
    data-qrr-skip-duplicates="false">Read QRCodes</button>
  
</form>


<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script src="../dist/js/qrcode-reader.min.js?v=20190604"></script>

<script>
  
  $(function(){

    // overriding path of JS script and audio 
    $.qrCodeReader.jsQRpath = "../dist/js/jsQR/jsQR.min.js";
    $.qrCodeReader.beepPath = "../dist/audio/beep.mp3";

    // bind all elements of a given class
    $(".qrcode-reader").qrCodeReader();

    // bind elements by ID with specific options
    $("#openreader-multi2").qrCodeReader({multiple: true, target: "#multiple2", skipDuplicates: false});
    $("#openreader-multi3").qrCodeReader({multiple: true, target: "#multiple3"});

    // read or follow qrcode depending on the content of the target input
    $("#openreader-single2").qrCodeReader({callback: function(code) {
      if (code) {
        window.location.href = code;
      }  
    }}).off("click.qrCodeReader").on("click", function(){
      var qrcode = $("#single2").val().trim();
      if (qrcode) {
        window.location.href = qrcode;
      } else {
        $.qrCodeReader.instance.open.call(this);
      }
    });


  });

</script>


</body>
</html>