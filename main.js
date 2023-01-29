// TEMP
let timerActive = false;

$("#resetbutton").show();

if (timerActive) {
    $("#pausebutton").show();
    $("#playbutton").hide();
} else {
    $("#pausebutton").hide();
    $("#playbutton").show();
}