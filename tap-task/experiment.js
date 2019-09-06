function process_input(event) {
  
  // event.keyCode
  // keycodes:
  // 32: space
  // 81: q
  // 69: e
  // 37: left
  // 38: up
  // 39: right
  // 40: down
  
  var ed = new Date();
  lasteventtimestamp = ed.getTime();
  
  for (var i = 0; i < action_dict.length; i++) {
    action = action_dict[i];
    if (action[0] == event.keyCode) {
      if (action.length == 2) {
        action[1]();
      } else if (action.length == 3) {
        action[1](action[2]);
      };
    }
  }
  
  // event.timeStamp

};

function initialize() {
  
  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");
  screenContext.canvas.width  = window.innerWidth-(2*screenoffset);
  screenContext.canvas.height = window.innerHeight-(2*screenoffset);
  cX = (screenContext.canvas.width / 2) + screenoffset; // ??? without the screenoffset...
  cY = (screenContext.canvas.height / 2) + screenoffset;
  screenCanvas.style.cursor = "none";
  
  // generate rhythms for the session
  generate_rhythms();
  
  start_trial();
  
};


function generate_rhythms() {
  
  // will generate 10 times 10 period sets (or interval sets):
  
  for (var setn=0; setn < 10; setn++) {
    
    var one_set = [];
    
    // first 5 are constant:
    for (var j=0; j < 5; j++){
      one_set[j] = set_periods[j];
    };
    
    // generate 5 'random' ones:
    
    // first three should be relatively simple:
    one_set[5] = [Math.floor(Math.random() * 801) + 800];
    one_set[6] = [Math.floor(Math.random() * 451) + 350];
    one_set[7] = [Math.floor(Math.random() * 201) + 150];
    
    // then one with a somewhat fast interval, and a slightly longer one
    base_interval = Math.floor(Math.random() * 301) + 300;
    ratio = (Math.random() / 2.5) + 1.1;
    one_set[8] = [base_interval, Math.floor(base_interval*ratio)];
    
    // finally a somewhat fast interval, with a slightly longer one and a much longer one
    base_interval = Math.floor(Math.random() * 151) + 350;
    ratio1 = (Math.random() / 5.0) + 1.15;
    ratio2 = (Math.random() / 2.0) + 1.5;
    one_set[9] = [Math.floor(base_interval*ratio1), base_interval, Math.floor(base_interval*ratio2)];
    
    // get them in random order:
    one_set = shuffle(one_set);
     
    // save these 10 rhythm definitions in the shuffled_periods array;
    for (var j=0; j < one_set.length; j++) {
      shuffled_periods[(setn*10) + j] = one_set[j]
    };
  
  };
  
  var temptimer = 0;
  var thisrhythm = [];
  
  // loop through interval definitions:
  
  for (var ps = 0; ps < shuffled_periods.length; ps++) {
    intervals = shuffled_periods[ps];
    
    // generate a 10 second rhythm based on the interval definition:
    temptimer = 0;
    thisrhythm = [];
    // keep adding ticks until the 10 s mark is reached:
    while (temptimer < 10001) {
      // determine which interval is up, based on the length of the existing rhythm:
      thisinterval = intervals[thisrhythm.length % intervals.length];
      temptimer = temptimer + thisinterval;
      // if the next tick is still below 10 s, add it to the rhythm:
      if (temptimer < 10001) {
        thisrhythm[thisrhythm.length] = temptimer;
      };
    };
    
    // add the rhythm to the expeirmental set:
    shuffled_rhythms[ps] = thisrhythm;

  };
    
};

function start_trial() {
  
  clear_screen();
  
  display_instruction([['press SPACE to start trial '+(trial+1), '#FFFFFF'], ['press Q to quit', '#FFFFFF']]);
  
  action_dict = [
                 [32, run_trial],
                 [81, end_experiment]
                 ];
  
};

