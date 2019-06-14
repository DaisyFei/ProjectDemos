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

    var trialNum = 0;
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
    
    var participantCode = decodeURIComponent($.urlParam('MID'));


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

//    var MTurkID = {
//        type: "survey-text",
//        questions: ["Please enter your MTurk ID"],
//        on_finish: function (data) {
//            var responses = JSON.parse(data.responses);
//            participantCode = responses.Q0.substr(0,2);
//        }
//    };
//
//    timeline.push(MTurkID);

   var randomCode = 100000 + Math.floor(Math.random() * 99999);   

        //////////////////////
        ///Read in the file///
        ////////////////////// 

        // Holds all of the data
        var dataSet=[];

        // The number of lines of data in the file
        var dataLineTotal = 50;

        // Holds the value of the data line currently being processed
//        var dataLine;

        // Request object that sends the file request
//        var dataReq = new XMLHttpRequest();
//
//        dataReq.onreadystatechange = function() {
//
//            // When the data file is opened, if it succeeds, process the data
//            if (this.readyState === 4 && this.status === 200) {
//            // This splits the data into dataSet by line, and then splits
//                // it again to have arrays within dataSet with individual string
//                // values for each data entry.
//                dataSet = (dataReq.responseText).split("\n");
//                for (dataLine = 0; dataLine < dataLineTotal; ++dataLine) {
//                        dataSet[dataLine] = dataSet[dataLine].split(",");
//                }
//            //console.log(dataSet);
//            }
//
//        };
//        
//        var fileRoute = "trials.csv";
//
//        // Sends the request for the data of filename.format
//        dataReq.open("GET", fileRoute, false);
//        dataReq.send();

        for(var i = 0; i<50;i++){
            var count = i+1;
            var A = Math.round(Math.random()*5);
            var B = Math.round(Math.random()*12);
            var C = Math.round(Math.random()*9);
            var Out = C*2+B/2-A;
            var trial = [count,A,B,C,Out];
            dataSet.push(trial);
        }
 
        //////////////////////
        ///       End      ///
        ////////////////////// 

   var instruction_screen_1 = {
        type: "text",
        text: function(){
            return '<center><br><br>Welcome to the experiment!<br>Please read all instructions carefully. </center><p style="margin-left: 20%; margin-right: 20%; text-align:left;"><br><br>This experiment will ask you to predict an outcome number from three numbers. On each trial, you will see the numbers presented in the following way. <br><br><center><img src="images/inst1.png" style="width:800px;"></center><br><br><p style="margin-left: 20%; margin-right: 20%; text-align:left;">The three numbers are combined according to a fixed rule, and please try your best on learning the rule from each trial. You will be paid a bonus if you achieve high accuracy in predicting the outcome number. There will be 50 trials total. <br>When you are finished, you will get a code. Please copy the code for your payment in M-turk. <br><br>Press any key to continue';
        }
    };
    
    
    var instruction_screen_2 = {
        type: "text",
        text: '<p style="margin-left: 20%; margin-right: 20%; text-align:left;"><br><br>You will start by looking at a few practice trials. You will not make any predictions in these trials. The outcome will be shown to you in these trials. Please try to use these trials in help you learn the rule.<br><br>Press any key to to begin.'
    }
    
    timeline.push(instruction_screen_1);
    timeline.push(instruction_screen_2);

//Practice

    pset = [[3,2,6,10],[1,3,5,10.5],[7,4,1,-3]]
    shuffle(pset)  
    
    for (var p = 0; p < pset.length; p++){
        var ptrial = {
            type: "text",
            text:"The three numbers are:"+"<br><br>A: "+pset[p][0]+"<br>B: "+pset[p][1]+"<br>C: "+pset[p][2]+"<br><br><br> The output number is "+pset[p][3]+"<br><br> Press any key to continue."
        }
        timeline.push(ptrial);
    }

// Instruction After Practice

    var instruction_screen_3 = {
        type: "text",
        text: '<p style="margin-left: 20%; margin-right: 20%; text-align:left;"><br><br><br>You have finished the practice trials. Please proceed to the main task. You will make 100 predictions. <br><br>Press any key to to begin.'
    }
    
    timeline.push(instruction_screen_3);

