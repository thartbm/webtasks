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

function start_experiment() {
    
  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");
  screenContext.canvas.width  = window.innerWidth-(2*screenoffset);
  screenContext.canvas.height = window.innerHeight-(2*screenoffset);
  cX = (screenContext.canvas.width / 2) + screenoffset; // ??? without the screenoffset...
  cY = (screenContext.canvas.height / 2) + screenoffset;
  screenCanvas.style.cursor = "none";
  
  var horizontalsquare = (screenContext.canvas.width / raster_size[0]) * 0.90;
  var verticalsquare = (screenContext.canvas.height / raster_size[1]) * 0.90;
  
  var xoffset = 0;
  var yoffset = 0;
  // define grid squares
  if (horizontalsquare > verticalsquare) {
    // height is the limiting dimension
    squaresize = verticalsquare;
    xoffset = (squaresize/2) + ((screenContext.canvas.width - (raster_size[0] * squaresize)) / 2) + screenoffset;
    yoffset = (squaresize/2) + (screenContext.canvas.height * 0.05) + screenoffset;
  } else {
    // width is the limiting dimension
    squaresize = horizontalsquare;
    xoffset = (squaresize/2) + (screenContext.canvas.width * 0.05) + screenoffset;
    yoffset = (squaresize/2) + ((screenContext.canvas.height - (raster_size[1] * squaresize)) / 2) + screenoffset;
  };
  
  grid = [];
  for (var xi=0; xi < raster_size[0]; xi++) {
    for (var yi=0; yi < raster_size[1]; yi++) {
      grid.push([(xi*squaresize)+xoffset,(yi*squaresize)+yoffset]);
    };
  };
  
  blockorder = shuffle(range(blocktypes.length));
    
  start_block();
  
  block = 0;
  
};


function start_block() {
  
  clear_screen();
  
  currentblocktype = blockorder[block % blocktypes.length];
    
  display_instruction([['press SPACE to start block '+(block+1), '#FFFFFF'], ['press E to end', '#FFFFFF']]);
  action_dict = [
                 [32, run_block],
                 [69, end_experiment]
                 ];
  
};

function run_block() {
  
  clear_screen();
  
  trialsperblock = blocktypes[currentblocktype].array_sizes.length * cuetypes.length * blocktypes[currentblocktype].trialreplications;
  trial = 1;
  
  // set the color for positive and negative cues:
  colorstopick = [];
  for (var i=0; i < colorpalette.length; i++) {
    colorstopick.push(i);
  };
  
  positivecolor = Math.floor(Math.random() * colorstopick.length);
  colorstopick.splice(positivecolor,1);
  
  negativecolor = Math.floor(Math.random() * colorstopick.length);
  colorstopick.splice(negativecolor,1);
  
  // in case the block calls for a fixed set of non-cued colors, we pick them here:
  // but we leave colorstopick alone, just in case
  if (blocktypes[currentblocktype].noncuedcolor_selection == 'fixed') {
    leftovercolors = shuffle(range(colorstopick.length));
    noncuedcolors = [];
    for (var i=0; i < blocktypes[currentblocktype].Nnoncuedcolors; i++) {
      noncuedcolors.push(colorstopick[leftovercolors[i]]);
    };
  };
  
  // set cue order for this block:
  cueorder = shuffle(range(cuetypes.length));
  
  // fill trialorder
  trialorder = [];
  var trialnumber = 0; // within block
  
  for (var ct=0; ct < cueorder.length; ct++) {
    // within cuetype we randomly assign order array sizes
    arraysizes = shuffle(replicate(blocktypes[currentblocktype].array_sizes, blocktypes[currentblocktype].trialreplications));
    for (var ctt=0; ctt < arraysizes.length; ctt++) {
      trial = [trialnumber, cueorder[ct], arraysizes[ctt]];
      trialorder.push(trial);
      trialnumber++;
    };
  };
  
  trial = 0;
  run_next_trial();
  
};

