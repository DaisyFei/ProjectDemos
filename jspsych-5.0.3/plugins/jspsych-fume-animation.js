/**
* jspsych-fume-animation
* Lin Fei
*
* Base off from jspsych-choice-animation (Megan Woodruff) and jspsych-flashing-grid (Payton O'Daniels)
*
* Plug in parameters:
* feedback: if true, we will show feedback for each trial
* timing_feedback_duration: the length of feedback display
* prompt: if true, we will show prompt
* prompt_timing: the time we show the prompt after the trial starts (in ms)
* earlyOpt: if true, the best optimal happens in the first hald of the trial
* no_feedback_duration: if there is no feedback, this is the time between result (response or timeout) and trial end
* blockNum: the index number of the current block, used to access the file directory
* best: the best optimal that will happen, used to call the file name
* nextBest: the second best optimal that will happen, used to call the file name
*
* Balls, circles and particles all mean the same thing :)
*
**/
jsPsych.plugins['fume-animation'] = (function () {

    var plugin = {};

    // this is a required element of a plugin
    plugin.trial = function(display_element, trial) {    
        
        //Set the valid key
        var spaceBar = 32;
        //These are for prompts
        var promptCode1;
        var promptCode2;

        //allows to use variables as functions
        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        //This sets up the default of some variables unless defined by experimentor
        trial.feedback = trial.feedback || false;
        trial.timing_feedback_duration = trial.timing_feedback_duration || 2500;
        trial.prompt = trial.prompt || "";
        trial.prompt_timing = trial.prompt_timing || 3000; 
        trial.no_feedback_duration = trial.no_feedback_duration || 400;


        // if we have a prompt, display it at a certain time for a certain length
        // In this case, we display the prompt for one second, 
        // But we want the prompt to be on top of the screen
        // so we build a div (line 63) and add string to it.
        if (trial.prompt !== "") {
            promptCode1 = setTimeout(function(){document.getElementById('promptDiv').innerHTML = '<center><b><font size="6" color=\"red\">' + trial.prompt + '</font></b></center>';},trial.prompt_timing);
//            promptCode2 = setTimeout(function() {
//                var element = document.getElementById('promptDiv');
//                element.innerHTML = "<br>";}, trial.prompt_timing + 1000);
        }

        //set the trial's variables to be accessed from the experiment
        blockNum = trial.blockNum;
        fileIndex = trial.fileIndex;
        helperNum = trial.helper;
        harmerNum = trial.harmer;
        helpeeNum = trial.helpee;
        postHelperNum = trial.postHelper;
        postHarmerNum = trial.postHarmer;
        postHelpeeNum = trial.postHelpee;
        duration = trial.duration;
        numBalls = trial.numBalls;
        reverse = trial.reverse;
        flip = trial.flip;
        colorIndex = trial.colorIndex;
        var colorGroup = [['blue','orange','black'],['black','orange','blue'],['black','blue','orange'],['orange','blue','black'],['orange','black','blue'],['blue','black','orange']];
        var helper = colorGroup[colorIndex-1][0];
        var helpee = colorGroup[colorIndex-1][1];
        var harmer = colorGroup[colorIndex-1][2];
        var colorArr = [helper, helpee, helpee, helpee, harmer];
        

        //set up the screen(canvas) and the graphics
        document.body.style.width = "1200px";
        display_element.append('<div id="promptDiv"><font size="6"><br></font></div>');
        display_element.append('<canvas id="screen"></canvas>');
        var screen = document.getElementById('screen');
        screen.setAttribute("width", "1120px");
        screen.setAttribute("height","640px");
        var graphics = screen.getContext('2d');
        if(flip){
            graphics.translate(1120, 0);
            graphics.scale(-1, 1);
        }
        
        

        //////////////////////
        ///Read in the file///
        ////////////////////// 

        // Holds all of the data
        var dataSet;

        // The number of lines of data in the file
        var dataLineTotal = 22;

        // Holds the value of the data line currently being processed
        var dataLine;

        // Request object that sends the file request
        var dataReq = new XMLHttpRequest();

        dataReq.onreadystatechange = function() {

            // When the data file is opened, if it succeeds, process the data
            if (this.readyState === 4 && this.status === 200) {
            // This splits the data into dataSet by line, and then splits
                // it again to have arrays within dataSet with individual string
                // values for each data entry.
                dataSet = (dataReq.responseText).split("\n");
                for (dataLine = 0; dataLine < dataLineTotal; ++dataLine) {
                        dataSet[dataLine] = dataSet[dataLine].split(",");
                }
            //console.log(dataSet);
            }

        };
        
        var fileRoute = "Block" + blockNum +"/"+ fileIndex +"data" + helperNum.toString() + harmerNum.toString() + helpeeNum.toString() +postHelperNum.toString() + postHarmerNum.toString() + postHelpeeNum.toString() + ".csv";
        console.log(fileRoute);

        // Sends the request for the data of filename.format
        dataReq.open("GET", fileRoute, false);
        dataReq.send();

        //console.log(dataSet);
        
        /////////////////////////////////////
        ///Record the duration of each number of safe balls throughout the trial
        /////////////////////////////////////
        
        var safePerFrame = 0;
        var safePerFrameArray = [];
        
        for(var i = 0; i < 60*duration; ++i){
            for(var j = 0 ; j < numBalls; ++j){
                if(dataSet[j][i] > screen.width / 2){
                    ++safePerFrame;
                }
            }
            safePerFrameArray.push(safePerFrame);
            safePerFrame = 0;
        }
        
        var safeDur=[];
        for (var i = 0; i < (numBalls+1); ++i){
            safeDur.push(0);
        }
        
         for(var i = 0; i < safePerFrameArray.length; ++i){
            for(var j = 0 ; j < (numBalls+1); ++j){
                if(safePerFrameArray[i] == j){
                    ++safeDur[j];
                }
            }
         }
        
        for (var i = 0; i < (numBalls+1); ++i){
            if(safeDur[i] == 0){
                safeDur[i] = -1;
            }
        }
        
        //console.log(safeDur);
        
        /////////////////////////////////////
        ///Import the coordinates into moving shapes
        /////////////////////////////////////

        var particles = []; //the array that holds the circles
        var index = 1; //if the read-in file is read foward, start from this number on the second frame
        var backIndex = 60 * duration - 2; //if the read-in file is read backward, start from this number on the second frame
        var radius = 30; //the radius of each circle
        var margin = 60; //the distance between room and canvas
        var doorClosed = false; //the condition of the door
        var safeBalls = 0; //the number of balls in the safe room 
        var keyPressed = false; //the condition of the key press
        var appended = false; //whether feedback is appended
        var timeoutSet = false; //whether endtrial should be called
        var numSaved = 0; //the number of balls saved (different from safeballs because of the timeout condition)
        var helperSaved = 0;
        var helpeeSaved = 0;
        var harmerSaved = 0;
        var timeout = false; //whether the time has run out
        var animationCode; //takes care of the start and the stop of the animation
        
        
        //initializes the position of the circles
        for (var i = 0; i < numBalls; ++i) {
            if(reverse === false){
                particles.push({
                    x: parseFloat(dataSet[i][0]),
                    y: parseFloat(dataSet[i+5][0]),
                    xspeed: parseFloat(dataSet[i+10][0]),
                    yspeed: parseFloat(dataSet[i+15][0])
                });
            }else{
                particles.push({
                    x: parseFloat(dataSet[i][60*duration - 1]),
                    y: parseFloat(dataSet[i+5][60*duration - 1]),
                    xspeed: -1*parseFloat(dataSet[i+10][60*duration - 1]),
                    yspeed: -1*parseFloat(dataSet[i+10][60*duration - 1])
                })
            }
        }         
        
        // runs the animation 60 times a second
        var timeoutCode = setInterval(update, 1000/60);
        
        // works like a main function
        // handles the function that happens on each frame
        function update(){
            requestAnimationFrame(draw);
            if(!doorClosed && !timeout){
                if (keyPressed) {
                    // check to see if there is a circle in the way of the door
                    // if there is, don't close the door
                    var intersect = false;
                    for (var i = 0; i < numBalls; i++) {
                        if (Math.abs(particles[i].x - (screen.width/2)) < ( radius + 2)){
                        intersect = true;
                        console.log("Attempting to close the door!");
                        break;
                        }
                    }
                   if (!intersect) {
                       doorClosed = true;
                   }
                }
                //read in a new coordinate point
                readIn();
            }else if (doorClosed && !timeout) {
                numSaved = countSafeBalls();
                var helperDis = 1-countSafeBalls_idv(0);
                var helpeeDis = 3-(countSafeBalls_idv(1)+countSafeBalls_idv(2)+countSafeBalls_idv(3));
                var harmerDis = 1-(countSafeBalls_idv(4));
                helperSaved = 1-helperDis;
                helpeeSaved = 3-helpeeDis;
                harmerSaved = 1-harmerDis;
                // display feedback if needed
                if(!appended && trial.feedback){     
                   dangerBalls = numBalls - countSafeBalls();
                   var appendString = "<h2>You dissolved ";
                        if(helperDis > 0){
                            appendString = appendString + helperDis + helper;
                            if(helpeeDis > 0 && harmerDis > 0){
                                appendString = appendString + ", "+helpeeDis + " "+ helpee;
                                appendString = appendString + ", and "+harmerDis + " "+ harmer;
                            }else if (helpeeDis > 0){
                                appendString = appendString + " and "+helpeeDis + " "+ helpee;
                            }else if (harmerDis > 0){
                                appendString = appendString + " and "+harmerDis + " "+ harmer;
                            }
                        }else{
                            if(helpeeDis > 0){
                                appendString = appendString + helpeeDis + " "+ helpee;
                                if(harmerDis >0){
                                    appendString = appendString + " and "+harmerDis + " "+ harmer;
                                }
                            }else{
                                if(harmerDis > 0){
                                    appendString = appendString + harmerDis + " "+ harmer;
                                }
                            }
                        }
                        if (dangerBalls !== 1){
                            appendString = appendString + " shapes. </h2>";
                        }else{
                            appendString = appendString + " shape.";
                        }

                    display_element.append(appendString);
                    appended = true;
                    // end the trial after feedback
                    end_trial_countdown(trial.timing_feedback_duration);
                }else{
                    // end the trial with no feedback
                    end_trial_countdown(trial.no_feedback_duration);
                }
            }else if (timeout){
                numSaved = 0;
                helperSaved = 0;
                harmerSaved = 0;
                helpeeSaved = 0; 
                if(!appended && trial.feedback){
                    var appendString = "<h2>All " + numBalls +" shapes are dissolved.</h2>";
                    display_element.append(appendString);
                    appended = true;
                    end_trial_countdown(trial.timing_feedback_duration);
                }else{
                    end_trial_countdown(trial.no_feedback_duration);
                }
            }
        }
        
        // calls the end_trial function properly
        function end_trial_countdown(time){
            if (!timeoutSet) {
                timeoutSet = true;
                setTimeout(function() {
                    end_trial();
                }, time);
            }
        }
        
        //read in the coordinates from the file
        function readIn(){
            if(reverse === false){
                for(var i = 0; i < numBalls; ++i){
                    particles[i].x = parseFloat(dataSet[i][index]);
                    particles[i].y = parseFloat(dataSet[i+5][index]);
                    particles[i].xspeed = parseFloat(dataSet[i+10][index]);
                    particles[i].yspeed = parseFloat(dataSet[i+15][index]);
                }
                ++index;
            }else{
                for(var i = 0; i < numBalls; ++i){
                    particles[i].x = parseFloat(dataSet[i][backIndex]);
                    particles[i].y = parseFloat(dataSet[i+5][backIndex]);
                    particles[i].xspeed = -1*parseFloat(dataSet[i+10][backIndex]);
                    particles[i].yspeed = -1*parseFloat(dataSet[i+15][backIndex]);
                }
                --backIndex;
            }
            if (index == dataSet[0].length -1 || backIndex == 0){
                timeout = true;
            }
        }
        
        //draw the room, the door, and the circles
        function draw() {
            //Clear the screen for drawing
            graphics.fillStyle = 'white';
            graphics.fillRect(0, 0, screen.width, screen.height);
            //Change the color of the room on different situations
            if(timeout){
                drawRoom('red');
                drawDoor('#F5F5F5');
            }else{
                if(!keyPressed && !doorClosed){
                    //Draw the room in black
                    drawRoom('black');
                    //Draw the door in gray
                    drawDoor('#F5F5F5');
                }else if (keyPressed && !doorClosed ){
                    drawRoom('red');
                    drawDoor('#F5F5F5');
                }else {
                    drawRoom('red');
                    drawDoor('black');
                }   
            }
            //Draw each particle as darts
            for (var i = 0; i < particles.length; ++i) {
//                console.log(particles[i]);
//                console.log(colorArr[i]);
                graphics.fillStyle = colorArr[i];
                graphics.beginPath();	
                unit = Math.sqrt((radius * radius) / (particles[i].xspeed * particles[i].xspeed + particles[i].yspeed * particles[i].yspeed));
                graphics.moveTo(particles[i].x - 0.5 * unit * particles[i].yspeed, particles[i].y + 0.5 * unit * particles[i].xspeed);
                graphics.lineTo(particles[i].x + unit * particles[i].xspeed, particles[i].y + unit * particles[i].yspeed);
                graphics.lineTo(particles[i].x + 0.5 * unit * particles[i].yspeed, particles[i].y - 0.5 * unit * particles[i].xspeed);
                graphics.lineTo(particles[i].x + 0.2 * unit * particles[i].xspeed, particles[i].y + 0.2 * unit * particles[i].yspeed);
                graphics.closePath();
                graphics.fill();
            }
        }

        //draw the room and the vent
        function drawRoom(color){
            graphics.strokeStyle = color;
            graphics.lineWidth = 3;
            graphics.strokeRect(margin, margin, (screen.width - 2* margin), (screen.height - 2* margin));
            graphics.beginPath();
            graphics.moveTo(margin - 15, screen.height/2 - 8);
            graphics.lineTo(margin + 15, screen.height/2 - 8);
            graphics.stroke();
            graphics.closePath();
            graphics.beginPath();
            graphics.moveTo(margin - 15, screen.height/2 + 8);
            graphics.lineTo(margin + 15, screen.height/2 + 8);
            graphics.stroke();
            graphics.closePath();
            graphics.beginPath();
            graphics.moveTo(margin, screen.height/2 - 6);
            graphics.lineTo(margin, screen.height/2 + 6);
            graphics.strokeStyle = "white";
            graphics.lineWidth = 4;
            graphics.stroke();
            graphics.closePath();
            graphics.fillStyle = 'red';
            graphics.beginPath();
            graphics.arc((margin -10 - radius), screen.height/2, 10, 0, 2 * Math.PI);
            graphics.fill();
        }
        
        //draw the door
        function drawDoor(color){
            graphics.strokeStyle = color ;
            graphics.lineWidth = 3;
            graphics.beginPath();
            graphics.moveTo(screen.width/2, margin + 2);
            graphics.lineTo(screen.width/2, screen.height - margin - 2);
            graphics.stroke();
            graphics.closePath();
        }
        
        //count the number of balls on the right side of the room
        function countSafeBalls(){
            safeBalls = 0;
            for (var i = 0; i < numBalls; ++i){
                if(particles[i].x > screen.width/2){
                    ++safeBalls;
                }
            }
            return safeBalls;
        }
        
        function countSafeBalls_idv(i){
            safeBalls = 0;
            if(particles[i].x > screen.width/2){
                    ++safeBalls;
                }
            return safeBalls;
        }

        ////////////////////////////////////////////////////////////////////////////////
        // Functions involved in interaction and data store
        ////////////////////////////////////////////////////////////////////////////////
        
        var response = {
          rt: -1,
          key: -1
        };   

        // function that ends the trial and stores the data
        end_trial = function() {
          // kill keyboard listeners
          if (typeof keyboardListener !== 'undefined') {
            jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
          }

          jsPsych.pluginAPI.cancelAllKeyboardResponses();

          clearInterval(timeoutCode);
          if (trial.prompt !== "") {
            clearTimeout(promptCode1);
            //clearTimeout(promptCode2);
          }

          // gather the data to store for the trial
          var trial_data = {
            "total": numBalls,
            "duration": duration,
            "rt": response.rt,
            "key_press": response.key,
            "reverse": trial.reverse,
            "flip":trial.flip,
            "fileIndex": trial.fileIndex,
            "helperNum" : trial.helper,
            "harmerNum" : trial.harmer,
            "helpeeNum" : trial.helpee,
            "postHelperNum" : trial.postHelper,
            "postHarmerNum" : trial.postHarmer,
            "postHelpeeNum" : trial.postHelpee,
            "numSaved": numSaved,
            "helperSaved" : helperSaved,
            "harmerSaved" : harmerSaved,
            "helpeeSaved" : helpeeSaved,
//            "nextBestDur": nextBestDur,
//            "nextBestInit": nextBestInit,
//            "bestDur": bestDur,
//            "bestInit": bestInit,
          };


            display_element.html("");

            jsPsych.finishTrial(trial_data);

        };

        //function that handles the response of the participant
        var after_response = function(info) {

          if (!keyPressed){
              // if the participant pressed the right key,
              // we mark that a key has been pressed
              // this to ensure a participant can only make
              // a choice once
               if (info.key == spaceBar) {
                    keyPressed = true;
                }
         }

          // only record the first response
          if (response.key == -1) {
            response = info;
          }
        
        
          // cancel the keyboard response after this
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener); 

        };

        // start the response listener
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
            callback_function: after_response,
            valid_responses: [spaceBar],
            rt_method: 'date',
            persist: false,
            allow_held_key: false
        });
      
  };    
         
    return plugin;
    
})();