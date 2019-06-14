    /**
     * fumeExperiment.js
     * Lin Fei
     * 
     * Javascript file for Dynamic Moral Decision Experiment
     * Adapted from Gamble Experiment and Choice Experiment
     * note: this requires jQuery and JsPsych
     * 
     **/

    /* jshint esversion: 6, loopfunc:true */

    /**
    * Variable declaration section
    * -----------------------------------------------------------------------------
    **/
    
    var participantCode = "";
    var participantGender = "";
    var participantAge = "";

    var spaceBar = 32;

    var main_duration = 5;
    var main_numBalls = 5;
    var totalBlocks = 6;
    var blockIndex = 0;
    var blockFin = 0;

    var trialNum = 0;
    var currentVentPos = true;
    var aniIndex = Math.floor(Math.random()*6+1);


    // The timeline that the sections of the experiment is pushed on
    var timeline = [];
    /**
    *
    * Experiment introduction
    * -----------------------------------------------------------------------------
    **/

    // These are mTurk-specific functions for getting the mTurk ID and for generating the random
    $.urlParam = function(name){
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results==null){
           return null;
        }
        else{
           return results[1] || 0;
        }
    }
        
//    var participantCode = decodeURIComponent($.urlParam('MID'));
//    if (participantCode =="null"){
//        participantCode = Math.floor(Math.random() * 100000);
//    }
//    console.log(participantCode);
//        
//    var randomCode = 100000 + Math.floor(Math.random() * 99900000);    
    
    // warn users before they try to leave the page if the experiment has not been completed
    window.onbeforeunload = function (event) {
        if (doNotClose) {
            var warningText = "Your participant data will be lost";
            event.returnValue = warningText;
            return warningText;
        }
    };

    // Informs the user about full screen
    var full_screen = {
        type: 'text',
        text: '<center><br><br>Welcome to the experiment!<br>You have now entered full screen mode. Throughout the experiment, please DO NOT press the escape key. Press any other key to continue.</center>',
        timing_post_trial: 0,
        on_finish: function (data) {
            doNotClose = true;
            // start the experiment timer
            start = new Date();
        }       
    };
    timeline.push(full_screen);

    // Asks for the user's participant id and starts timing the experiment as well as shuffling the arrays
    // that need to be randomized

    var participation_code = {
        type: "survey-text",
        questions:["Please enter your Subject ID."],
        on_finish:function(data){
            var responses = JSON.parse(data.responses);
            participantCode = responses.Q0;
        }
    }

    var gender_block = {
        type: "survey-multi-choice",
        questions: ["What is your gender?"],
        options: [["Male", "Female", "Prefer not to say"]],
        on_finish: function (data) {
            var responses = JSON.parse(data.responses);
            participantGender = responses.Q0;
        }  
    };

    var age_block = {
        type: "survey-text",
        questions: ["What is your age?<br>If you prefer not to say, leave the response area blank."],
        on_finish: function (data) {
            var responses = JSON.parse(data.responses);
            participantAge = responses.Q0.substr(0,2);
        }
    };

    // Start of the experiment - push the introduction trials onto the timeline
    timeline.push(participation_code);
    timeline.push(gender_block);
    timeline.push(age_block);

    var instruction_screen_1 = {
        type: "text",
        text: function(){
            return '<center><br><br>Welcome to the experiment! <br><br>On each trial, you will see an animation of five geometric shapes moving around in a rectangular region. The shapes will move around the region randomly for 5 seconds. After this time, the shapes will dissolve. At any point during the trial, you can choose to divide the rectangular region in half by pressing a button. If you choose to divide the region, then only the shapes in one of the two halves will dissolve at the end of 5 seconds. The red dot on the side of the rectangle indicates in which half of the region the shapes will dissolve if you choose to divide it. For example, if the red dot is on the left and you divide the region, then only those shapes in the left subregion will dissolve.<br><br><img src="images/room.png" style="width:800px;"><br><br>Press the space bar to continue</center>';
        }
    };
    
    var instruction_screen_2 = {
        type: "text",
        text: function(){
            return '<center><br><br>To divide the region, you will press the Spacebar on the keyboard. Shapes in the region away from the red dot will not dissolve. The location of the divider is indicated by the grey bar in the middle. Once you press the keyboard, the region is divided. You only have 5 seconds to make the decision. If you press the Spacebar when there are shapes in the middle of the rectangle, it will not be divided until the shapes move out of the way. If you do not press the key, the region will not be divided and all shapes will be dissolved. You will receive feedback.<br><br><img src="images/decide.png" style="width:800px;"><br><br>Press the space bar to continue</center>';
         }
    };
    
    var instruction_screen_3 = {
        type: "text",
        text: "<center><br><br><br>You will start by completing several guided practice trials.<br>Do not press the spacebar until you see the instruction to press the key.<br><br>Press the space bar to begin</center> "
    }
    
    timeline.push(instruction_screen_1);
    timeline.push(instruction_screen_2);
    timeline.push(instruction_screen_3);
    

    /**
     * Practice Section
     * ------------------------------------------------------------------------------------------------------
     **/
    // This is the first set of practice trials
    var guidedTrials =  [["Press Now!",2450,0,0,3,1,1,2,false,false],["Press Now!",1500,1,0,2,1,0,2,false,true],["Press Now!",2000,1,0,3,1,0,3,true,false],
                         ["Press Now!",3000,1,1,1,1,1,1,true,true],["Press Now!",500,1,1,1,1,1,2,false,true],["",0,1,1,2,1,0,1,false,false]];
    
    shuffle(guidedTrials);
    
    for (var i = 0; i< guidedTrials.length; i++){
 
        var trial = {
            type : "fume-animation",
            prompt: "Press Now!",
            numBalls: main_numBalls,
            duration: main_duration,
            prompt: guidedTrials[i][0],
            prompt_timing: guidedTrials[i][1],
            blockNum: "Prac",
            fileIndex: 1,
            helper: guidedTrials[i][2],
            harmer: guidedTrials[i][3],
            helpee: guidedTrials[i][4],
            postHelper: guidedTrials[i][5],
            postHarmer: guidedTrials[i][6],
            postHelpee: guidedTrials[i][7],
            reverse: guidedTrials[i][8],
            flip: guidedTrials[i][9],
            colorIndex: aniIndex,
            feedback: true,
            data: function() {
                ++trialNum;
                return {BlockNum: 9, 
                        TrialNum: trialNum};
            },
            on_finish: function() {
                saveExperiment(true);
            }
        }

            timeline.push(trial);
    }

    var instruction_screen_4 = {
        type: "text",
        text: function(){
            trialNum = 0;
            return "<center><br><br><br>You have completed the guided practice. You will now complete 6 additional practice trials. in these trials, you may divide the rectangular region whenever you like, or not at all. Similar to the guided practice, you will receive feedback after every trial. Note that you may adopt any strategy you prefer. There is no right or wrong way to complete this task.<br><br>Press the space bar to begin</center> ";
        }
    }
    
    timeline.push(instruction_screen_4);
     
    // set up the possible conditions for the practice trials
    // this follows the same format as the guided trials, but without
    // the prompt
    var practiceTrials = [[0,0,3,1,1,2],[1,0,2,1,0,2],[1,0,3,1,0,3],
                         [1,1,1,1,1,1],[1,1,1,1,1,2],[1,1,2,1,0,1]];
    var pracLength = practiceTrials.length;
                          
    var fileDirectory = 0;
    trialNum = 0;
        
    // randomize the order of the practice trials
    shuffle(practiceTrials);
    
    for (var i = 0; i< pracLength; i++){
        var trial = {
            type : "fume-animation",
            numBalls: main_numBalls,
            duration: main_duration,
            blockNum: fileDirectory,
            fileIndex: 1,
            helper: practiceTrials[i][0],
            harmer: practiceTrials[i][1],
            helpee: practiceTrials[i][2],
            postHelper: practiceTrials[i][3],
            postHarmer: practiceTrials[i][4],
            postHelpee: practiceTrials[i][5],
            reverse: Math.random() >= 0.5,
            flip: Math.random() >= 0.5,
            colorIndex: aniIndex,
            feedback: true,
            data: function() {
                ++trialNum;
                return {BlockNum: fileDirectory, 
                        TrialNum: trialNum};
            },
            on_finish: function() {
                saveExperiment(true);
            }
        }

            timeline.push(trial);
    }
    
    
    var instruction_screen_5 = {
        type: "text",
        text:function(){
            trialNum = 0;
            return "<center><br><br><br>You have completed all of the practice trials. You will now begin the main experiment. The following trials will be similar to the practice trials you just completed. However, you will no longer receive feedback after every trial. Please try your best to stay focused and pay attention to where the red dot is. Remember, you may adopt any strategy you prefer. There is no right or wrong way to complete this task.<br><br>Press the space bar to begin</center>";
        }
    }
    
    timeline.push(instruction_screen_5);
    
    /**
     * Main Experiment
     * ------------------------------------------------------------------------------------------------------
     **/

    for (var blockIndex = 0; blockIndex < 2; blockIndex++){

        var noSocialTrials = [[1,0,2,1,0,2,-1],[1,0,3,0,0,3,-1],                                   [1,0,3,1,0,3,-1],[1,1,1,1,1,1,-1],
                              [1,1,1,1,1,2,-1],[1,1,2,1,0,1,-1],
                             [1,1,2,1,1,1,-1],[1,1,2,1,1,2,-1],[1,1,3,0,1,2,-1],[0,1,2,0,1,2,-1],[0,0,1,0,1,0,1],[0,0,1,0,1,0,2],
                              [0,0,1,1,0,0,1],[0,0,1,1,0,0,2],
                              [1,0,0,0,1,0,1],[1,0,0,0,1,0,2],
                            [0,1,2,1,0,1,1],[0,1,2,1,0,1,2],
                              [0,1,3,1,0,1,1],[0,1,3,1,0,1,2]
                             ]
        
        //randomize order before trials start
        shuffle(noSocialTrials);   

        var noSocialLength = noSocialTrials.length;
        
        var catchNum = Math.floor(Math.random() * noSocialLength);
        console.log(catchNum);
        
        for (var i = 0; i<noSocialLength; ++i){
            var pretrial = {
                type: "text",
                text: "<center><br><br><b><br><br>Press space bar to start trial</b></center>",               
            }
            
            var trial = {
                type : "fume-animation",
                duration: main_duration,
                numBalls: main_numBalls,
                blockNum: function(){
                   return blockFin +1;
                },
                fileIndex: noSocialTrials[i][6],
                helper: noSocialTrials[i][0],
                harmer: noSocialTrials[i][1],
                helpee: noSocialTrials[i][2],
                postHelper: noSocialTrials[i][3],
                postHarmer: noSocialTrials[i][4],
                postHelpee: noSocialTrials[i][5],
                reverse: Index2Boolean(noSocialTrials[i][6]),
                flip: function(){
                    currentVentPos = Math.random() >= 0.5;
                    return currentVentPos;
                },
                colorIndex: aniIndex,
                data: function() {
                    ++trialNum;
                    return {BlockNum: blockFin + 1, 
                            TrialNum: trialNum};
                },
                on_finish: function() {
                    saveExperiment(true);
                }
            }
            
            function catchQuesChoice(flip){
                if(flip == false){
                    return 90;
                }else{
                    return 77;
                }
            }
            
            var categorization_trial = {
                type: "categorize",
                key_answer: function(){
                    return catchQuesChoice(currentVentPos);
                },
                choices: [77, 90],
                prompt: "<p class='prompt'><br><br>Press z if the red dot was on the left in the trial you just finished.<br>Press m if the red dot was on the right.</p>",
                data: function(){
                    return {CatchNum: trialNum};
                },
                on_finish: function() {
                    saveExperiment(true);
                }
            };
            
            timeline.push(pretrial);
            timeline.push(trial);
            if(i == catchNum){
                timeline.push(categorization_trial);
            }
        }

        var block_break = {
            type: "text",
            text:function(){
                ++blockFin;
                trialNum = 0;
                var breakText = "<center><br><br><br>You have finished " + blockFin +" of "+ totalBlocks + " blocks.<br><br>You may take a short break.<br><br>Press the space bar to continue</center>";
                if(blockFin == totalBlocks){
                    breakText = "<center><br><br><br>You have finished all " + totalBlocks +" blocks.<br><br>Press the space bar to continue</center>";
                }
                return breakText;
            }
        };
        
        timeline.push(block_break);
    }

    var instructTrial_animation = {
        type: "text",
        text: "<center><br><br><b>Next you will watch a short animation.<br><br>Press any key to proceed</b></center>"
    }
    
    timeline.push(instructTrial_animation);

     var animation_1 = {
        type: "single-stim",
        stimulus: `<video width="800" autoplay><source src="Animations/animation${aniIndex}.mp4" type="video/mp4"></video>`,
        is_html: true,
        choices: [],
        timing_response: 15500,
        response_ends_trial: false
    }
    
    timeline.push(animation_1);

    var instructTrial_animation2 = {
        type: "text",
        text: "<center><br><br><b>Now you will be performing the same task as before.<br><br>Press any key to proceed</b></center>"
    }
    
    timeline.push(instructTrial_animation2);

    for (var blockIndex = 0; blockIndex < 2; blockIndex++){
        
        var noSocialTrials = [[1,0,2,1,0,2,-1],[1,0,3,0,0,3,-1],                         [1,0,3,1,0,3,-1],[1,1,1,1,1,1,-1],
                              [1,1,1,1,1,2,-1],[1,1,2,1,0,1,-1],
                             [1,1,2,1,1,1,-1],[1,1,2,1,1,2,-1],[1,1,3,0,1,2,-1],[0,1,2,0,1,2,-1],
                              [0,0,1,0,1,0,1],[0,0,1,0,1,0,2],
                              [0,0,1,1,0,0,1],[0,0,1,1,0,0,2],
                              [1,0,0,0,1,0,1],[1,0,0,0,1,0,2],
                            [1,0,1,0,1,2,1],[1,0,1,0,1,2,2],
                              [1,0,1,0,1,3,1],[1,0,1,0,1,3,2]
                             ]
        
        //randomize order before trials start
        shuffle(noSocialTrials);   

        var noSocialLength = noSocialTrials.length;
        
        var catchNum = Math.floor(Math.random() * noSocialLength);
        console.log(catchNum);
        
        for (var i = 0; i<noSocialLength; ++i){
            var pretrial = {
                type: "text",
                text: "<center><br><br><b><br><br>Press space bar to start trial</b></center>",               
            }
            
            var trial = {
                type : "fume-animation",
                duration: main_duration,
                numBalls: main_numBalls,
                blockNum: function(){
                   return blockFin +1;
                },
                fileIndex: noSocialTrials[i][6],
                helper: noSocialTrials[i][0],
                harmer: noSocialTrials[i][1],
                helpee: noSocialTrials[i][2],
                postHelper: noSocialTrials[i][3],
                postHarmer: noSocialTrials[i][4],
                postHelpee: noSocialTrials[i][5],
                reverse: Index2Boolean(noSocialTrials[i][6]),
                flip: function(){
                    currentVentPos = Math.random() >= 0.5;
                    return currentVentPos;
                },
                colorIndex: aniIndex,
                data: function() {
                    ++trialNum;
                    return {BlockNum: blockFin + 1, 
                            TrialNum: trialNum};
                },
                on_finish: function() {
                    saveExperiment(true);
                }
            }
            
            function catchQuesChoice(flip){
                if(flip == false){
                    return 90;
                }else{
                    return 77;
                }
            }
            
            var categorization_trial = {
                type: "categorize",
                key_answer: function(){
                    return catchQuesChoice(currentVentPos);
                },
                choices: [77, 90],
                prompt: "<p class='prompt'><br><br>Press z if the red dot was on the left in the trial you just finished.<br>Press m if the red dot was on the right.</p>",
                data: function(){
                    return {CatchNum: trialNum};
                },
                on_finish: function() {
                    saveExperiment(true);
                }
            };

            timeline.push(pretrial);
            timeline.push(trial);
            if(i == catchNum){
                timeline.push(categorization_trial);
            }
        }

        var block_break = {
            type: "text",
            text:function(){
                ++blockFin;
                trialNum = 0;
                var breakText = "<center><br><br><br>You have finished " + blockFin +" of "+ totalBlocks + " blocks.<br><br>You may take a short break.<br><br>Press the space bar to continue</center>";
                if(blockFin == totalBlocks){
                    breakText = "<center><br><br><br>You have finished all " + totalBlocks +" blocks.<br><br>Press the space bar to continue</center>";
                }
                return breakText;
            }
        };
        
        timeline.push(block_break);
    }

    var instructTrial_animation3 = {
        type: "text",
        text: "<center><br><br><b>Next you will watch another short animation.<br><br>Press any key to proceed</b></center>"
    }
    
    timeline.push(instructTrial_animation3);

        var animation_2 = {
        type: "single-stim",
        stimulus: `<video width="800" autoplay><source src="Animations/flipanimation${aniIndex}.mp4" type="video/mp4"></video>`,
        is_html: true,
        choices: [],
        timing_response: 15500,
        response_ends_trial: false
    }
    
    timeline.push(animation_2);

    var instructTrial_animation4 = {
        type: "text",
        text: "<center><br><br><b>Now you will be performing the same task as before.<br><br>Press any key to proceed</b></center>"
    }
    
    timeline.push(instructTrial_animation4);

    for (var blockIndex = 0; blockIndex < 2; blockIndex++){
        var noSocialTrials = [[1,0,2,1,0,2,-1],[1,0,3,0,0,3,-1],                         [1,0,3,1,0,3,-1],[1,1,1,1,1,1,-1],
                              [1,1,1,1,1,2,-1],[1,1,2,1,0,1,-1],
                             [1,1,2,1,1,1,-1],[1,1,2,1,1,2,-1],[1,1,3,0,1,2,-1],[0,1,2,0,1,2,-1],
                              [0,0,1,0,1,0,1],[0,0,1,0,1,0,2],
                              [0,0,1,1,0,0,1],[0,0,1,1,0,0,2],
                              [1,0,0,0,1,0,1],[1,0,0,0,1,0,2],
                            [1,0,1,0,1,2,1],[1,0,1,0,1,2,2],
                              [0,1,3,1,0,1,1],[0,1,3,1,0,1,2]
                             ]
        //randomize order before trials start
        shuffle(noSocialTrials);   

        var noSocialLength = noSocialTrials.length;
        
        var catchNum = Math.floor(Math.random() * noSocialLength);
        console.log(catchNum);
        
        for (var i = 0; i<noSocialLength; ++i){
            var pretrial = {
                type: "text",
                text: "<center><br><br><b><br><br>Press space bar to start trial</b></center>",               
            }
            
            var trial = {
                type : "fume-animation",
                duration: main_duration,
                numBalls: main_numBalls,
                blockNum: function(){
                    return blockFin+1;
                },
                fileIndex: noSocialTrials[i][6],
                helper: noSocialTrials[i][0],
                harmer: noSocialTrials[i][1],
                helpee: noSocialTrials[i][2],
                postHelper: noSocialTrials[i][3],
                postHarmer: noSocialTrials[i][4],
                postHelpee: noSocialTrials[i][5],
                reverse: Index2Boolean(noSocialTrials[i][6]),
                flip: function(){
                    currentVentPos = Math.random() >= 0.5;
                    return currentVentPos;
                },
                colorIndex: aniIndex,
                data: function() {
                    ++trialNum;
                    return {BlockNum: blockFin + 1, 
                            TrialNum: trialNum};
                },
                on_finish: function() {
                    saveExperiment(true);
                }
            }
            
            function catchQuesChoice(flip){
                if(flip == false){
                    return 90;
                }else{
                    return 77;
                }
            }
            
            var categorization_trial = {
                type: "categorize",
                key_answer: function(){
                    return catchQuesChoice(currentVentPos);
                },
                choices: [77, 90],
                prompt: "<p class='prompt'><br><br>Press z if the red dot was on the left in the trial you just finished.<br>Press m if the red dot was on the right.</p>",
                data: function(){
                    return {CatchNum: trialNum};
                },
                on_finish: function() {
                    saveExperiment(true);
                }
            };

            timeline.push(pretrial);
            timeline.push(trial);
            if(i == catchNum){
                timeline.push(categorization_trial);
            }
        }

        var block_break = {
            type: "text",
            text:function(){
                ++blockFin;
                trialNum = 0;
                var breakText = "<center><br><br><br>You have finished " + blockFin +" of "+ totalBlocks + " blocks.<br><br>You may take a short break.<br><br>Press the space bar to continue</center>";
                if(blockFin == totalBlocks){
                    breakText = "<center><br><br><br>You have finished all " + totalBlocks +" blocks.<br><br>Press the space bar to continue</center>";
                }
                return breakText;
            }
        };
        
        timeline.push(block_break);
    }