function run_next_trial() {
  
  switch (trialorder[trial][1]) {
    case 0:
      instructions = [['The target will be', '#FFFFFF'], colorpalette[positivecolor], ['','#000000'], ['press SPACE', '#FFFFFF']];
      break;
    case 1:
      instructions = [['The target will NOT be', '#FFFFFF'], colorpalette[negativecolor], ['','#000000'], ['press SPACE', '#FFFFFF']];
      break;
    case 2:
      instructions = [['press SPACE', '#FFFFFF']];
      break;
    default:
      instructions = [['something went wrong...', '#FFFFFF']];
  };
  
  display_instruction(instructions);
  
  if (blocktypes[currentblocktype].show_fixation) {
    action_dict = [[32, show_fixation]];
  } else {
    action_dict = [[32, start_trial]];
  }
  
};

function show_fixation() {
  
  clear_screen();
  
  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");  
  
  FXsize = 6;
  
  screenContext.beginPath();
  screenContext.lineWidth = FXsize / 2;
  screenContext.strokeStyle = '#FFFFFF';
  screenContext.moveTo(cX-FXsize, cY);
  screenContext.lineTo(cX+FXsize, cY);
  screenContext.stroke();
  
  screenContext.beginPath();
  screenContext.lineWidth = FXsize / 2;
  screenContext.strokeStyle = '#FFFFFF';
  screenContext.moveTo(cX, cY-FXsize);
  screenContext.lineTo(cX, cY+FXsize);
  screenContext.stroke();
  
  setTimeout(function(){start_trial();},500);
  
};

