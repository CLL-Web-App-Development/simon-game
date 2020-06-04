// alert("Alert from game.js");
//$("h1")

const buttonColors = ["red", "blue", "green", "yellow"];
var gamePattern=[];
var userChosenPattern=[];

var level = 0; // Challenge level
var seqGenInterval; // To store an instance of timer created with setInterval.
var isGameOver = false; // flag to track the game progress.
var isChallengeComplete = false; // flag to track if the user input size matches the
                                     // game pattern size or not.

// Register click event listeners to all the buttons derived from <div> elements
buttonColors.forEach((buttonColor, i) => {
  console.log("registering click event callback for button: " + buttonColor);
  $("#"+buttonColor).on("click", function(event){
    console.log(event.target);
    var buttonId = $(event.target).attr("id");

    if((buttonId != undefined) && (buttonColors.includes(buttonId))){

      console.log("userChosenColor:"+buttonId);
      // Start animation, play sound and capture user chosen pattern.

      var hasPatternMismatch = false; // Boolean to know if the user chosen pattern mismatched
                                                                // the generated game pattern.

      // Check if existing user chosen pattern matches the generated game pattern.
      // Remember that at each challenge, game generates one additional button press,
      // but, user has to reproduce the entire pattern starting from level-1 all the way
      // to the pattern in this level. Hence, the logging of pattern and the check in a loop
      // for the entire sequence.
      generatedSequenceLength = gamePattern.length;
      loggedUserSequenceLength = userChosenPattern.length;

      if(loggedUserSequenceLength <= generatedSequenceLength-1){
        userChosenPattern.forEach((item, index) => {
          if(item !== gamePattern[index]){
            hasPatternMismatch = true;
          }
        });
      }

      if(!hasPatternMismatch){ // if entire logged user sequence matches with game sequence,
                            // check the current user input, tagged with buttonId/buttonColor,
                            // which is not yet logged to the userChosenPattern array.
        if(buttonColor !== gamePattern[loggedUserSequenceLength]){
          hasPatternMismatch = true;
        }
      }



      setTimeout(animatePlayAudioAndLogPattern(buttonColor, userChosenPattern, hasPatternMismatch), 2000); // Don't need if-else as appropriate action for
                                                                                         // mismatch will be handled in animatePlayAudioLogPattern.
                                                                                         // Has been given a timeout as the event of setTimeout for
                                                                                         // generateNextLevelSequence() is getting executed right when
                                                                                         // the animation for current button press is happening,
                                                                                         // Probably because there would be nothing else in the event
                                                                                         // queue, if this animate method is not set with a timeout,
                                                                                         // sequencing the event of generating next level after the
                                                                                         // current button press animation.

      // User sequence size matches the generated game pattern at this point.
      // Whether it is the right sequence or not is captured in the flag hasPatternMismatch
      if(!hasPatternMismatch && (userChosenPattern.length === gamePattern.length)){
        isChallengeComplete = true;
      }


      if(hasPatternMismatch){
        console.log("pattern mismatch: user chosen color - " + buttonId + ", generated color: " + gamePattern[level-1] + "\n");

        setTimeout(() => {
          $("body").addClass("game-over");
          $("h1").text("Game Over, Press any key to restart");
        }, 200);

        setTimeout(() => {
          $("body").removeClass("game-over");
        }, 1000)

        registerKeyPressToStartGame(); // register keypress event on the whole document again
                                       // and start the game through event callback

        // // Remove registered click event listeners for all buttons
        // buttonColors.forEach((buttonColor, i) => {
        //   $("#"+buttonColor).off("click");
        // });

      }
      // Moved the logic to generate next sequence on challenge completion to the animatePlayAudioAndLogPattern
      // in order to properly sequence the end of the last button press in the user sequence and the start of the
      // next level

      //else if(isChallengeComplete){ // challenge complete without pattern mismatch, so, generate the next sequence

        // setTimeout(generateNextLevelSequence(), 25000); // Generate next level sequence after a timeout allowing smooth
        //                                                 // transition. Gibing a time of 20 seconds or 20,000 milliseconds
        //                                                 // to allow the animation with sound to complete (in 12 seconds),
        //                                                 // before transitioning to the next level and giving user a chance
        //                                                 // to notice the pattern in next level.
      //}


    } // end of if((buttonId != undefined) && (buttonColors.includes(buttonId)))

  });
});