function run_trial() {
  
  // generate a rhythm
  
  // first iteration of code:
  //  rhythm = [1000,2000,3000,4000,5000,6000,7000,8000,9000,10000];
  
  // second iteration of code:
  // rhythms = [[1000,2000,3000,4000,5000,6000,7000,8000,9000,10000],[400,800,1200,1600,2000,2400,2800,3200,3600,4000,4400,4800,5200,5600,6000,6400,6800,7200,7600,8000,8400,8800,9200,9600,10000],
  // [250,500,750,1000,1250,1500,1750,2000,2250,2500,2750,3000,3250,3500,3750,4000,4250,4500,4750,5000,5250,5500,5750,6000,6250,6500,6750,7000,7250,7500,7750,8000,8250,8500,8750,9000,9250,9500,9750,10000],[500,1200,1700,2400,2900,3600,4100,4800,5300,6000,6500,7200,7700,8400,8900,9600], [400,750,1350,1750,2100,2700,3100,3450,4050,4450,4800,5400,5800,6150,6750,7150,7500,8100,8500,8850,9450,9850]];
  
  // periods = [[1000],[400],[250],[500,700],[400,350,600]];
  
  // rhythm_idx = Math.floor(Math.random() * rhythms.length);
  // rhythm = rhythms[rhythm_idx];
  
  // stimuli[trial] = periods[rhythm_idx];
  
  // third iteration of code:
  
  // rather than picking one at random here
  // we generate a trial order on loading of the page
  // and then select the one corresponding to trial number
  // the rhythms are actually generated from the periods
  // and there are 5 set periods and these are interleaved with
  // 5 random periods, repeated 10 times,
  // gives 100 different rhythms to generate
  
  rhythm = shuffled_rhythms[trial % 100];
  stimuli[trial] = shuffled_periods[trial % 100];
  
  var d = new Date();
  trialstarttimestamp = d.getTime();
  
  // create timed calls to play the metronome at correct moments
  for (var j=0; j < rhythm.length; j++) {
    switch(j % 3) {
    case 0:
      setTimeout(function(){metronome_1.play();},rhythm[j]);
      break;
    case 1:
      setTimeout(function(){metronome_2.play();},rhythm[j]);
      break;
    case 2:
      setTimeout(function(){metronome_3.play();},rhythm[j]);
      break;
    default:
      setTimeout(function(){metronome_0.play();},rhythm[j]);
      break;
    } 
  };
  
  update_timer();  
  
  // create empty array to collect responses:
  responses[trial] = new Array;
  
  // set action dict to collect responses only:  
  action_dict = [
                 [32, collect_response],
                 ];
  
};


function update_timer() {
  
  var total_time = sum(trial_duration);
  var d = new Date();  
  elapsed_time = d.getTime() - trialstarttimestamp;  
  prop_time = elapsed_time/total_time;
  
  timer_color = '#999999';
  if (elapsed_time > trial_duration[0]) {
    timer_color = '#00FF00';
  };
  if (elapsed_time > total_time) {
    timer_color = '#FF0000';
  };
  
  clear_screen();
  
  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");    
  var endAngle = ((prop_time * 2) - 0.5) * Math.PI;
  
  screenContext.beginPath();
  screenContext.lineWidth = 6;
  screenContext.strokeStyle = timer_color;
  screenContext.arc(cX, cY, 25, -.5 * Math.PI, endAngle);
  screenContext.stroke();
    
  if (elapsed_time < total_time) {
    setTimeout(function(){update_timer();}, timer_updates);
  } else {
    end_trial();
  };
  
};

function collect_response() {
  
  var RT = lasteventtimestamp - trialstarttimestamp;
  responses[trial].push(RT);
  
};

function end_trial() {
  
  trial++;
  setTimeout(function(){clear_screen();}, 500);
  setTimeout(function(){start_trial();}, 1000);
  
};

function end_experiment() {
  
  clear_screen();
  display_instruction([['Thanks!','#FFFFFF']]);
  action_dict = [];
  
  setTimeout(function(){makeMailForm();},1000);
    
};