function start_trial() {

  clear_screen();
  
  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");  
  
  var locationstopick = range(grid.length);
  
//  alert(trialorder[trial][2]);
//  alert(blocktypes[currentblocktype].relevant_items);
  switch(trialorder[trial][1]) {
    case 0:
      cuedcolor = colorpalette[positivecolor];
      cuedcolorno = positivecolor;
      Nlocs = blocktypes[currentblocktype].relevant_items;
      Ndclocs = (trialorder[trial][2] - blocktypes[currentblocktype].relevant_items) / blocktypes[currentblocktype].Nnoncuedcolors;
      break;
    case 1:
      cuedcolor = colorpalette[negativecolor];
      cuecolorno = negativecolor;
      Nlocs = trialorder[trial][2] - blocktypes[currentblocktype].relevant_items;
      Ndclocs = blocktypes[currentblocktype].relevant_items / blocktypes[currentblocktype].Nnoncuedcolors;
      break;
    case 2:
      cuedcolor = ['none','none'];
      cuedcolorno = -1;
      Nlocs = 0;
      Ndclocs = trialorder[trial][2] / blocktypes[currentblocktype].Nnoncuedcolors;
      break;
    default:
      cuedcolor = ['white','#FFFFFF'];
  };
  // alert(Ndclocs);
  
  var distractorcolors = [];
  if (blocktypes[currentblocktype].noncuedcolor_selection == 'variable') {
    // reconstruct what colors are available for distractors in this block
    distractorcolorstopick = range(colorpalette.length);
    distractorcolorstopick.splice(positivecolor,1);
    distractorcolorstopick.splice(negativecolor,1);
    
    // now actually pick some distractorcolors
    for (var dc=0; dc < blocktypes[currentblocktype].Nnoncuedcolors; dc++) {
      pickcolor = Math.floor(Math.random() * distractorcolorstopick.length);
      distractorcolors.push(distractorcolorstopick[pickcolor]);
      distractorcolorstopick.splice(pickcolor,1);
    };
//    alert('variable: '+distractorcolors);
  } else {
    distractorcolors = noncuedcolors;
  };
  // alert('p '+positivecolor+', n '+negativecolor+', dc '+distractorcolors);
  
  
  // depending on array size and stuff, pick locations for each item type
  // and set the properties of those locations
  
  // select locations and assign colors to them:
  // also assign rotation directions:
  
  cuedcolorlocations = [];
  cuedlocationrotationdirections = [];
  
  
  if (cuedcolor[0] != 'none') {
    // half of Nlocs needs to have one rotation, the other half the other rotation:
    rotationdirectionstopick = [];
    for (var ccldi=0; ccldi< (Nlocs/2); ccldi++) {
      rotationdirectionstopick.push(1);
      rotationdirectionstopick.push(-1);
    };
    
    for (var cli=0; cli < Nlocs; cli++) {
      pickloc = Math.floor(Math.random() * locationstopick.length);
      cuedcolorlocations.push(locationstopick[pickloc]);
      locationstopick.splice(pickloc,1);
      
      pickdir = Math.floor(Math.random() * rotationdirectionstopick.length);      
      cuedlocationrotationdirections.push(rotationdirectionstopick[pickdir]);
      rotationdirectionstopick.splice(pickdir,1);
    };
  };
  
  
  // go through distractor locations and assign color and rotation direction:
  distractorcolorlocations = [];
  distractorcolororder = [];
  distractorlocationrotationdirections = [];
  for (var dci=0; dci < distractorcolors.length; dci++) {
//    Ndclocs = (trialorder[trial][2] - cuedcolorlocations.length) / blocktypes[currentblocktype].Nnoncuedcolors;
//    Ndclocs = (trialorder[trial][2] / 2) / Ndistractorcolors;
    rotationdirectionstopick = [];
    for (var dcldi=0; dcldi < (Ndclocs/2); dcldi++) {
      rotationdirectionstopick.push(1);
      rotationdirectionstopick.push(-1);
    };
    while (Ndclocs < rotationdirectionstopick.length) {
      rotationdirectionstopick.splice(Math.floor(Math.random() * rotationdirectionstopick.length),1)
    };
    for (var dcli=0; dcli < Ndclocs; dcli++) {
      distractorcolororder.push(distractorcolors[dci]);
      pickloc = Math.floor(Math.random() * locationstopick.length);
      distractorcolorlocations.push(locationstopick[pickloc]);
      locationstopick.splice(pickloc,1);
      
      pickdir = Math.floor(Math.random() * rotationdirectionstopick.length);
      distractorlocationrotationdirections.push(rotationdirectionstopick[pickdir]);
      rotationdirectionstopick.splice(pickdir,1);
    };
  };
  
  // select a location for the target:
  
  targetrotationdirection = ((Math.floor(Math.random() * 2)) * 2) - 1;
  targetlocation = [-1,-1];
  switch(trialorder[trial][1]) {
    case 0:
      targetlocation[0] = Math.floor(Math.random() * cuedcolorlocations.length);
      break;
    default:
      targetlocation[1] = Math.floor(Math.random() * distractorcolorlocations.length);
  };
  
  
  
  for (var ccli=0; ccli < cuedcolorlocations.length; ccli++) {
    coords = grid[cuedcolorlocations[ccli]];
    
    var X = coords[0] + (Math.random() * (squaresize*.5)) - (squaresize*.25);
    var Y = coords[1] + (Math.random() * (squaresize*.5)) - (squaresize*.25);
    
    // location circle:
    screenContext.beginPath();
    screenContext.arc(X, Y, squaresize*.25, 0, 2 * Math.PI, false);
    screenContext.fillStyle = cuedcolor[1];
    screenContext.fill();
    screenContext.lineWidth = 0;
    screenContext.strokeStyle = '#000000';
    screenContext.stroke();
    // item (angled line):
    var rotation = cuedlocationrotationdirections[ccli] * angle;
    startX = Math.cos((rotation / 180 * Math.PI) + (Math.PI * 0.5)) * (squaresize*.15);
    startY = Math.sin((rotation / 180 * Math.PI) + (Math.PI * 0.5)) * (squaresize*.15);
    endX = Math.cos((rotation / 180 * Math.PI) + (Math.PI * 1.5)) * (squaresize*.15);
    endY = Math.sin((rotation / 180 * Math.PI) + (Math.PI * 1.5)) * (squaresize*.15);
    
    screenContext.beginPath();
    screenContext.lineWidth = 2;
    screenContext.strokeStyle = '#000000';
    screenContext.moveTo(X+startX, Y+startY);
    screenContext.lineTo(X+endX, Y+endY);
    screenContext.stroke();
    
    // interuption of the line:
    if (targetlocation[0] == ccli) {
      interuptionoffset = (squaresize * -.05);
    } else {
      interuptionoffset = (squaresize * .05);
    };
    
    startX = Math.cos((rotation / 180 * Math.PI) + (Math.PI * 0.0)) * (squaresize*.1) + interuptionoffset;
    startY = Math.sin((rotation / 180 * Math.PI) + (Math.PI * 0.0)) * (squaresize*.1) + interuptionoffset;
    endX = Math.cos((rotation / 180 * Math.PI) + (Math.PI * 1.0)) * (squaresize*.1) + interuptionoffset;
    endY = Math.sin((rotation / 180 * Math.PI) + (Math.PI * 1.0)) * (squaresize*.1) + interuptionoffset;
    
    screenContext.beginPath();
    screenContext.lineWidth = 2;
    screenContext.strokeStyle = cuedcolor[1];
    screenContext.moveTo(X+startX, Y+startY);
    screenContext.lineTo(X+endX, Y+endY);
    screenContext.stroke();

    
  };
  
  for (var dcli=0; dcli < distractorcolorlocations.length; dcli++) {
    coords = grid[distractorcolorlocations[dcli]];
    
    var X = coords[0] + (Math.random() * (squaresize*.5)) - (squaresize*.25);
    var Y = coords[1] + (Math.random() * (squaresize*.5)) - (squaresize*.25);
    
    screenContext.beginPath();
    screenContext.arc(X, Y, squaresize*.25, 0, 2 * Math.PI, false);
    screenContext.fillStyle = colorpalette[distractorcolororder[dcli]][1];
    screenContext.fill();
    screenContext.lineWidth = 0;
    screenContext.strokeStyle = '#000000';
    screenContext.stroke();
    var rotation = distractorlocationrotationdirections[dcli] * angle;
    startX = Math.cos((rotation / 180 * Math.PI) + (Math.PI * 0.5)) * (squaresize*.15);
    startY = Math.sin((rotation / 180 * Math.PI) + (Math.PI * 0.5)) * (squaresize*.15);
    endX = Math.cos((rotation / 180 * Math.PI) + (Math.PI * 1.5)) * (squaresize*.15);
    endY = Math.sin((rotation / 180 * Math.PI) + (Math.PI * 1.5)) * (squaresize*.15);
    
    screenContext.beginPath();
    screenContext.lineWidth = 2;
    screenContext.strokeStyle = '#000000';
    screenContext.moveTo(X+startX, Y+startY);
    screenContext.lineTo(X+endX, Y+endY);
    screenContext.stroke();
    
    // interuption of the line:
    if (targetlocation[1] == dcli) {
      interuptionoffset = (squaresize * -.05);
    } else {
      interuptionoffset = (squaresize * .05);
    };
    
    startX = Math.cos((rotation / 180 * Math.PI) + (Math.PI * 0.0)) * (squaresize*.1) + interuptionoffset;
    startY = Math.sin((rotation / 180 * Math.PI) + (Math.PI * 0.0)) * (squaresize*.1) + interuptionoffset;
    endX = Math.cos((rotation / 180 * Math.PI) + (Math.PI * 1.0)) * (squaresize*.1) + interuptionoffset;
    endY = Math.sin((rotation / 180 * Math.PI) + (Math.PI * 1.0)) * (squaresize*.1) + interuptionoffset;
    
    screenContext.beginPath();
    screenContext.lineWidth = 2;
    screenContext.strokeStyle = colorpalette[distractorcolororder[dcli]][1];
    screenContext.moveTo(X+startX, Y+startY);
    screenContext.lineTo(X+endX, Y+endY);
    screenContext.stroke();

  };
  
  var d = new Date();
  trialstarttimestamp = d.getTime();
  
  action_dict = [[37, finish_trial, 0], [39, finish_trial, 1]];
  
};