//---------------------Pill Experiment-----------------------

   var instructTrial_pill = {
        type: "text",
        text: "<center><br><br><b>Now please read the following situation:<br><br>Imagine that, in the near future, scientists invent a compound called Salinex. Salinex is a very unique drug. It only has one effect: it causes people to feel pain. This effect is dose dependent, so that one tablet causes slight discomfort, while 4 tablets causes intense pain. Importantly, there is no lasting effect of this drug, and regardless of the dosage, the pain lasts for only a few minutes. Now imagine that you are given 3 pain tablets, and have to divide them up between each of the pairs below. Your task is simply to indicate how many pills each of these people would get. Keep in mind that some people may be more sensitive to pain than others.<br><br>Press any key to proceed</b></center>"
    }
    
    var instructTrial2_pill = {
        type: "text",
        text: '<center><br><br><b>The task will look like the following:<br><br><img src="images/pill1.png" style="width:800px;"><br><br>Press any key to proceed</b></center>'
    }

    var instructTrial3_pill = {
        type: "text",
        text: function(){
            trialNum = 0;
            return '<center><br><br><b>Your task is to drag the pills on to the names.<br><br><img src="images/pill2.png" style="width:800px;"><br><br>Please drag all the pills on to the names. Press "Done" when you are done with dragging. <br><br>Press any key to proceed</b></center>'
        }
    }
    

    timeline.push(instructTrial_pill);
    timeline.push(instructTrial2_pill);
    timeline.push(instructTrial3_pill);

    var pill_pairs = k_combinations(['Dalai Lama', 'Mother Teresa','Highschool Teacher','Radiology Technician','Orphan','Date Rape Victim','Serial Killer Ted Bundy'],2);
    
    shuffle(pill_pairs);
    
    var pillTrialLength = pill_pairs.length;

    for (var i = 0; i < pillTrialLength; ++i){
        var painpillTrial = {
            type: 'free-sort',
            stimuli: ['images/coolpill.png','images/coolpill.png','images/coolpill.png'],
            labels: randomizeArray(pill_pairs[i]),
            prompt: "<p>How would you distribute the 3 pills? </p>",
            data: function() {
                ++trialNum;
                return {PillTrialNum: trialNum};
            },
            on_finish: function() {
                saveExperiment(true);
            }
        }
    timeline.push(painpillTrial);
    }

    // Runs the experiment
    jsPsych.init({
        timeline: timeline,
        fullscreen: true,
        on_finish: function (data) {
            saveExperiment(false);
             $("body").append("The experiment is complete. Thank you very much for participating!");
            doNotClose = false;
        }
    });

    /**
     * 
     * Helper Functions
     * -----------------------------------------------------------------------------------
     * 
     **/

    function k_combinations(set, k) {
    /**
     * Copyright 2012 Akseli Palén.
     * Created 2012-07-15.
     * Licensed under the MIT license.
     */
       var i, j, combs, head, tailcombs;

        // There is no way to take e.g. sets of 5 elements from
        // a set of 4.
        if (k > set.length || k <= 0) {
            return [];
        }

        // K-sized set has only one K-sized subset.
        if (k == set.length) {
            return [set];
        }

        // There is N 1-sized subsets in a N-sized set.
        if (k == 1) {
            combs = [];
            for (i = 0; i < set.length; i++) {
                combs.push([set[i]]);
            }
            return combs;
        }
    	combs = [];
        for (i = 0; i < set.length - k + 1; i++) {
            // head is a list that includes only our current element.
            head = set.slice(i, i + 1);
            // We take smaller combinations from the subsequent elements
            tailcombs = k_combinations(set.slice(i + 1), k - 1);
            // For each (k-1)-combination we join it with the current
            // and store it to the set of k-combinations.
            for (j = 0; j < tailcombs.length; j++) {
                combs.push(head.concat(tailcombs[j]));
            }
        }
	return combs;
    }

    //This function changes file index to a boolean variable
    function Index2Boolean(index){
        if(index == 1){
            return true;
        }else if(index == 2){
            return false;
        }else{
            return Math.random() >= 0.5;
        }
    }
    
    function name2Code(name){
        if(name == "Dalai Lama"){
            return 1;
        }else if(name == "Mother Teresa"){
            return 2;
        }else if(name == "Highschool Teacher"){
            return 3;
        }else if(name == "Radiology Technician"){
            return 4;
        }else if(name == "Orphan"){
            return 5;
        }else if(name == "Date Rape Victim"){
            return 6;
        }else{
            return 7;
        }
    }

    // This function is implemented based on suggestions by StackOverflow users to use the Durstenfeld shuffle
    // forums: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    function shuffle(array) {
        for (var i = array.length - 1; i > 0; --i) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