function animatePlayAudioAndLogPattern(buttonColor, patternCollection, playWrongPatternSound){
  // Start animation and play sound
  setTimeout(function(){
    $("#"+buttonColor).addClass("pressed");

    if(playWrongPatternSound){
      playButtonAudio("wrong");
    }
    else{
      playButtonAudio(buttonColor);
    }

  }, 500);


  // End animation after a second from the start
  setTimeout(function(){
    $("#"+buttonColor).removeClass("pressed");

    // This check will be tru only when invoked as part of event handling for keypress from user,
    // not the game generated sequence animation, as isChallengeComplete is set to false in generateNextLevelSequence()
    // which is the scheduled callback method after the timeout.
    if(isChallengeComplete){
      setTimeout(generateNextLevelSequence(), 30000); // Generate next level sequence after a timeout allowing smooth
                                                      // transition. Gibing a time of 20 seconds or 20,000 milliseconds
                                                      // to allow the animation with sound to complete (in 12 seconds),
                                                      // before transitioning to the next level and giving user a chance
                                                      // to notice the pattern in next level.
    }
  }, 1000);


  // Log the pattern
  patternCollection.push(buttonColor);
  console.log(patternCollection);
}


function playButtonAudio(buttonColor){
  var audio = new Audio("sounds/"+buttonColor+".mp3");
  audio.play();
}


function nextSequence(){
  const randomNumber=Math.floor(Math.random()*(buttonColors.length));
  const randomChosenColor=buttonColors[randomNumber];

  // Animate the sequence, play sound and log pattern
  animatePlayAudioAndLogPattern(randomChosenColor, gamePattern, false);

}


// Method to generate the sequence for next level
function generateNextLevelSequence(){

  // Heading related logic placed here to co-ordinate with the sequence generation
  level++; // Challenge level
  $("h1").text("Level " + level); // Change the heading

  // for(var i=1; i<=(2*seqSize); i+=2){
  //   var animeStartTime= 2*i*500;
  //   var animeEndTime= 2*(i+1)*500;
  //   console.log("animeStartTime: "+animeStartTime);
  //   console.log("animeEndTime: "+animeEndTime);
  //   nextSequence(animeStartTime, animeEndTime);
  // }

  userChosenPattern = []; // Clear the user chosen pattern for next level
  isChallengeComplete = false; // Reset the challenge completion flag to track all user input
                               // against the complete game generated sequence until now +
                               // the sequence going to be generated in the call to nextSequence
                               // below.
  nextSequence();

}


// Logic to track the initial key press, register listener for keypress event,
// start the game and de-register listener for keypress event.
var initialKeyPress = false;

// Method to start the game.
function startGame(){
  // Logic to run levels of game, generating random sequences, capturing and comparing
  // user pressed sequences to drive the game progress.

  // Reset level and game pattern array
  level = 0;
  gamePattern = [];

  generateNextLevelSequence();

  //seqGenInterval = setInterval(genSeqOverInterval, 1200);

} // end of startGame()

// Method to register keypress event and start the game through the event callback.
function registerKeyPressToStartGame(){
  $(document).on("keypress", (keyPressEvent) => {
    console.log(keyPressEvent.code);
    console.log("Callback for registered keypress event");
    initialKeyPress = true;
    $(document).off("keypress");
    console.log("De-registered the keypress event at document level");
    startGame();
  });
}

$(document).ready(registerKeyPressToStartGame);