function makeMailForm() {

  var mailWindow = window.open("", "_blank", "toolbar=no, scrollbars=yes, resizable=yes, top=500, left=500, width=600, height=400");
  
  mailWindow.document.write("<html><head><title>Data mail form</title></head><body style='background-color:transparent'> &nbsp;<br \><form method='post' action='/specials/mailform/tapform.php'><table border='0'><tr><td>Name: </td><td><input type='text' name='name' maxlength='127'></td></tr><tr><td>E-mail address: </td><td><input type='text' name='email' maxlength='127'></td></tr><tr><td>Subject: </td><td><input type='text' name='subject' maxlength='127' value=''></td></tr><tr><td valign='top'>Message: </td><td><textarea name='message' rows='10' cols='50' maxlength='1023'></textarea></td></tr><tr><td> &nbsp;</td><td align='right'><input type='submit' name='verzend' value='Send' /></td></tr></table></form></body></html>")
  
  fdata = "";
  
  for (var tn=0; tn<responses.length; tn++) {
    
    fdata += "trial:" + tn + "\n";
    
    fdata += "stimuli:";
    
    for (var j=0; j<stimuli[tn].length; j++) {
      if (j>0) {
        fdata += ",";
      };
      fdata += stimuli[tn][j];
    };
    
    fdata += "\n";
    
    fdata += "responses:";
    
    for (var j=0; j<responses[tn].length; j++) {
      if (j>0) {
        fdata += ",";
      };
      fdata += responses[tn][j];
    };
    
    fdata += "\n";
    
  };
  
  mailWindow.document.getElementsByName("message")[0].value = fdata;
  
};


function clear_screen() {
  
  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");
  screenContext.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
  
};


function display_instruction(text) {
  
//  clear_screen();
  showFillText(text);

};


function showFillText(text) {
  
  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");
  var x = cX;
  var y = cY;
  screenContext.font = '20px sans-serif';
  screenContext.textBaseline = 'bottom';
  screenContext.textAlign = 'center';
  var lineheight = 30;
  y = y - (text.length * lineheight / 2);
  for (var lineno = 0; lineno < text.length; lineno++) {
    screenContext.fillStyle = text[lineno][1];
    screenContext.fillText(text[lineno][0], x, y);
    y = y + lineheight;
  };
  
};


function range(number) {
  
  V = [];
  
  for (var vi=0; vi < number; vi++) {
    V.push(vi);
  };
  
  return V;
  
};

function shuffle(V) {
  
  number = V.length;
  shuffledV = [];
  
  for (var vi=0; vi < number; vi++) {
    index = Math.floor(Math.random() * V.length);
    shuffledV.push(V[index]);
    V.splice(index,1);
  }
  
  return shuffledV;
  
};

function replicate(V,number) {
  
  var replicatedV = []
  
  for (var r=0; r < number; r++) {
    for (var ind=0; ind < V.length; ind++) {
      replicatedV.push(V[ind]);
    };
  };
  
  return replicatedV;

};

function sum(V) {
  
  s = 0;
  for (var vi=0, n=V.length; vi<n; vi++) {
    s += V[vi];
  };
  
  return s;
  
};

// hacky fix for firefox skipping beats

var metronome_1 = new Audio("short_tick.wav"); // should buffer when created
metronome_1.preload = "auto";
metronome_1.play(); // some browsers might need this

var metronome_2 = new Audio("short_tick.wav"); // should buffer when created
metronome_2.preload = "auto";
metronome_2.play(); // some browsers might need this

var metronome_3 = new Audio("short_tick.wav"); // should buffer when created
metronome_3.preload = "auto";
metronome_3.play(); // some browsers might need this

var metronome_0 = new Audio("short_tick.wav"); // should buffer when created
metronome_0.preload = "auto";
metronome_0.play(); // some browsers might need this


var trial_duration = [10000,10000]; // duration the rhythm is played, duration the rhythm can be replicated 
var timer_updates = 123; // show visual timer updates every X ms

var cX = 1;
var cY = 1;
var screenoffset = 10;

var trial = 0;
var trialstarttimestamp = 0;
var lasteventtimestamp = 0;

var stimuli = []; // store stimulus timing in nested array
var responses = []; // store key press timing in nested array

var set_periods = [[1000],[400],[250],[500,700],[400,350,600]];
var shuffled_periods = [];
var shuffled_rhythms = [];