//    function getCurrentUSDate() {
//        var currentdate = new Date();
//        var datetime = (currentdate.getMonth() + 1) + "-" +
//            currentdate.getDate() + "-" +
//            currentdate.getFullYear();
//        return datetime;
//    }
    
    function getCurrentDate() {
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "_" +
            (currentdate.getMonth() + 1) + "_" +
            currentdate.getFullYear();
        return datetime;
    }

    function deletePartialData(filename) {
        $.ajax({
            type: 'post',
            url: 'delete_data.php',
            data: { filename: filename }
        });
    }

    function saveData(filename, filedata) {
        $.ajax({
            type: 'post',
            cache: false,
            url: 'save_data.php', // this is the path to the PHP script
            data: { filename: filename, filedata: filedata }
        });
    }

    function saveExperiment(partial){
        var fullData = jsPsych.data.getData();

        // take data and output only the relevant pieces
        var fumeExpData = getDesiredData(fullData);

        // Set up the filename and final data object
        var saveName = "" + participantCode + "_" + getCurrentDate();
        var csvData = JSON2CSV(fumeExpData);

        // console.log(csvData);

        if (partial) {
            saveName += "_partial";
        } else {
            deletePartialData("" + participantCode + "_" + getCurrentDate() + "_partial" + ".csv");
        }

        // call the php script to save the data
        saveData(saveName + ".csv", csvData);           
    }

    // this function based on code suggested by StackOverflow users:
    // http://stackoverflow.com/users/64741/zachary
    // http://stackoverflow.com/users/317/joseph-sturtevant     
    function JSON2CSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var line = '';
        var result = '';
        var columns = [];
        var finish = new Date();
        var timing = (finish - start)/1000/60;

        // Writes the header, specific to this experiment
        result += '"Participant ID","' + participantCode + '"\r\n';
        result += '"Gender","' + participantGender + '"\r\n';
        result += '"Age","' + participantAge + '"\r\n';
        result += '"Date","' + getCurrentDate() + '"\r\n';
        result += '"Total ExperimentTime","' + timing + '"\r\n';
        result += '"ColorIndex","' + aniIndex + '"\r\n';
        result += '"PillNameCoding","1=Dalai Lama","2=Mother Teresa","3=Highschool Teacher","4=Radiology Technician","5=Orphan","6=Date Rape Victim","7=Serial Killer Ted Bundy"';
        result += '\r\n';
        result += '\r\n';
        result += '"BlockNum","TrialNum","Total","Duration","Reverse","RightVent","FileIndex","earlyHelperNum","earlyHarmerNum","earlyHelpeeNum","lateHelperNum","lateHarmerNum","lateHelpeeNum","NumSaved","HelperSaved","HarmerSaved","HelpeeSaved","Choice","RT",'+
            '"CategorizeChoice","CatchCorrect","CatchNum",'+
            '"leftNum","leftPerson","rightNum","rightPerson","PillRT",\r\n';

        var i = 0;
        for (var j = 0; j < array.length; ++j) {
          for (var key in array[j]) {
            var keyString = key + "";
            keyString = '"' + keyString.replace(/"/g, '""') + '",';
            if ($.inArray(key, columns) == -1) {
              columns[i] = key;
              line += keyString;
              i++;
            }
          }
        }

        for (i = 0; i < array.length; ++i) {
          line = '';
          for (j = 0; j < columns.length; ++j) {
            var value = (typeof array[i][columns[j]] === 'undefined') ? '' : array[i][columns[j]];
            var valueString = value + "";
            line += '"' + valueString.replace(/"/g, '""') + '",';
          }

          line = line.slice(0, -1);
          result += line + '\r\n';
        }

        return result;
      }

    function getDesiredData(allData){

        // Stores all the rows to record, each row is its own array within this array        
        var desiredData = [];
        var desiredDataIndex = 0;
        var blockIn = 1;
        var trialWithinBlock = 1;


        for (var i = 0; i < allData.length; ++i) {
            if (allData[i].trial_type === "fume-animation") {   

                desiredData[desiredDataIndex] = {
                    "BlockNum" : allData[i].BlockNum,
                    "TrialNum" : allData[i].TrialNum,
                    "Total": allData[i].total,
                    "Duration" : allData[i].duration,
                    "Reverse" : booleanToData(allData[i].reverse),
                    "RightVent" : booleanToData(allData[i].flip),
                    "FileIndex" : allData[i].fileIndex,
                    "earlyHelperNum" : allData[i].helperNum,
                    "earlyHarmerNum" : allData[i].harmerNum,
                    "earlyHelpeeNum" : allData[i].helpeeNum,
                    "lateHelperNum" : allData[i].postHelperNum,
                    "lateHarmerNum" : allData[i].postHarmerNum,
                    "lateHelpeeNum" : allData[i].postHelpeeNum,
                    "NumSaved": allData[i].numSaved,
                    "HelperSaved" : allData[i].helperSaved,
                    "HarmerSaved" : allData[i].harmerSaved,
                    "HelpeeSaved" : allData[i].helpeeSaved,
                    "Choice" : gridCodeToDataCode(allData[i].key_press),
                    "RT" : allData[i].rt,
                    "CategorizeChoice":-1,
                    "CatchCorrect":-1,
                    "CatchNum": -1,
                    "LeftNum":-1,
                    "Left": -1,
                    "RightNum": -1,
                    "Right":-1,
                    "PillRT": -1
                };
                desiredDataIndex++;

            }else if (allData[i].trial_type === "categorize"){
                
                desiredData[desiredDataIndex] = {
                    "BlockNum" : -1,
                    "TrialNum" : -1,
                    "Total": -1,
                    "Duration" : -1,
                    "Reverse" : -1,
                    "RightVent" : -1,
                    "FileIndex" : -1,
                    "earlyHelperNum" : -1,
                    "earlyHarmerNum" : -1,
                    "earlyHelpeeNum" : -1,
                    "lateHelperNum" : -1,
                    "lateHarmerNum" : -1,
                    "lateHelpeeNum" : -1,
                    "NumSaved": -1,
                    "HelperSaved" : -1,
                    "HarmerSaved" : -1,
                    "HelpeeSaved" : -1,
                    "Choice" : -1,
                    "RT" : -1,
                    "CategorizeChoice":allData[i].categorize_key_press,
                    "CatchCorrect":booleanToData(allData[i].correct),
                    "CatchNum": allData[i].CatchNum,
                    "LeftNum":-1,
                    "Left": -1,
                    "RightNum": -1,
                    "Right":-1,
                    "PillRT": -1
                };
                desiredDataIndex++;
            }else if (allData[i].trial_type === "free-sort"){
                desiredData[desiredDataIndex] = {
                    "BlockNum" : 8,
                    "TrialNum" : allData[i].PillTrialNum,
                    "Total": -1,
                    "Duration" : -1,
                    "Reverse" : -1,
                    "RightVent" : -1,
                    "FileIndex" : -1,
                    "earlyHelperNum" : -1,
                    "earlyHarmerNum" : -1,
                    "earlyHelpeeNum" : -1,
                    "lateHelperNum" : -1,
                    "lateHarmerNum" : -1,
                    "lateHelpeeNum" : -1,
                    "NumSaved": -1,
                    "HelperSaved" : -1,
                    "HarmerSaved" : -1,
                    "HelpeeSaved" : -1,
                    "Choice" : -1,
                    "RT" : -1,
                    "CategorizeChoice":-1,
                    "CatchCorrect": -1,
                    "CatchNum": -1,
                    "LeftNum":allData[i].leftNum,
                    "Left": name2Code(allData[i].left),
                    "RightNum": allData[i].rightNum,
                    "Right":name2Code(allData[i].right),
                    "PillRT": allData[i].pillrt
                };
                desiredDataIndex++;
            }
        }

        //console.log(desiredData);
        return desiredData;
    }
    
    function booleanToData(bool){
        if(bool){
            return 1;
        }else{
            return 0;
        }
    }

    function randomizeArray(arr){
        var temp1 =  '';
        if(Math.random()>= 0.5){
            temp1 = arr[0];
            arr[0]= arr[1];
            arr[1] = temp1;
        }
        return arr
    }

    // Maps response key code to the format expected by the data file for grid trials
    // i.e. z maps to 1, m maps to 2, otherwise it's -1
    function gridCodeToDataCode(keyCode) {
        if (keyCode === spaceBar) {
            return 1;
        } else {
            return -1;
        }
    }