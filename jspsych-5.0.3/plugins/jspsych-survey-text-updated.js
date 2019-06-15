/**
 * jspsych-survey-text
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-text-updated'] = (function() {

  var plugin = {};

  plugin.trial = function(display_element, trial) {
      
    //set up some variables  
    trial.feedback = trial.feedback || false;
    trial.timing_feedback_duration = trial.timing_feedback_duration || 3000;
    trial.no_feedback_duration = trial.no_feedback_duration||250;
    trial.a = trial.a
    trial.b = trial.b
    trial.c = trial.c
    trial.correct_ans = trial.correct_ans

      
    var timeoutSet = false

    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;
    if (typeof trial.rows == 'undefined') {
      trial.rows = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.rows.push(1);
      }
    }
    if (typeof trial.columns == 'undefined') {
      trial.columns = [];
      for (var i = 0; i < trial.questions.length; i++) {
        trial.columns.push(40);
      }
    }

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show preamble text
    display_element.append($('<div>', {
      "id": 'jspsych-survey-text-preamble',
      "class": 'jspsych-survey-text-preamble'
    }));

    $('#jspsych-survey-text-preamble').html(trial.preamble);

    // add questions
    for (var i = 0; i < trial.questions.length; i++) {
      // create div
      display_element.append($('<div>', {
        "id": 'jspsych-survey-text-' + i,
        "class": 'jspsych-survey-text-question'
      }));

      // add question text
      $("#jspsych-survey-text-" + i).append('<p class="jspsych-survey-text">' + trial.questions[i] + '</p>');

      // add text box
    $("#jspsych-survey-text-" + i).append('<input type="number" class="jspsych-survey-text-response-' + i + '" cols="' + trial.columns[i] + '" rows="' + trial.rows[i] + '"></input>');
    }

    // add submit button
    display_element.append($('<button>', {
      'id': 'jspsych-survey-text-next',
      'class': 'jspsych-btn jspsych-survey-text'
    }));
    $("#jspsych-survey-text-next").html('Submit Answer');
    var appended = false;
    $("#jspsych-survey-text-next").click(function() {
          // measure response time
          var endTime = (new Date()).getTime();
          var response_time = endTime - startTime;

          // create object to hold responses
          var question_data = {};
          $("div.jspsych-survey-text-question").each(function(index) {
            var id = "Q" + index;
            var val = $(this).children('input').value;
            var obje = {};
            obje[id] = val;
            $.extend(question_data, obje);
          });
          
          if (!appended && trial.feedback){
              var appendString = " <br><br>Your answer is "+document.getElementsByClassName("jspsych-survey-text-response-0")[0].value+", and the correct answer is " + trial.correct_ans+"."
              display_element.append(appendString);
              appended = true;
              end_trial_countdown(trial.timing_feedback_duration);
            }else{
                end_trial_countdown(trial.no_feedback_duration);
            }

          function end_trial_countdown(time){
                if (!timeoutSet) {
                    timeoutSet = true;
                    setTimeout(function() {
                        end_trial();
                    }, time);
                }
            }        


            end_trial = function() {
              // kill keyboard listeners
              if (typeof keyboardListener !== 'undefined') {
                jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
              }
              jsPsych.pluginAPI.cancelAllKeyboardResponses();

            // save data
              var trialdata = {
                "rt": response_time,
                "responses": document.getElementsByClassName("jspsych-survey-text-response-0")[0].value,
                "a": trial.a,
                "b": trial.b,
                "c": trial.c,
                "correct_ans": trial.correct_ans
              };

              display_element.html('');
              // next trial
              jsPsych.finishTrial(trialdata);
            }

    });
        

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
