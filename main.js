// SHOW OR HIDE PAUSE BUTTON
let timerActive = false;

$("#resetbutton").show();

if (timerActive) {
    $("#pausebutton").show();
    $("#playbutton").hide();
} else {
    $("#pausebutton").hide();
    $("#playbutton").show();
}

// RESIZE RATE INPUT TO FIT CONTENT
function resizeRateInput() {
    let input = $("#rate-amount-input");
    let hidden = $("#hidden");
    hidden.text(input.val());
    input.width(hidden.width());
}
$("#rate-amount-input").on('input', (e) => { resizeRateInput(); });
resizeRateInput();