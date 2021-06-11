window.addEventListener('DOMContentLoaded', (event) => {
  document.documentElement.classList.add('js');
  
  let isAndroid = false;
  let isIOS = false;

  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(userAgent)) {
    isAndroid = true;
  }
  if (userAgent.match(/iPhone|iPad|iPod/i)) {
    isIOS = true;
  }

  if (isIOS) {
    document.body.classList.add('ios');
  }
  if (isAndroid) {
    document.body.classList.add('android');
  }

  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

// Password game

// MANAGEMENT VARIABLES

let currentRule;
let question = 0;
let score;
let passwordChecker;
let passwordGood;

// Final stats
let finalPassword;
let finalChoices = [];
let finalCodeFragment;

let rulePassed = 0;

let longEnough;

let currentRuleDescription = []; //test
let filterList = []; // test

//const totalQuestions = 30;

let timePlayed = 0;
let timeClock;

//let testvar = 'test';

let dice;
const diceRoll = (array) => {
    let i = Math.floor(Math.random() * array.length);
    return i;
};

//let currentBranch = 'a';
let pruneBranch;

// GAMESTATE

let gameState = {
    pickMirrors: false,
    pickWheel: false,
    takeArtifact: false,
    leaveArtifact: false,
    surrenderPolice: false,
    resistPolice: false,
    visitLake: false,
    visitStore: false,
    viewArtifact: false,
    rejectArtifact: false,
    stopDriving: false,
    keepDriving: false,
    stayOutside: false,
    goInside: false,
    manEyes: '',
    womanDress: ''
};

let gameResults = {
    pickMirrors: 'You visited the hall of mirrors.',
    pickWheel: 'You visited the ferris wheel.',
    takeMirror: 'You took the mirror shard.',
    leaveMirror: 'You left the mirror shard.',
    takeBox: 'You took the unlabeled box.',
    leaveBox: 'You left the unlabeled box.',
    surrenderPolice: 'You surrendered to the police.',
    viewMirror: 'You looked in the mirror.',
    rejectMirror: 'You rejected the mirror.',
    viewBox: 'You opened the box.',
    rejectBox: 'You rejected the box.',
    stopBox: 'You stopped to close the box.',
    driveBox: 'You ignored the opening box.',
    stopMirror: 'You stopped to save the officer.',
    driveMirror: 'You drove away with the mirror.',
    resistPolice: 'You resisted the police.',
    visitLake: 'You stopped at the deep lake.',
    diveLake: 'You dove into the lake.',
    watchLake: 'You stared into the lake.',
    visitLot: 'You stopped at the unfamiliar store.',
    enterStore: 'You entered the store.',
    outsideStore: 'You fell asleep in the parking lot.'
};

let secretCode = {
    viewMirror: 'why',
    rejectMirror: 'doesn\'t',
    viewBox: 'our',
    rejectBox: 'air',
    stopBox: 'taste',
    driveBox: 'the',
    stopMirror: 'way',
    driveMirror: 'it',
    diveLake: 'did',
    watchLake: 'back,',
    enterStore: 'in',
    outsideStore: '2023?'
};

finalCodeFragment = secretCode.stopBox;

let fullSecretCode = 'whydoesn\'tourairtastethewayitdidbackin2023?';



// Add a series of objects for the different levels of challenge

const questionLevel = [
{
    rank: 1,
    min: 4,
    max: 43,
},
{
    rank: 2,
    min: 8,
    max: 16,
},
{
    rank: 3,
    min: 8,
    max: 16,
},
{
    rank: 4,
    min: 8,
    max: 16,
},
{
    rank: 5,
    min: 8,
    max: 16,
},
{
    rank: 6,
    min: 8,
    max: 16,
},
{
    rank: 7,
    min: 8,
    max: 16,
},
{
    rank: 8,
    min: 8,
    max: 16,
},
{
    rank: 9,
    min: 8,
    max: 16,
},
{
    rank: 10,
    min: 1,
    max: 20,
},

/*{
    name: 'medium',
    rank: 2,
    min: 12,
    max: 16,
    timer:60
},
{
    name: 'hard',
    rank: 3,
    min: 14,
    max: 18,
    timer:60
},
{
    name: 'nightmare',
    rank: 4,
    min: 24,
    max: 28,
    timer:60
}*/
];

/* RULES for different password levels
    Length
    Must contain x of y character types
    Must contain x specific character at position y
    Must contain single digits that add up to x
    Must contain the first name of a member of the Beatles
    Must contain none of x letters/numbers/symbols
    Must contain a palindrome: https://www.freecodecamp.org/news/two-ways-to-check-for-palindromes-in-javascript-64fea8191fd7/
    Must contain a US president's surname
    Must include the US state with the best (regional fair|fleamarket|roadside attraction)
    Must begin with the freeway where your car breaks down
    Must contain the number of eyes of the service station clerk
    Must include the dollar value of the unlabeled box
    Must end with whether he will sell the box
    (if yes) Must decide whether you will steal the box
    Must decide whether to open the box
    (if not) Must include the date the box is stolen
    (if so) Must include the order you pull the 5 nails
    Must begin with the 
    Must contain the date of your death
    Must include whether you will see the sky burn
    Must end with the last ocean to drain
    Must contain the year of the final darkness
*/

const ruleReq = {
    name: 'Includes at least one uppercase letter, lowercase letter, number, and special character',
    //name: 'Begins with a US interstate highway',
    rank: 0,
    exp: "(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[:#?!@$%^&*-\])",
    //exp: "(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)",
    //exp:"^.*(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)$",
    //exp:'^[i](nterstate)?[-]?[1-9].*$',
    cased: true
    //cased: false
};

const ruleGeneric = [
{
    name: 'Includes a question mark',
    rank: 1,
    exp: "\\?",
    cased:false
},
{
    name: 'Contains the letter \'E\'',
    rank: 1,
    exp: 'e',
    cased: false
},
{
    name: 'Contains a Zodiac sign',
    rank: 2,
    exp: "aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces",
    cased:false
},
{
    name: 'Includes a presidential surname',
    rank: 2,
    exp: "adams|arthur|biden|buchanan|bush|carter|cleveland|clinton|coolidge",
    cased: false
},
{
    name: 'Must contain a palindrome',
    rank: 4,
    exp: "tk",
    cased:false
},
{
    name: 'Contains the first name of a Beatle',
    rank: 3,
    exp: "john|paul|george|ringo",
    cased: false
}
];

// STORY RULES

const ruleStory = [
{
    name: 'Includes an exclamation point',
    rank: 1,
    exp: "!",
    cased:false,
    active: true,
    requires: [],
    timeline:'a'
},
{
    name: 'Includes the state with the best traveling carnival',
    rank: 2,
    exp: "alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|newhampshire|newjersey|newmexico|newyork|northcarolina|northdakota|ohio|oklahoma|oregon|pennsylvania|rhodeisland|southcarolina|southdakota|tennessee|texas|utah|vermont|virginia|washington|westvirginia|wisconsin|wyoming",
    cased: false,
    active: true,
    requires: [],
    timeline:'a'
},
{
    name: 'Starts with the fair price of a carnival ticket',
    rank: 3,
    exp: "^[\$][0-9]+.*$",
    cased: false,
    active: true,
    requires: [],
    timeline:'a'
},
{
    name: 'Includes the superior attraction: ferris wheel or hall of mirrors',
    rank: 3,
    exp: "ferriswheel|hallofmirrors",
    cased: false,
    active: true,
    requires: [],
    timeline:'a'
},

// Q4 WHEEL BRANCH

{
    name: 'Contains the height (in feet) where your ferris wheel stops',
    rank: 4,
    exp: "[1-9]{1}[0-9]+",
    cased: false,
    active: true,
    requires: ['pickWheel'],
    timeline:'b'
},
{
    name: 'Contains the eye color of the strange man beside you',
    rank: 4,
    exp: "blue|black|green|hazel|white|brown|gold|red",
    cased: false,
    active: true,
    requires: ['pickWheel'],
    variable: 'manEyes'
},
{
    name: 'Contains the shape of the box he leaves',
    rank: 5,
    exp: "rectangular|rectangle|square|round|circle|rhomboid|rhombus|triangle|triangular|spherical|sphere|pentagon|hexagon|octogon|nonagon|decagon|hendecagon|dodecagon",
    cased: false,
    active: true,
    requires: ['pickWheel'],
    timeline:'b'
},
{
    name: 'Ends with whether you take the unlabeled box',
    rank: 5,
    exp: "^.*yes|no$",
    cased: false,
    active: true,
    requires: ['pickWheel'],
    timeline:'b'
},

// Q4 MIRROR BRANCH
{
    name: 'Contains the dress color of the woman who joins you in the hall of mirrors',
    rank: 4,
    exp: "red|green|blue|purple|black|white|silver|gold|orange|pink|violet|yellow|brown",
    cased: false,
    active: true,
    requires: ['pickMirrors'],
    variable: 'womanDress'
},
{
    name: 'Contains the room number where the woman smashes the glass',
    rank: 4,
    exp: "[0-9]+",
    cased: false,
    active: true,
    requires: ['pickMirrors'],
    timeline:'c'
},
{
    name: 'Contains the length (in inches) of the fresh cut on your finger',
    rank: 5,
    exp: "[1-4]",
    cased: false,
    active: true,
    requires: ['pickMirrors'],
    timeline:'c'
},
{
    name: 'Ends with whether you take the mirror shard',
    rank: 5,
    exp: "^.*yes|no$",
    cased: false,
    active: true,
    requires: ['pickMirrors'],
    timeline: 'c'
},
// BACK TO A
{
    name: 'Includes the time you run back to your car',
    rank: 6,
    exp: "(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)",
    cased: false,
    active: true,
    requires: [],
    timeline: 'a'
},
{
    name: 'Includes how many miles over the speed limit you\'re driving',
    rank: 6,
    exp: "[1-7][0-9]",
    cased: false,
    active: true,
    requires: [],
    timeline: 'a'
},
{
    name: 'Contains the interstate where the sirens start',
    rank: 6,
    exp: "[i](nterstate)?[-]?[1-9]",
    cased: false,
    active: true,
    requires: [],
    timeline: 'a'
},

// COMBINATORIAL EXPLOSION STARTS

{
    name: 'Starts with the minutes until the officer sees the stolen box',
    rank: 7,
    exp: "^[1-9].*$",
    cased: false,
    active: true,
    requires: ['pickWheel','takeArtifact'],
    timeline: 'bd'
},
{
    name: 'Includes whether you resist or surrender',
    rank: 7,
    exp: "resist|surrender",
    cased: false,
    active: true,
    requires: ['pickWheel','takeArtifact'],
    timeline: 'bd'
},
{
    name: 'Starts with the minutes until the officer sees the bloody mirror',
    rank: 7,
    exp: "^[1-9].*$",
    cased: false,
    active: true,
    requires: ['pickMirrors','takeArtifact'],
    timeline: 'ce'
},
{
    name: 'Includes whether you resist or surrender',
    rank: 7,
    exp: "resist|surrender",
    cased: false,
    active: true,
    requires: ['pickMirrors','takeArtifact'],
    timeline: 'ce'
},
{
    name: 'Includes the amount of your speeding ticket',
    rank: 7,
    exp: "[\$][1-9][0-9]",
    cased: false,
    active: true,
    requires: ['leaveArtifact'],
    timeline: 'f'
},
{
    name: 'Includes the rate of your beating heart',
    rank: 7,
    exp: "[1-9][0-9]{1,2}",
    cased: false,
    active: true,
    requires: ['leaveArtifact'],
    timeline: 'f'
},
{
    name: 'Ends where you stop to rest: deep lake or parking lot',
    rank: 7,
    exp: "^.*lake|lot$",
    cased: false,
    active: true,
    requires: ['leaveArtifact'],
    timeline: 'f'
},
// QUESTION 8
// Go with officer and box/mirror
{
    name: 'Contains the time you enter the holding cell',
    rank: 8,
    exp: "(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)",
    cased: false,
    active: true,
    requires: ['takeArtifact','surrenderPolice'],
    timeline: 'bdg'
},
{
    name: function() {
        return 'Contains the number of teeth in the ' + gameState.manEyes + '-eyed man\'s smile'
   },
    rank: 8,
    exp: "[2-9][0-9]",
    cased: false,
    active: true,
    requires: ['pickWheel','takeArtifact','surrenderPolice'],
    timeline: 'bdg',
    function:true
},
{
    name: 'Ends with the man\'s invitation: open the box?',
    rank: 8,
    exp: "^.*yes|no$",
    cased: false,
    active: true,
    requires: ['pickWheel','takeArtifact','surrenderPolice'],
    timeline: 'bdg'
},
{
    name: function() {
        return 'Contains the number of buttons on the ' + gameState.womanDress + '-clad woman\'s dress'
   },
    rank: 8,
    exp: "[1-9][0-9]?",
    cased: false,
    active: true,
    requires: ['pickMirrors','takeArtifact','surrenderPolice'],
    timeline: 'ceg',
    function:true
},
{
    name: 'Ends with her command: look in the mirror shard?',
    rank: 8,
    exp: "^.*yes|no$",
    cased: false,
    active: true,
    requires: ['pickMirrors','takeArtifact','surrenderPolice'],
    timeline: 'ceg'
},
// Resist officer with box/mirror
{
    name: 'Contains the foot you use to hit the gas',
    rank: 8,
    exp: "left|right",
    cased: false,
    active: true,
    requires: ['pickWheel','takeArtifact','resistPolice'],
    timeline: 'ceg'
},
{
    name: 'Includes the time the box flies from the seat',
    rank: 8,
    exp: "(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)",
    cased: false,
    active: true,
    requires: ['pickWheel','takeArtifact','resistPolice'],
    timeline: 'ceg'
},
{
    name: 'Ends with a conundrum: close the box or drive?',
    rank: 8,
    exp: "^.*close|drive$",
    cased: false,
    active: true,
    requires: ['pickWheel','takeArtifact','resistPolice'],
    timeline: 'ceg'
},
// Resist officer with mirror
{
    name: 'Contains the hand you use to grab the mirror',
    rank: 8,
    exp: "left|right",
    cased: false,
    active: true,
    requires: ['pickMirrors','takeArtifact','resistPolice'],
    timeline: 'ceg'
},
{
    name: 'Contains the angle the shard hits flesh',
    rank: 8,
    exp: "[1-2]?[1-9][0-9]",
    cased: false,
    active: true,
    requires: ['pickMirrors','takeArtifact','resistPolice'],
    timeline: 'ceg'
},
{
    name: 'Ends with a thought: do you regret it?',
    rank: 8,
    exp: "^.*yes|no$",
    cased: false,
    active: true,
    requires: ['pickMirrors','takeArtifact','resistPolice'],
    timeline: 'ceg'
},
// Get speeding ticket and visit lake/lot
{
    name: 'Starts with the color of the lake',
    rank: 8,
    exp: "^blue|brown|black|white|clear|red|green|navy|teal.*$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake'],
    timeline: 'ceg'
},
{
    name: 'Contains its greatest attribute: a clear mirror or a great depth',
    rank: 8,
    exp: "mirror|depth",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake'],
    timeline: 'ceg'
},
{
    name: 'Contains the height of the boxy store beyond the lot',
    rank: 8,
    exp: "[1-9][0-9]feet|ft|meters|m",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot'],
    timeline: 'ceg'
},
{
    name: 'Contains the number of its glass doors that are broken',
    rank: 8,
    exp: "[1-9]",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot'],
    timeline: 'ceg'
},
{
    name: 'Ends with a decision: go inside?',
    rank: 8,
    exp: "^.*yes|no$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot'],
    timeline: 'ceg'
},

// QUESTIONS 9/10
// Look into the box
{
    name: 'Begins with the seconds it takes to snap the latch',
    rank: 9,
    exp: "^[1-9].*$",
    cased: false,
    active: true,
    requires: ['takeArtifact','viewArtifact','surrenderPolice','pickWheel'],
    timeline: 'ceg'
},
{
    name: 'Includes the color of the emptiness inside',
    rank: 9,
    exp: "black|blue|void|nothing|white|clear|brown|red",
    cased: false,
    active: true,
    requires: ['takeArtifact','viewArtifact','surrenderPolice','pickWheel'],
    timeline: 'ceg'
},
{
    name: 'Ends with the time the man says: \"Don\'t worry. You\'ll know soon.\"',
    rank: 9,
    exp: "^.*(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)$",
    cased: false,
    active: true,
    requires: ['takeArtifact','viewArtifact','surrenderPolice','pickWheel'],
    timeline: 'ceg'
},
{
    name: 'Enter the date (DD/MM/YYYY) the first stars burn out. It\'s sooner than you think.',
    rank: 10,
    exp: "(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})",
    cased: false,
    active: true,
    requires: ['takeArtifact','viewArtifact','surrenderPolice','pickWheel'],
    timeline: 'ceg'
},
// Resist the box
{
    name: 'Begins with the number of pinpricks the box leaves on your hand',
    rank: 9,
    exp: "^[1-9].*$",
    cased: false,
    active: true,
    requires: ['takeArtifact','rejectArtifact','surrenderPolice','pickWheel'],
    timeline: 'ceg'
},
{
    name: 'Contains the sound of the man clearing his throat',
    rank: 9,
    exp: "hem|ahem",
    cased: false,
    active: true,
    requires: ['takeArtifact','rejectArtifact','surrenderPolice','pickWheel'],
    timeline: 'ceg'
},
{
    name: 'Ends with the time the man says: \"Hm. I\'m sure the next vessel will cooperate.\"',
    rank: 9,
    exp: "^.*(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)$",
    cased: false,
    active: true,
    requires: ['takeArtifact','rejectArtifact','surrenderPolice','pickWheel'],
    timeline: 'ceg'
},
{
    name: 'Enter the length of your prison term. It\'s a very, very long time.',
    rank: 10,
    exp: "[1-9][0-9][years]",
    cased: false,
    active: true,
    requires: ['takeArtifact','rejectArtifact','surrenderPolice','pickWheel'],
    timeline: 'ceg'
},
// Look into the mirror
{
    name: 'Begins with the seconds it takes to raise the mirror',
    rank: 9,
    exp:"^[1-9].*$",
    cased: false,
    active: true,
    requires: ['takeArtifact','viewArtifact','surrenderPolice','pickMirrors'],
    timeline: 'ceg'
},
{
    name: 'Includes the sound of the clock as you set it down.',
    rank: 9,
    exp: "tick|tock",
    cased: false,
    active: true,
    requires: ['takeArtifact','viewArtifact','surrenderPolice','pickMirrors'],
    timeline: 'ceg'
},
{
    name: 'Ends with the number of blank faces staring past you',
    rank: 9,
    exp: "tick|tock",
    cased: false,
    active: true,
    requires: ['takeArtifact','viewArtifact','pickMirrors','surrenderPolice'],
    timeline: 'ceg'
},
{
    name: 'Enter the minutes it takes to leave the station. Nobody seems to even notice that you\'re there.',
    rank: 10,
    exp: "[1-9]",
    cased: false,
    active: true,
    requires: ['takeArtifact','viewArtifact','pickMirrors','surrenderPolice'],
    timeline: 'ceg'
},
// Resist the mirror
{
    name: 'Begins with the number of pieces the mirror shatters into',
    rank: 9,
    exp:"^[1-9].*$",
    cased: false,
    active: true,
    requires: ['takeArtifact','rejectArtifact','pickMirrors','surrenderPolice'],
    timeline: 'ceg'
},
{
    name: 'Includes the last color your eyes see',
    rank: 9,
    exp:"red|green|blue|orange|yellow|white|black|gray|brown|silver|gold|purple|pink",
    cased: false,
    active: true,
    requires: ['takeArtifact','rejectArtifact','pickMirrors','surrenderPolice'],
    timeline: 'ceg'
},
{
    name: 'Ends with the direction the woman laughs from',
    rank: 9,
    exp:"left|right|behind|ahead|beside",
    cased: false,
    active: true,
    requires: ['takeArtifact','rejectArtifact','pickMirrors','surrenderPolice'],
    timeline: 'ceg'
},
{
    name: 'Enter the number of glass shards they pick from your eyes.',
    rank: 10,
    exp:"[1-9][0-9]*",
    cased: false,
    active: true,
    requires: ['takeArtifact','rejectArtifact','pickMirrors','surrenderPolice'],
    timeline: 'ceg'
},
// Stop to close the box
{
    name: 'Begins with the miles per hour at which your car crashes',
    rank: 9,
    exp:"^[1-9][0-9].*$",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickWheel','stopDriving'],
    timeline: 'ceg'
},
{
    name: 'Includes the hand you grab the box with frantically',
    rank: 9,
    exp:"left|right",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickWheel','stopDriving'],
    timeline: 'ceg'
},
{
    name: 'Ends with the time you snap it closed',
    rank: 9,
    exp:"^.*(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)$",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickWheel','stopDriving'],
    timeline: 'ceg'
},
{
    name: 'Enter the minutes you lie in the wreckage as something vibrates beside you — but finally, with a hint of disappointment, goes still.',
    rank: 10,
    exp:"[1-9][0-9]*",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickWheel','stopDriving'],
    timeline: 'ceg'
},
// Ignore the box and keep driving
{
    name: 'Starts with the seat the box rolls into',
    rank: 9,
    exp:"^left|right|back|front|middle|driver|passenger.*$",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickWheel','keepDriving'],
    timeline: 'ceg'
},
{
    name: 'Includes the fabric of its lining when it bursts open',
    rank: 9,
    exp: "velvet|linen|cotton|twill|damask|rayon|polyester|lace|crepe|denim|satin|flannel|canvas|cashmere|wool|chiffon|gingham|leather|muslin|silk|suede|spandex|taffeta|tulle|tweed|vinylon",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickWheel','keepDriving'],
    timeline: 'ceg'
},
{
    name: 'Ends with the time it closes of its own accord',
    rank: 9,
    exp:"^.*(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)$",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickWheel','keepDriving'],
    timeline: 'ceg'
},
{
    name: 'Enter the number of radio stations you try to find as you keep driving. Not a single one of them tunes in.',
    rank: 10,
    exp:"[1-9]",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickWheel','keepDriving'],
    timeline: 'ceg'
},
// Stop to help the officer
{
    name: 'Starts with the time you stop to help the officer',
    rank: 9,
    exp:"^(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m).*$",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickMirrors','stopDriving'],
    timeline: 'ceg'
},
{
    name: 'Contains the frequency of his radio call for backup',
    rank: 9,
    exp:"[1-8][0-9]{1,2}mhz|megahertz",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickMirrors','stopDriving'],
    timeline: 'ceg'
},
{
    name: 'Ends with the color of the car approaching as he drives you away',
    rank: 9,
    exp:"^.*black|red|gray|white|cream|green|blue|silver|orange|brown|beige|gold|yellow|purple$",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickMirrors','stopDriving'],
    timeline: 'ceg'
},
{
    name: function() {
        return 'Enter the hand that the ' + gameState.womanDress + '-clad woman uses to take the mirror. She smiles at you as she wipes the blood off with her dress.'
   },
    rank: 10,
    exp:"left|right|center",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickMirrors','stopDriving'],
    timeline: 'ceg',
    function:true
},
// Ignore the officer and keep driving
{
    name: 'Starts with the miles you drive with the mirror beside you',
    rank: 9,
    exp:"^[1-9].*$",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickMirrors','stopDriving'],
    timeline: 'ceg'
},
{
    name: 'Contains the time you realize your finger is no longer bleeding',
    rank: 9,
    exp:"(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickMirrors','stopDriving'],
    timeline: 'ceg'
},
{
    name: 'Contains the number of times you squeeze to try to make it bleed',
    rank: 9,
    exp:"[1-9]",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickMirrors','stopDriving'],
    timeline: 'ceg'
},
{
    name: 'Enter the state where you first try to remember your name. No matter how hard you think, it won\'t come to you.',
    rank: 10,
    exp: "alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|newhampshire|newjersey|newmexico|newyork|northcarolina|northdakota|ohio|oklahoma|oregon|pennsylvania|rhodeisland|southcarolina|southdakota|tennessee|texas|utah|vermont|virginia|washington|westvirginia|wisconsin|wyoming",
    cased: false,
    active: true,
    requires: ['takeArtifact','resistPolice','pickMirrors','stopDriving'],
    timeline: 'ceg'
},
// Look into the lake
{
    name: 'Starts with the hours you stare into the lake',
    rank: 9,
    exp:"^[1-9].*$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake','stayOutside'],
    timeline: 'ceg'
},
{
    name: 'Contains the time you reach to touch your reflection',
    rank: 9,
    exp:"(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake','stayOutside'],
    timeline: 'ceg'
},
{
    name: 'Ends with which cold finger touches you back',
    rank: 9,
    exp:"^.*thumb|forefinger|firstfinger|middlefinger|ringfinger|pinkie|littlefinger$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake','stayOutside'],
    timeline: 'ceg'
},
{
    name: 'Enter the number of times you drive away from your reflection. The road only leads back to the lake.',
    rank: 10,
    exp:"[1-9]",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake','stayOutside'],
    timeline: 'ceg'
},
// Wade into the lake
{
    name: 'Starts with the time you drop into the lake',
    rank: 9,
    exp:"^(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m).*$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake','goInside'],
    timeline: 'ceg'
},
{
    name: 'Includes the depth you think you\'ve sunk to',
    rank: 9,
    exp:"[1-9][0-9]+feet|meters|miles|kilometers|yards",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake','goInside'],
    timeline: 'ceg'
},
{
    name: 'Ends with the direction that you think you\'re swimming',
    rank: 9,
    exp:"^.*up|down|left|right$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake','goInside'],
    timeline: 'ceg'
},
{
    name: 'Enter the number of eyes glowing in the murky distance. You don\'t know how you know they\'re eyes... but you\'re very, very sure.',
    rank: 10,
    exp:"[1-9]",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLake','goInside'],
    timeline: 'ceg'
},
// Enter the store
{
    name: 'Starts with the number of fingers on the associate who greets you',
    rank: 9,
    exp:"^[0-9]{1,2}.*$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot','goInside'],
    timeline: 'ceg'
},
{
    name: 'Includes the direction you walk when you reach its musty aisles',
    rank: 9,
    exp:"left|right|north|south|east|west|forward|backward|clockwise|counterclockwise|widdershins",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot','goInside'],
    timeline: 'ceg'
},
{
    name: 'Ends with the price of the crumbling celebrity gossip magazine you buy',
    rank: 9,
    exp:"^.*[\$][1-9]\.?[0-9]*$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot','goInside'],
    timeline: 'ceg'
},
{
    name: 'Enter the number of pages in the magazine. You don\'t recognize a single name or face in it. The dateline is next week.',
    rank: 10,
    exp:"[1-9][0-9]",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot','goInside'],
    timeline: 'ceg'
},

// Waiting in the parking lot

{
    name: 'Starts with the degrees fahrenheit of your car\'s pleather seats',
    rank: 9,
    exp:"^[1-9][0-9].*$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot','stayOutside'],
    timeline: 'ceg'
},
{
    name: 'Includes the time you fall asleep in the driver\'s seat',
    rank: 9,
    exp:"(1[0-2]|0?[1-9])((:[0-5][0-9])|[ap]m|(:[0-5][0-9])[ap]m)",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot','stayOutside'],
    timeline: 'ceg'
},
{
    name: 'Ends with the phase of the moon when you wake up',
    rank: 9,
    exp:"^.*new|crescent|quarter|gibbous|full$",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot','stayOutside'],
    timeline: 'ceg'
},
{
    name: 'Enter the state with the best regional fair. Because that\'s where you are when you wake up.',
    rank: 10,
    exp: "alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|newhampshire|newjersey|newmexico|newyork|northcarolina|northdakota|ohio|oklahoma|oregon|pennsylvania|rhodeisland|southcarolina|southdakota|tennessee|texas|utah|vermont|virginia|washington|westvirginia|wisconsin|wyoming",
    cased: false,
    active: true,
    requires: ['leaveArtifact','visitLot','stayOutside'],
    timeline: 'ceg'
},

{
    name: 'Includes the date of the end of the world',
    rank: 1,
    exp: "[1-9][0-9]{3}",
    cased: false,
    active: true,
    requires: [],
},
{
    name: 'Includes whether you were there to see it',
    rank: 1,
    exp: "[1-9][0-9]{3}",
    cased: false,
    active: true,
    requires: [],
}
];

/* TIMELINE KEY:
A: Beginning
B: Visit the ferris wheel
C: Visit the hall of mirrors
D: Take the box
E: Take the mirror
F: Leave box and mirror
G: Willingly go with police officer
H: Resist police officer
I: Drive to lake
J: Drive to parking lot
K: Accept sinister offer
L: Resist sinister offer
M: Stop driving
N: Keep driving
*/

// Generate a rules parameter

class Rule {
    constructor(level) {
        this.number = question;
        this.level = level;
        this.timer = level.timer;
        this.rules = pickRules(this.level); // changed
    };
};

const pickRules = (level) => {
    let rules = [];
    //rules.push(ruleLength);
    if (question < 10){
        rules.push(ruleReq);
    };
    if (question < 2){
        let filter = ruleGeneric.filter(rule => rule.rank === level.rank); // changed
        dice = diceRoll(filter);
        rules.push(filter[dice]);
    };
    if (question > 1) {
        let filter = ruleStory.filter(rule => rule.rank === question);
        for (let i = 0; i < filter.length; i++){
            if (filter[i].active === true){
            rules.push(filter[i]);
            };
        };
        
    };
    return rules;
};

// Start game and generate a set of parameters

const startGame = () => {
    timePlayed = 0;
    document.getElementById('introduction-rules').style.display = 'none';
    document.getElementById('play-box').style.display = 'block';
    generateClock(document.getElementById('timer'));
    document.getElementById('timer').innerHTML = timeClock;
    nextQuestion();
    //Object.getOwnPropertyNames(currentRule.rules[0]) / Object.keys(currentRule.rules[0]) 
};

const ruleLengthBox = document.getElementById('password-length-rule');
const ruleLengthCheck = document.getElementById('password-length-check');

const continueGame = () => {
    nextQuestion();
    document.getElementById('results-box').style.display = 'none';
    document.getElementById('play-box').style.display = 'block';
    generateClock(document.getElementById('timer'));
    document.getElementById('timer').innerHTML = timeClock;
};

const nextQuestion = () => {
    document.getElementById('password-input').value = '';
    question++;
    generateRule();
    timer = setInterval(timeCountup,1000);
    document.getElementById('password-number').innerHTML = currentRule.number;
    // Populate a list with the rules
    /*ruleLengthBox.style.color = '#ff0000';
    ruleLengthBox.innerHTML = 'Between ' + currentRule.level.min + ' and ' + currentRule.level.max + ' characters';
    ruleLengthCheck.innerHTML = 'X ';*/
    document.getElementById('password-rule-list').textContent = '';
    let node = document.createElement('div');
    let textnode = document.createTextNode('Between ' + currentRule.level.min + ' and ' + currentRule.level.max + ' characters - X');
    node.appendChild(textnode);
    node.style.color = '#ff0000';
    document.getElementById('password-rule-list').appendChild(node);
    for (let i = 0; i < currentRule.rules.length; i++){
        let node = document.createElement('div');
        let rulename;
        if (currentRule.rules[i].function === true){
            rulename = currentRule.rules[i].name() + ' - X';
        } else {
            rulename = currentRule.rules[i].name + ' - X';
            //let textnode = document.createTextNode(currentRule.rules[i].name + ' - X');
        };
        let textnode = document.createTextNode(rulename);
        node.appendChild(textnode);
        node.style.color = '#ff0000';
        document.getElementById('password-rule-list').appendChild(node);
        };
};

const generateRule = () => {
    level = questionLevel[question-1];
    /*if (question <= 3){
        level = questionLevel[0];
    } else if (question <= 6){
        level = questionLevel[1];
    } else if (question <= 9){
        level = questionLevel[2];
    } else if (question > 9){
        level = questionLevel[3];
    };*/
    currentRule = new Rule(level);
};

// Check password when user types a key


const checkPassword = () => {
    password = document.getElementById('password-input').value;
    failReason = [];
    // Evaluate the validity of the password
    if (password.length > 0){
        // Is the password long enough?
        longEnough = evaluatePasswordLength(password);
        document.getElementById('password-rule-list').textContent = '';
        let node = document.createElement('div');
        let textnode = document.createTextNode('Between ' + currentRule.level.min + ' and ' + currentRule.level.max + ' characters - X');
        node.appendChild(textnode);
        if (longEnough === true){
            node.style.color = '#00cc00';
        } else {
            node.style.color = '#ff0000';
        };
        document.getElementById('password-rule-list').appendChild(node);
        rulePassed = 0;
        for (let i = 0; i < currentRule.rules.length; i++){
            evaluateRule(currentRule.rules[i],password);
        };
        if (longEnough === true && rulePassed === currentRule.rules.length){
            passwordGood = true;
        } else {
            passwordGood = false;
        };
    } else {
        document.getElementById('warning-box').innerHTML = '';
    };
    if (passwordGood === true){
        submitButton.disabled = false;
        document.getElementById('warning-box').style.color = "#33cc33";
        document.getElementById('warning-box').innerHTML = 'Password is good';
    } else {
        submitButton.disabled = true;
        document.getElementById('warning-box').style.color = "#ff0000";
        /*let list = document.createElement('ul');
        for (let i = 0; i < failReason.length; i++){
            //let item = document.createItem('li');
            //item.appendChild(document.createTextNode(failReason[i]));
            //list.appendChild(item);
        };*/
        document.getElementById('warning-box').innerHTML = failReason.join('/');
        //document.getElementById('warning-box').appendChild(list);
        
    };
};

// Filter input to remove spaces

/*const filterInput = () => {
    str = document.getElementById('password-input').value;
    const whiteSpace = new RegExp("\\s+");
    let clean = str.replace(whiteSpace,'');
    document.getElementById('password-input').value = clean;
};*/

const avoidSpace = (event) => {
    let k = event ? event.which : window.event.keyCode;
    if (k == 32) return false;
    str = document.getElementById('password-input').value;
    const whiteSpace = new RegExp("\\s+");
    let clean = str.replace(whiteSpace,'');
    document.getElementById('password-input').value = clean;
};

const input = document.querySelector('input');
//input.addEventListener('keydown',avoidSpace);
input.addEventListener('keyup',checkPassword);

// Submit password

const submitPassword = (password) => {
    clearInterval(timer);
    document.getElementById('play-box').style.display = 'none';
    document.getElementById('warning-box').innerHTML = '';
    document.getElementById('results-box').style.display = 'block';
    document.getElementById('password-results').innerHTML = 'Success: ' + password;
    document.getElementById('time-stopwatch').innerHTML = timeClock;
    // Add the password to your final password
    finalPassword += password;
    // Systems for choice branching
    if (question === 1){
        let regex = new RegExp(fullSecretCode);
        if (regex.test(password) === true){
            enteredSecretCode();
        };
    };
    password = password.toLowerCase();
    if (question === 3){
        if (/hallofmirrors/.test(password) === true){
            //currentBranch = 'c';
            //pruneBranch = 'b';
            //pickMirrors = true;
            gameState.pickMirrors = true;
            pruneBranch = 'pickWheel';
            finalChoices.push(gameResults.pickMirrors);
        } else if (/ferriswheel/.test(password) === true){
            //currentBranch = 'b';
            //pruneBranch = 'c';
            //pickWheel = true;
            gameState.pickWheel = true;
            pruneBranch = 'pickMirrors';
            finalChoices.push(gameResults.pickWheel);
        };
        /*for (let i = 0; i < ruleStory.length; i++){
            if (ruleStory[i].requires.includes(pruneBranch)){
            //if (ruleStory[i].timeline.includes(pruneBranch)){
            //if (ruleStory[i].timeline === pruneBranch){
                //ruleStory[i].rank = 1;
                ruleStory[i].active = false;
            };
        };*/
    } else if (question === 5){
        if (/yes/.test(password) === true){
            gameState.takeArtifact = true;
            pruneBranch = 'leaveArtifact';
            if (gameState.pickMirrors === true){
                finalChoices.push(gameResults.takeMirror);
            } else if (gameState.pickWheel === true){
                finalChoices.push(gameResults.takeBox);
            };
        } else {
            gameState.leaveArtifact = true;
            pruneBranch = 'takeArtifact';
            if (gameState.pickMirrors === true){
                finalChoices.push(gameResults.leaveMirror);
            } else if (gameState.pickWheel === true){
                finalChoices.push(gameResults.leaveBox);
            };
        };
        //currentBranch = 'a';
    } else if (question === 7){
        if (gameState.takeArtifact === true){
            if (/resist/.test(password) === true){
                gameState.resistPolice = true;
                pruneBranch = 'surrenderPolice';
                finalChoices.push(gameResults.resistPolice);
            } else if (/surrender/.test(password) === true){
                gameState.surrenderPolice = true;
                pruneBranch = 'resistPolice';
                finalChoices.push(gameResults.surrenderPolice);
            };
        } else if (gameState.leaveArtifact === true){
            if (/lake/.test(password) === true){
                gameState.visitLake = true;
                pruneBranch = 'visitLot';
                finalChoices.push(gameResults.visitLake);
            } else if (/lot/.test(password) === true){
                gameState.parkingLot = true;
                pruneBranch = 'visitlake';
                finalChoices.push(gameResults.visitLot);
            };
        };
    } else if (question === 8){
        if (gameState.resistPolice === true && gameState.takeArtifact === true){
            if (gameState.pickWheel === true){
                if (/close/.test(password) === true){
                    gameState.stopDriving = true;
                    pruneBranch = 'keepDriving';
                    finalChoices.push(gameResults.stopBox);
                    finalCodeFragment = secretCode.stopBox;
                } else if (/drive/.test(password) === true){
                    gameState.keepDriving = true;
                    pruneBranch = 'stopDriving';
                    finalChoices.push(gameResults.driveBox);
                    finalCodeFragment = secretCode.driveBox;
                };
            } else if (gameState.pickMirrors === true){
                if (/yes/.test(password) === true){
                    gameState.stopDriving = true;
                    pruneBranch = 'keepDriving';
                    finalChoices.push(gameResults.stopMirror);
                    finalCodeFragment = secretCode.stopMirror;

                } else if (/no/.test(password) === true){
                    gameState.keepDriving = true;
                    pruneBranch = 'stopDriving';
                    finalChoices.push(gameResults.driveMirror);
                    finalCodeFragment = secretCode.driveMirror;
                };
            };
        } else if (gameState.surrenderPolice === true && gameState.takeArtifact === true){
            if (/yes/.test(password) === true){
                gameState.viewArtifact = true;
                pruneBranch = 'rejectArtifact';
                if (gameState.pickWheel === true){
                    finalChoices.push(gameResults.viewBox);
                    finalCodeFragment = secretCode.viewBox;
                } else if (gameState.pickMirrors === true){
                    finalChoices.push(gameResults.viewMirror);
                    finalCodeFragment = secretCode.viewMirror;
                };
            } else if (/no/.test(password) === true){
                gameState.rejectArtifact = true;
                pruneBranch = 'viewArtifact';
                if (gameState.pickWheel === true){
                    finalChoices.push(gameResults.rejectBox);
                    finalCodeFragment = secretCode.rejectBox;
                } else if (gameState.pickMirrors === true){
                    finalChoices.push(gameResults.rejectMirror);
                    finalCodeFragment = secretCode.rejectMirror;
                };
            };
        } else if (gameState.visitLake === true){
            if (/depth/.test(password) === true){
                gameState.goInside = true;
                pruneBranch = 'stayOutside';
                finalChoices.push(gameResults.diveLake);
                finalCodeFragment = secretCode.diveLake;
            } else if (/mirror/.test(password) === true){
                gameState.stayOutside = true;
                pruneBranch = 'goInside';
                finalChoices.push(gameResults.watchLake);
                finalCodeFragment = secretCode.watchLake;
            };
        } else if (gameState.visitLot === true){
            if (/yes/.test(password) === true){
                gameState.goInside = true;
                pruneBranch = 'stayOutside';
                finalChoices.push(gameResults.enterStore);
                finalCodeFragment = secretCode.enterStore;
            } else if (/no/.test(password) === true){
                gameState.stayOutside = true;
                pruneBranch = 'goInside';
                finalChoices.push(gameResults.outsideStore);
                finalCodeFragment = secretCode.outsideStore;
            };
        };
        console.log(finalCodeFragment + 'set');
    } else if (question === 10){
        endGame();
    };
    if (pruneBranch !== ''){
        for (let i = 0; i < ruleStory.length; i++){
            if (ruleStory[i].requires.includes(pruneBranch)){
        //if (ruleStory[i].timeline.includes(pruneBranch)){
        //if (ruleStory[i].timeline === pruneBranch){
            //ruleStory[i].rank = 1;
                ruleStory[i].active = false;
            };
        };
        prunebranch = '';
    };
    console.log('Choices: ' + finalChoices.join(','));
};

const evaluatePasswordLength = (password) => {
    if (password.length >= currentRule.level.min && password.length <= currentRule.level.max) {
        return true;
    } else {
        return false;
    };
};

//TESTING!

const evaluateRule = (rule,password) => {
    let regex = new RegExp(rule.exp);
    let node = document.createElement('div');
    //let textnode = document.createTextNode(rule.name + ' - ');
    let rulename;
    if (rule.function === true){
        rulename = rule.name() + ' - ';
    } else {
        rulename = rule.name + ' - ';
        //let textnode = document.createTextNode(currentRule.rules[i].name + ' - X');
    };
    let textnode = document.createTextNode(rulename);
    node.appendChild(textnode);
    if (rule.cased === false) {
        password = password.toLowerCase();
    };
    if (regex.test(password)){
        node.style.color = '#00cc00';
        let check = document.createTextNode('O');
        node.appendChild(check);
        rulePassed++;
        if (rule.variable === 'manEyes'){
            gameState.manEyes = password.match(regex);
            console.log('Set man\'s eyes to ' + gameState.manEyes + '.');
        } else if (rule.variable === 'womanDress'){
            gameState.womanDress = password.match(regex);
            console.log('Set woman\'s dress to ' + gameState.womanDress + '.');
        };
    } else {
        node.style.color = '#ff0000';
        let check = document.createTextNode('X');
        node.appendChild(check);
    };
    document.getElementById('password-rule-list').appendChild(node);
};

// Set a timer

const generateClock = (clock) => {
    var date = new Date(null);
    date.setSeconds(timePlayed); // specify value for SECONDS here
    var ret = date.toISOString().substr(11, 8);
    timeClock = ret;
    clock.innerHTML = timeClock;
};

const timeCountup = () => {
    timePlayed++;
    generateClock(document.getElementById('timer'));
};

// End the game after Question 10

const endGame = () => {
    document.getElementById('results-box').style.display = 'none';
    document.getElementById('final-box').style.display = 'block';
    document.getElementById('final-time').innerHTML = timeClock;
    document.getElementById('final-password').innerHTML = finalPassword;
    document.getElementById('code-fragment').innerHTML = finalCodeFragment;
    let gameChoices = document.getElementById('game-choices');
    let l = document.createElement('ul');
    for (let i = 0; i < finalChoices.length; i++){
        let node = document.createElement('li');
        let textnode = document.createTextNode(finalChoices[i]);
        node.appendChild(textnode);
        l.appendChild(node);
    };
    gameChoices.appendChild(l);
}; 

const enteredSecretCode = () => {
    document.getElementById('results-box').style.display = 'none';
    document.getElementById('secret-code-box').style.display = 'block';
};

// Lose game if timer hits 0

/*const loseTimer = () => {
    clearInterval(timer);
    setRedo = true;
    document.getElementById('play-box').style.display = 'none';
    document.getElementById('warning-box').innerHTML = '';
    document.getElementById('results-box').style.display = 'block';
    document.getElementById('password-results').innerHTML = 'fail';
};*/

// UI

const startButton = document.getElementById('start-button');
startButton.addEventListener('click',startGame);

const submitButton = document.getElementById('submit-button');
submitButton.addEventListener('click',function(){
    password = document.getElementById('password-input').value;
    submitPassword(password);
});
submitButton.disabled = true;

const nextButton = document.getElementById('next-button');
nextButton.addEventListener('click',continueGame);





});
