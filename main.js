// DEFAULT GLOBAL VARS
let timerActive = false; // whether the timer is currently running
let payRate = null; // the current pay rate entered

// the program can use these variables to determine the amount shown on the timer
/** 
 * Number of total milliseconds the timer has run. Does not count the current run.
 * Calculated when loading data from local storage in order to not have to constantly calculate.
 */
let previousElapsedTime = 0;
let startTimes = []; // a list of dates representing the start times of the timer
let stopTimes = []; // a list of dates representing the stop times of the timer

let updateTimerInterval = null; // keeps track of the currently running interval to update the timer so that it can be cancelled if needed

// FUNCTIONS
/**
 * Show or hide pause buttons.
 * Based on the timerActive variable, will show or hide the play and pause button.
 * For example, if the timer is stopped, then the play button will be shown and the
 * pause button will be hidden.
 */
function updateButtons() {
    $("#resetbutton").show();

    if (timerActive) {
        $("#pausebutton").show();
        $("#playbutton").hide();
    } else {
        $("#pausebutton").hide();
        $("#playbutton").show();
    }
}

/**
 * Resize the rate input to fit the text inside it.
 * Why are html input elements so difficult to manage
 * with css?
 */
function resizeRateInput() {
    let input = $("#rate-amount-input");
    let hidden = $("#hidden");
    hidden.text(input.val());
    input.width(hidden.width());
}

/**
 * Load values from localStorage
 */
function loadLocalStorage() {
    let tmp;

    // load timerActive
    tmp = localStorage.getItem("timerActive");
    switch (tmp) {
        case "true": timerActive = true; break;
        case "false": timerActive = false; break;
    }

    // load payRate
    tmp = localStorage.getItem("payRate");
    if (tmp && tmp != "null") {
        payRate = parseFloat(tmp);
        // update pay rate input
        $("#rate-amount-input").val(tmp);
    } else {
        // if pay rate has never been set before, autofocus on the element
        $("#rate-amount-input").focus();
    }

    // get startTimes
    tmp = localStorage.getItem("startTimes");
    if (tmp && tmp != "null") {
        tmp = JSON.parse(tmp);
        // convert array of millisecond values to date objects
        startTimes = tmp.map(value => {
            return new Date(value);
        });
    }

    // get stopTimes
    tmp = localStorage.getItem("stopTimes");
    if (tmp && tmp != "null") {
        tmp = JSON.parse(tmp);
         // convert array of millisecond values to date objects
        stopTimes = tmp.map(value => {
            return new Date(value);
        });
    }

    // calculate previousElapsedTime
    stopTimes.forEach((_, index) => {
        previousElapsedTime += stopTimes[index] - startTimes[index];
    });
}

/**
 * Update timer. Calculates the amount that should be shown on the timer and displays it.
 * Assumes that data has already been loaded.
 */
function updateTimer() {
    if (startTimes.length == 0 ) { return; } // do not update timer if there is no start time, leave as default ($0.00)
    
    let currentTime;
    if (timerActive) {
        currentTime = Date.now() - startTimes[startTimes.length - 1]; // get number of milliseconds since current start time
        currentTime += previousElapsedTime; // add time from all other timer runs
    } else {
        currentTime = previousElapsedTime; // set timer to previously loaded time
    }
    currentTime /= 3600000; // get number of hours

    let currentPay = currentTime * payRate; // get amount of money on the timer
    currentPay = currentPay.toFixed(2);
    let payString = currentPay.toString().split(".");

    // update timer text
    $("#timer-text-dollars").text(payString[0]);
    $("#timer-text-cents").text(payString[1]);
}

/**
 * Saves values in the page workspace to localStorage.
 * This should be called whenever a crucial value is updated. 
 */
function updateLocalStorage() {

    // store timerActive
    localStorage.setItem("timerActive", timerActive);

    // store payrate
    localStorage.setItem("payRate", payRate);

    // store start and stop times
    localStorage.setItem("startTimes", JSON.stringify(startTimes));
    localStorage.setItem("stopTimes", JSON.stringify(stopTimes));
}

function startTimer() {
    timerActive = true;
    startTimes.push(new Date(Date.now()));
    updateLocalStorage();
    updateTimerInterval = setInterval(updateTimer, 100);
    updateButtons();
}

function stopTimer() {
    timerActive = false;
    stopTimes.push(new Date(Date.now()));
    updateLocalStorage();
    clearInterval(updateTimerInterval);
    updateButtons();

    // calculate previousElapsedTime
    previousElapsedTime = 0;
    stopTimes.forEach((_, index) => {
        previousElapsedTime += stopTimes[index] - startTimes[index];
    });
}

function resetTimer() {
    timerActive = false;
    stopTimes = [];
    startTimes = [];
    previousElapsedTime = 0;
    if (timerActive) { clearInterval(updateTimerInterval); }
    updateLocalStorage();
    updateButtons();
    updateTimer();
}

/**
 * Completely reset the app as if it is a brand new page.
 * This function should NEVER BE CALLED outside the dev console.
 */
function DEV_FULL_RESET() {
    localStorage.clear();
    location.reload();
}

// ADD EVENT HANDLERS
$("#rate-amount-input").on('input', resizeRateInput ); // resize rate input when it is changed
$(window).on('resize', resizeRateInput ); // resize rate input when window is resized
$("#playbutton").on('click', startTimer ); // start timer if play button is clicked
$("#pausebutton").on('click', stopTimer ); // stop timer if pause button is clicked
$("#resetbutton").on('click', resetTimer ); // reset timer if reset button is clicked
$("#rate-amount-input").on('change', () => { // update payRate when payRate is changed
    let value = $("#rate-amount-input").val(); // get current pay rate
    if (value) { // if pay rate input is not empty
        payRate = parseFloat($("#rate-amount-input").val()); // update payRate variable
        updateLocalStorage(); // save to local storage
    } else {
        payRate = 0; // if pay rate input is empty, it is zero in the code
        if (timerActive) { stopTimer(); } // if pay rate is updated to zero while timer is running, stop timer.
    }
    updateTimer();
});

// INITIAL LOAD
loadLocalStorage();
resizeRateInput();
updateButtons();
if (timerActive) {
    updateTimerInterval = setInterval(updateTimer, 100);
}
updateTimer();