// Main Experiment
    shuffle(dataSet)
    console.log(dataSet)
    
    for (var i = 0; i< dataLineTotal; i++){
        var trial = {
            type: "survey-text-updated",
            questions:["The three numbers are:"+"<br><br>A: "+dataSet[i][1]+"<br>B: "+dataSet[i][2]+"<br>C: "+dataSet[i][3]+"<br><br> What is the output number?"],
            a:dataSet[i][1],
            b:dataSet[i][2],
            c:dataSet[i][3],
            feedback: true,
            correct_ans: dataSet[i][4],
            data: function(){
                ++trialNum;
                return{TrialNum: trialNum};
            },
            on_finish: function() {
                saveExperiment(true);
            }
        }

        timeline.push(trial);
    }


    // Asks for the user's participant id and starts timing the experiment as well as shuffling the arrays
    // that need to be randomized
    
    
//Demographics
    var instruction_screen_3 = {
        type: "text",
        text: '<p style="margin-left: 20%; margin-right: 20%; text-align:left;"><br><br>You are about to complete this HIT. Please answer the next few questions. Your answers won\'t affect your payment.'
    }

    var gender_block = {
        type: "survey-multi-choice",
        questions: ["What is your gender?"],
        options: [["Male", "Female", "Prefer not to say"]],
        on_finish: function (data) {
            var responses = JSON.parse(data.responses);
            participantGender = responses.Q0;
            saveExperiment(true);
        }  
    };

    var age_block = {
        type: "survey-text",
        questions: ['<p style="margin-left: 20%; margin-right: 20%; text-align:left;">What is your age?<br>If you prefer not to say, leave the response area blank.'],
        on_finish: function (data) {
            var responses = JSON.parse(data.responses);
            participantAge = responses.Q0.substr(0,2);
        }
    };

    timeline.push(instruction_screen_3);
    timeline.push(gender_block);
    timeline.push(age_block);


    // Runs the experiment
    jsPsych.init({
        timeline: timeline,
        fullscreen: true,
        on_finish: function (data) {
            saveExperiment(false);
             $("body").append("The experiment is complete. Thank you very much for participating! Your code for M turk is LPCE"+randomCode);
            doNotClose = false;
        }
    });

    /**
     * 
     * Helper Functions
     * -----------------------------------------------------------------------------------
     * 
     **/


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
        var saveName = "" + randomCode + "_" + getCurrentDate();
        var csvData = JSON2CSV(fumeExpData);

        // console.log(csvData);

        if (partial) {
            saveName += "_partial";
        } else {
            deletePartialData("" + randomCode + "_" + getCurrentDate() + "_partial" + ".csv");
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
        result += '"Participant ID","' +participantCode + '"\r\n';
        result += '"Gender","' + participantGender + '"\r\n';
        result += '"Age","' + participantAge + '"\r\n';
        result += '"Validation Code","' + randomCode + '"\r\n';
        result += '"Date","' + getCurrentDate() + '"\r\n';
        result += '"Total ExperimentTime","' + timing + '"\r\n';
        result += '\r\n';
        result += '"TrialNum","a","b","c","correct_ans","response","rt",\r\n';

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
            if (allData[i].trial_type === "survey-text-updated") {   

                desiredData[desiredDataIndex] = {
                    "TrialNum" : allData[i].TrialNum,
                    "a" : allData[i].a,
                    "b" : allData[i].b,
                    "c": allData[i].c,
                    "correct_ans" : allData[i].correct_ans,
                    "response" : allData[i].responses,
                    "rt" : allData[i].rt,
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

    // Maps response key code to the format expected by the data file for grid trials
    // i.e. z maps to 1, m maps to 2, otherwise it's -1
    function gridCodeToDataCode(keyCode) {
        if (keyCode === spaceBar) {
            return 1;
        } else {
            return -1;
        }
    }    
    
    function randomizeArray(arr){
        temp =  '';
        if(Math.random()>= 0.5){
            temp = arr[0];
            arr[0]= arr[1];
            arr[1] = temp;
        }
        return arr
    }
   
