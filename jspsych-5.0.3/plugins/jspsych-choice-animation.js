// this is the name by which our main experiment file can call this plugin
jsPsych.plugins['choice-animation'] = (function() {

  var plugin = {};

  // this is a required element of a plugin
  plugin.trial = function(display_element, trial) {
      
    // we have defined the animation so it responds to these keys as right or left pushes
    var rightKey = 77;
    var leftKey = 90;
      
     // allow variables as functions
    // this allows any trial variable to be specified as a function
    // that will be evaluated when the trial runs. this allows users
    // to dynamically adjust the contents of a trial as a result
    // of other trials, among other uses. you can leave this out,
    // but in general it should be included
    trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);
      
    // this specifies the default parameters to use if they are not
    // given by the user
    trial.feedback = trial.feedback || false;
    trial.first = trial.first || false;
    trial.prompt = trial.prompt || "";
    trial.balanceTilt = trial.balanceTilt || "center";
      
    // if we are giving the user feedback, we will count to a higher
    // number after hitting the shapes so that there is time to
    // show feedback before ending the trial
    if (trial.feedback){
        trialEndedMax = 120;
    } else {
        trialEndedMax = 30;
    }
      
    // if we have a prompt, display that here
    if (trial.prompt !== "") {
      display_element.append('<center><b>' + trial.prompt + '</b></center>');
    }
      
    // set the appropriate width and height for the display element
    display_element.width("1200px");
    display_element.height(Math.min(($(window).innerHeight()-170), 750));
     
    // set the variables to be used by the paper.js animation
    trialEnded = false; 
    fallDuration = trial.fallDuration; 
    leftCount = trial.leftCount; 
    leftColor = trial.leftColor; 
    leftShape = trial.leftShape; 
    rightCount = trial.rightCount; 
    rightColor = trial.rightColor; 
    rightShape = trial.rightShape; 
    balanceTilt = trial.balanceTilt;
      
    // set shape sizes depending on their color
    shapeSizes = {};
      shapeSizes["blue"] = 60;
      shapeSizes["orange"] = 45;
      shapeSizes["black"] = 75;
    
    // append a jspsych canvas to the trial's display element
    // this is what we "draw" the animation on
    display_element.append('<style>canvas {width: 100%; height: 100%;} </style>');
    display_element.append('<canvas id="myCanvas"></canvas>');
      
    // sets up the canvas we added for use with paper.js
    paper.setup(document.getElementById("myCanvas"));

    /////////////////////////////////////////
    // paper.js portion -- the animation
    /////////////////////////////////////////
      
    trialEndedCounter = 0;
    appended = false;
    keyPressed = false;

    // this generates the collision animation in a random direction
    collisionsX = [];
    collisionsY = [];
    collisionTally = 0;

    maxVal = Math.max(leftCount, rightCount);

    for (var i=0; i < maxVal; i++){
        var collisionRand = 4*Math.PI*Math.random(); 
        collisionsX.push((4*Math.cos(collisionRand)));                  
        collisionsY.push((4*Math.sin(collisionRand)));
    }
      
    // we find out the screen height so that nothing in the animation will get cut out
    screenHeight = view.size.height;

    // the positions around which the waiting shapes will be centered
    shapeCenterLeft = new Point(view.center.x-235, screenHeight-95);
    shapeCenterRight = new Point(view.center.x+235, screenHeight-95);
    shapeCollisionLeft = new Path.Circle(shapeCenterLeft, 5);
    shapeCollisionRight = new Path.Circle(shapeCenterRight,5);
    collided = false;

    // these will track if the user has decided to make the ball fall
    // one direction or the other
    fallRight = false;
    rightBalancePoint = new Path.Circle(new Point(view.center.x+100,screenHeight-130),10);

    fallLeft = false;
    leftBalancePoint = new Path.Circle(new Point(view.center.x-100,screenHeight-130),10);

    // the start and end directions for moving back and forth, chosen randomly
    // right is 1, left is 0
    currentDirection = Math.round(Math.random());
    finalDirection = Math.round(Math.random());

    // this keeps track of how many times we've switched direction so far
    toggleTally = 0;

    // the top of the balance, which the ball is falling onto
    balanceTop = new Point(view.center.x, screenHeight-220);

    // has the red ball finished falling from the top of the screen to the balance?
    finishedFalling = false;

    // the bounds of the balance, to help with the rolling animation
    balanceRect = new Rectangle(new Point(view.center.x-175, screenHeight-395), [350,350]);
    balanceRect.selected = true;

    // the ball that falls down
    var ball = new Path.Circle({
        center: [view.center.x, 100],
        radius: 30,
        fillColor: 'red'
    });

    // we want to know how far the ball and balance are from
    // each other starting out so we can ensure that the falling
    // action takes the same amount of time no matter the screen height
    var startDistance = balanceTop.y-ball.position.y;
      
    // the balance that can be moved left and right
    var balance = new Path.Rectangle({
        point: [view.center.x-125, screenHeight-195],
        size: [250,10],
        fillColor: 'black'
    });

    // if balanceTilt variable was passed as left or right,
    // we set it in the chosen position to begin
    if (balanceTilt == 'left'){
        balance.rotate(-25);
        fallLeft = true;
    } else if (balanceTilt == 'right'){
        balance.rotate(25);
        fallRight = true;
    }

    // define the waiting shapes on the left according to passed parameters
    leftShapes = [];
    for (var i = 0; i<leftCount; i++){
        var leftOne = new Path();
        var increment = shapeSizes[leftColor];
        var lilInc = increment-10;
        leftOne.add(new Point (shapeCenterLeft.add([-increment*i,0])));
        leftOne.add(new Point(shapeCenterLeft.add([-(increment*i+lilInc/2),-increment])));
        leftOne.add(new Point(shapeCenterLeft.add([-(increment*i+lilInc),0])));
        leftOne.add(new Point(shapeCenterLeft.add([-(increment*i+lilInc/2), -increment/3])));
        leftOne.closed = true;
        leftOne.fillColor = leftColor;
        leftShapes.push(leftOne);
    }

    // define the waiting shapes on the right according to passed parameters
    rightShapes = [];
    for (var i = 0; i<rightCount; i++){ 
        var rightOne = new Path();
        var increment = shapeSizes[rightColor];
        var lilInc = increment-10;
        rightOne.add(new Point(shapeCenterRight.add([increment*i,0])));
        rightOne.add(new Point(shapeCenterRight.add([increment*i+lilInc/2,-increment])));
        rightOne.add(new Point(shapeCenterRight.add([increment*i+lilInc,0])));
        rightOne.add(new Point(shapeCenterRight.add([increment*i+lilInc/2, -increment/3])));
        rightOne.closed = true;
        rightOne.fillColor = rightColor;
        rightShapes.push(rightOne);
    }
        
    // this is the onFrame event that occurs 60 times per second
    // essentially, it's what makes the animation happen
    // with each new frame, we move the shapes on the canvas a certain
    // amount according to their current position
    view.onFrame = function(event)  {

        // if the ball is falling right
        if (fallRight){
            
            // if the balance has not yet reached the rightBalancePoint, we rotate it
            // a little more
            if (!balance.intersects(rightBalancePoint)){

                balance.rotate(2);

                // if the ball is on the balance (and thus finishedFalling == true)
                // we need to move the ball in such a way that looks like the balance is carrying it
                if (finishedFalling && ball.isInside(balanceRect)){
                    var xdistance = ball.position.x - balance.position.x;
                    ball.position = ball.position.add([0, -xdistance*Math.tan(2)/60]);
                }
            }
        }

        // if the ball is falling left
        if (fallLeft){
            
            // if the balance has not yet reached the leftBalancePoint, we rotate it
            // a little more to the left
            if (!balance.intersects(leftBalancePoint)){

                balance.rotate(-2);                 

                // if the ball is on the balance (and thus finishedFalling == true)
                // we need to move the ball like the balance is carrying it
                if (finishedFalling && ball.isInside(balanceRect)){
                    var xdistance = ball.position.x - balance.position.x;
                    ball.position = ball.position.add([0, -xdistance*Math.tan(-2)/60]);
                }
            }
        }

        // if the ball has NOT finished falling, we need to move it closer to the balance
         if (!finishedFalling){
            
            // we find the remaining distance between the ball and the balance
            var distanceLeft = balanceTop.y - ball.position.y;
            
            // if that distance is greater than five, we move it closer
            if (distanceLeft > 5){
                // the amount we move it is the startDistance divided by the fallDuration*60
                // this is so the fallDuration will be the same even on browsers with different heights
                ball.position = ball.position.add([0,startDistance/(fallDuration*60)]);
                
            // otherwise, we set finishedFalling to true
            }  else {
                finishedFalling = true;
            }

        // else if we HAVE finished falling to the balance AND the balance has been tilted one way or the other
        // AND the ball hasn't exited the balanceRect 
        // then we need to move the ball according to its positioning
        } else if ((fallRight || fallLeft) && ball.isInside(balanceRect)){
            var changeY = (balance.segments[2]._point._y - balance.segments[1]._point._y)/(fallDuration*60);
            var changeX = (balance.segments[2]._point._x - balance.segments[1]._point._x)/(fallDuration*60);

            if (fallLeft){
                changeX = changeX*-1;
                changeY = changeY*-1;
            }

            ball.position = ball.position.add([changeX, changeY]);

        // else if we have finished falling and the ball HAS exited the balanceRect
        } else if (!ball.isInside(balanceRect)){

            // if we're colliding left (and the ball position is less than the balance position)
            if (ball.position.x - balance.position.x < 0) {

                // if we have collided, we just need to do our collision animation
                if (ball.intersects(shapeCollisionLeft) || ball.intersects(shapeCollisionRight) || collided){
                    collided = true;
                    
                    // do the collision animation here for 90 counts
                    if (collisionTally<90){
                        for (var i = 0; i<leftCount; i++){
                            // we rotate and move the shapes randomly, making them 98% their size with each frame
                            leftShapes[i].rotate(3);
                            leftShapes[i].position = leftShapes[i].position.add([-Math.abs(collisionsX[i]), collisionsY[i]]);
                            leftShapes[i].scale(.98);
                        }
                        collisionTally++;

                    // if we have reached the 90 counts
                    } else {
                        
                        // if they asked for trial feedback, we display it
                        if (!appended && trial.feedback){
                            var appendString = "<h2>You <font color=\"red\">killed</font> " + leftCount + " " + leftColor + " " + leftShape;
                            if (leftCount>1){
                                appendString = appendString + "s";
                            }
                            appendString = appendString + " and <font color=\"green\">saved</font> " + rightCount + " " + rightColor + " " + rightShape;
                            if (rightCount>1){
                                appendString = appendString + "s</h2>";
                            }

                            display_element.append(appendString);
                            appended = true;
                        }

                        trialEndedCounter++;
                        
                        // once we have counted up the 
                        if (trialEndedCounter>trialEndedMax){
                            end_trial();
                        }
                    }

                } else {
                    var changeY = (shapeCollisionLeft.position.y - ball.position.y);
                    var changeX = (shapeCollisionLeft.position.x - ball.position.x);
                    ball.position = ball.position.add([Math.round(changeX/Math.sqrt(changeX*changeX+changeY*changeY))*(3/fallDuration), Math.round(changeY/Math.sqrt(changeX*changeX+changeY*changeY))*(3/fallDuration)]);
                }

            // if we're colliding right
            } else {

                // if we have already collided, we just need to do our collision animation
                if (ball.intersects(shapeCollisionLeft) || ball.intersects(shapeCollisionRight) || collided){
                    collided = true;

                    // do the collision animation here
                    if (collisionTally<90){
                        for (var i = 0; i<rightCount; i++){
                            rightShapes[i].rotate(3);
                            rightShapes[i].position = rightShapes[i].position.add([Math.abs(collisionsX[i]), collisionsY[i]]);
                            rightShapes[i].scale(.98);
                        }
                        collisionTally++;
                    } else {
                        
                        if (!appended && trial.feedback){
                            var appendString = "<h2>You <font color=\"red\">killed</font> " + rightCount + " " + rightColor + " " + rightShape;
                            if (rightCount>1){
                                appendString = appendString + "s";
                            }
                            appendString = appendString + " and <font color=\"green\">saved</font> " + leftCount + " " + leftColor + " " + leftShape;
                            if (leftCount>1){
                                appendString = appendString + "s</h2>";
                            }

                            display_element.append(appendString);
                            appended = true;
                        }
                        
                        trialEndedCounter++;
                        if (trialEndedCounter>trialEndedMax){
                            end_trial();
                        }

                    }


                } else {
                    var changeY = (shapeCollisionRight.position.y - ball.position.y);
                    var changeX = (shapeCollisionRight.position.x - ball.position.x);
                    ball.position = ball.position.add([Math.round(changeX/Math.sqrt(changeX*changeX+changeY*changeY))*(3/fallDuration), Math.round(changeY/Math.sqrt(changeX*changeX+changeY*changeY))*(3/fallDuration)]);
                }
            }

        // else if we HAVE finisehd falling AND the balance is even, 
        // we will move the ball back and forth a few times until
        // it falls off one way or the other
        } else {

            // we're going right
            if (currentDirection == 1){

                ball.position = ball.position.add([4/fallDuration,0]);

                if (ball.position.x >= view.center.x + 50){
                    if (!(toggleTally >= 3 && finalDirection == currentDirection)){
                        currentDirection = 0;
                        toggleTally++;
                    }
                }

            // we're going left
            } else {

                ball.position = ball.position.add([-4/fallDuration,0]);

                if (ball.position.x <= view.center.x - 50){
                    if (!(toggleTally >= 3 && finalDirection == currentDirection)){
                        currentDirection = 1;
                        toggleTally++;
                    }
                }

            }


        }
        
        // this is the most important part -- this causes paper js to actually draw
        // all the changes we have made to the ball/balance/shape position in this
        // frame
        view.draw();

    }
    
    ///////////////////////////////////////////////////
    // end paper.js portion
    ///////////////////////////////////////////////////
      
    // store response
    var response = {
      rt: -1,
      key: -1
    };
      
    // function to end trial when it is time
    // this is called within the onFrame function, once the ball
    // has collided with the shapes, the shapes have finished
    // their collision animation, and the feedback has been displayed 
    // if it was supposed to
    end_trial = function() {
      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }
        
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "key_press": response.key,
        "leftCount": trial.leftCount,
        "leftShape": trial.leftShape,
        "leftColor": trial.leftColor,
        "rightCount": trial.rightCount,
        "rightShape": trial.rightShape,
        "rightColor": trial.rightColor
      };
        
        view.onFrame = null;
        view.off('frame');
        
        display_element.html("");
        
        jsPsych.finishTrial(trial_data);
        
    };
      
    // function to handle responses by the subject
    var after_response = function(info) {
        
      if (!keyPressed){
          // if the participant pressed the right key,
          // we set fallLeft false, fallRigth true, and
          // mark that a key has been pressed (we mark)
          // this to ensure a participant can only make
          // a choice once
           if (info.key == rightKey) {
                fallLeft = false;
                fallRight = true;
                keyPressed = true;
            }

            if (info.key == leftKey){
                fallLeft = true;
                fallRight = false;
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
        valid_responses: [rightKey, leftKey],
        rt_method: 'date',
        persist: false,
        allow_held_key: false
    });
      
  };

  return plugin;
    
})();