function finish_trial(answer) {
  
  // process the answer somehow
  
  var RT = lasteventtimestamp - trialstarttimestamp;
  
  trial++;
  clear_screen();
  if (trial == trialsperblock) {
    block++;
    setTimeout(start_block, 1000);
  } else {
    setTimeout(run_next_trial, 200);
  };
  
};

function end_experiment() {
  
  clear_screen();
  display_instruction([['Thanks!','#FFFFFF']]);
  action_dict = [];
  
};

function clear_screen() {
  
  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");
  screenContext.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
  
};


function display_instruction(text) {
  
  clear_screen();
  showFillText(text);

};


function showFillText(text) {

  var screenCanvas  = document.getElementById("screen");
  var screenContext = screenCanvas.getContext("2d");
  var x = (screenCanvas.width / 2) + screenoffset;
  var y = (screenCanvas.height / 2) + screenoffset;
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

// variables defining the experiment:

var cuetypes = ['positive', 'negative', 'neutral'];
//var array_sizes = [12];
var raster_size = [16, 12];
//var trialreplications = 5;
//var trialsperblock = array_sizes.length * cuetypes.length * trialreplications;
var trialsperblock = 0;


var blocktypes = [

// check for serial search with various array sizes
// doesn't work yet: no stimulus shown...
//{
//array_sizes: [6,12,18,24,30],
//relevant_items: [3,6,9,12,15],
//array_type: 'random',
//Nnoncuedcolors: 3,
//noncuedcolor_selection: 'variable',
//item_type: 'dash',
//show_fixation: false,
//trialreplications: 1
//},

// condition mimicking experiment with Günter:
// positive and negative cues can be the same color
{
array_sizes: [12],
relevant_items: [6],
array_type: 'random',
Nnoncuedcolors: 3,
noncuedcolor_selection: 'variable',
item_type: 'dash',
show_fixation: false,
trialreplications: 5
},

// Günters Experiment (GE) with 2 distractor colors
// distractor colors can be same as negative color
//{
//array_sizes: [12],
//relevant_items: [6],
//array_type: 'random',
//Nnoncuedcolors: 2,
//noncuedcolor_selection: 'variable',
//item_type: 'dash',
//show_fixation: false,
//trialreplications: 5
//},

// GE with 1 distractor color
//{
//array_sizes: [12],
//relevant_items: [6],
//array_type: 'random',
//Nnoncuedcolors: 1,
//noncuedcolor_selection: 'variable',
//item_type: 'dash',
//show_fixation: false,
//trialreplications: 5
//},

// GE with fixed distractor colors
// fixed colors are the same for all cue types... change this?
//{
//array_sizes: [12],
//relevant_items: [6],
//array_type: 'random',
//Nnoncuedcolors: 3,
//noncuedcolor_selection: 'fixed',
//item_type: 'dash',
//show_fixation: false,
//trialreplications: 5
//},

// GE with 2 fixed distractor colors
// also fixed colors same for all cue types
//{
//array_sizes: [12],
//relevant_items: [6],
//array_type: 'random',
//Nnoncuedcolors: 2,
//noncuedcolor_selection: 'fixed',
//item_type: 'dash',
//show_fixation: false,
//trialreplications: 5
//},

// GE with 1 fixed distractor
//{
//array_sizes: [12],
//relevant_items: [6],
//array_type: 'random',
//Nnoncuedcolors: 1,
//noncuedcolor_selection: 'fixed',
//item_type: 'dash',
//show_fixation: false,
//trialreplications: 5
//},

// Stimulus for comparison with Arita et al / Beck&Hollingworth type stimuli:
// circular display with harder to find target ("hard seriality")
//{
//array_sizes: [12],
//relevant_items: [6],
//array_type: 'circular',
//Nnoncuedcolors: 3,
//noncuedcolor_selection: 'variable',
//item_type: 'dash',
//show_fixation: true,
//trialreplications: 5
//},

// Arita et al / Beck&Hollingworth type stimuli:
// circular display with a somwewhat more conspicuous target than what we use
// ("soft serialty")
//{
//array_sizes: [12],
//relevant_items: [6],
//array_type: 'circular',
//Nnoncuedcolors: 3,
//noncuedcolor_selection: 'variable',
//item_type: 'cross',
//show_fixation: true,
//trialreplications: 5
//},

// Arita et al / Beck&Hollingworth type stimuli with more useful cue
// it excludes 75% of items not 50%
//{
//array_sizes: [12],
//relevant_items: [9],
//array_type: 'circular',
//Nnoncuedcolors: 1,
//noncuedcolor_selection: 'variable',
//item_type: 'cross',
//show_fixation: true,
//trialreplications: 5
//}

];

// kicked out conditions:


////{
////array_sizes: [12],
////relevant_items: [9],
////array_type: 'circular',
////Nnoncuedcolors: 3,
////noncuedcolor_selection: 'variable',
////item_type: 'dash',
////show_fixation: true,
////trialreplications: 5
////},
////{
////array_sizes: [12],
////relevant_items: [6],
////array_type: 'circular',
////Nnoncuedcolors: 1,
////noncuedcolor_selection: 'variable',
////item_type: 'dash',
////show_fixation: true,
////trialreplications: 5
////},
////{
////array_sizes: [12],
////relevant_items: [9],
////array_type: 'circular',
////Nnoncuedcolors: 1,
////noncuedcolor_selection: 'variable',
////item_type: 'dash',
////show_fixation: true,
////trialreplications: 5
////},
////{
////array_sizes: [12],
////relevant_items: [6],
////array_type: 'circular',
////Nnoncuedcolors: 1,
////noncuedcolor_selection: 'variable',
////item_type: 'cross',
////show_fixation: true,
////trialreplications: 5
////},
////{
////array_sizes: [12],
////relevant_items: [9],
////array_type: 'circular',
////Nnoncuedcolors: 1,
////noncuedcolor_selection: 'variable',
////item_type: 'cross',
////show_fixation: true,
////trialreplications: 5
////},
////{
////array_sizes: [12],
////relevant_items: [6],
////array_type: 'circular',
////Nnoncuedcolors: 1,
////noncuedcolor_selection: 'fixed',
////item_type: 'cross',
////show_fixation: true,
////trialreplications: 5
////},



//var colorpalette = [
//  ['red','#FF0000'],
//  ['green','#008000'],
//  ['blue','#0000FF'],
//  ['orange','#FF4500'],
//  ['purple','#800080'],
//  ['yellow','#FFFF00'],
//  ['pink','#FFC0CB'],
//  ['brown','#A52A2A']];


// seven colors on "RGB cube vertices":

var colorpalette = [
  ['red','#FF0000'],
  ['yellow','#FFFF00'],
  ['green','#00FF00'],
  ['cyan','#00FFFF'],
  ['blue','#0000FF'],
  ['magenta','#FF00FF'],
  ['gray','#999999']      // maybe we don't want this "color"
  ];

// eight maximally opposed colors from czech color picker:

//var colorpalette = [
//  ['red', '#FF0000'],
//  ['orange', '#FF8000'], // flush orange, orange
//  ['tangerine', '#FFCC00'], // orange yellow, tangerine
//  ['lime', '#CCFF00'], // ELECTRIC LIME, GREEN YELLOW, LIME, LIME GREEN
//  ['green', '#00CC00'], // GREEN
//  ['blue', '#0066BB'], // blue / science blue
//  ['violet', '#330099'], // BLUE VIOLET, PIGMENT INDIGO
//  ['magenta', '#990099']  // DEEP PINK, FLIRT, FUCHSIA, FUSCHIA, HOT PINK, MAGENTA
//  ];

// 10 colors picked using the "distinguishable_colors" function:
// in L*a*b color space (related to CIE, but supposedly matching perception)
// ("maximally different" from each other as well as black background)

var colorpalette = [
  ['green',      '#00FF00'],
  ['blue',       '#0000FF'],
  ['red',        '#FF0000'],   
  ['cyan',       '#00F6FF'],    // 00FFFF is websafe
  ['pink',       '#FF7BDC'],    // FF66CC is websafe
  ['orange',     '#FFDC7B'],    // FFCC66 is websafe
  ['light blue', '#008DFF'],    // 0099FF is websafe
  ['dark green', '#006A09'],    // 006600 is websafe
  ['dark red',   '#9E4635'],    // 993333 is websafe
  ['violet',     '#3E006A']     // 330066 is websafe
  ];

// also "maximally different" from white

var colorpalette = [
  ['blue',        '#0000FF'],
  ['red',         '#FF0000'],
  ['green',       '#00FF00'],
  ['pink',        '#FF1AB9'],  // FF33CC
  ['yellow',      '#FFD300'],  // FFCC00
  ['sky blue',    '#0084F6'],  // 0099FF  use another blue?
  ['dark lime',   '#008D46'],  // 009933
  ['orange',      '#A7613E'],  // 996633
  ['indigo',      '#4F006A'],  // 660066  violet?
  ['cyan',        '#00FFF6']   // 00FFFF
  ];

var angle = 10;

// bookkeeping variables:
var action_dict = [];

var block = 0;
var trial = 0;

var trialstarttimestamp = 0;
var lasteventtimestamp = 0;

var colorstopick = [];
var positivecolor = -1;
var negativecolor = -1;
var neutralcolor  = -1;
var noncuedcolors = [];
var cueorder = [];

var trialorder = [];
var squaresize = -1;
var grid = [];

var screenoffset = 3;
var cX = 0;
var cY = 0;

var blockorder = [];
var currentblocktype = -1;
