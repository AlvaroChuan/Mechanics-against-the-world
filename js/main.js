//GAME SPACE
const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const MARGIN = 50;
const HORIZONTAL_SPACE = 1014;
const BRANCHES_WITDH = 90;

//MOVEMENT AND POSITIONS
const FIRST_THREAD_POSITION = 32;
const FIRST_PLAYER_POSITION = 227;
const PLAYER_Y_POSITION = 678;
const MOVEMENT_VECTOR = [0.27753965282077446874237282445958, 0.96498402365376969131963474350561]; //Vector for the diagonal movement
const NUT_SPEED = 500;
const CAR_SPEED_PER_LEVEL = [125, 200, 300];
const CAR_SPEED_PER_LEVEL_PARTC = [125, 175, 225];
const TOOLBOX_SPEED_PER_LEVEL = [100, 200, 300];

//CUANTITIES
const MAX_NUTS = 100;
const MAX_CARS_PER_PHASE = [40, 40, 40];
const MAX_TOOLBOXES_PER_PHASE = [10, 20, 30];
const CARS_PER_LEVEL =[10, 20, 30];
const SPAWNRATES_PER_LEVEL = [0.2, 0.4, 0.6];
const TOOLBOX_SPAWNRATES_PER_LEVEL = [0.2, 0.4, 0.6];
const CAR_SCORE = 1;
const MAX_LIVES = 3;
const BRANCHES_HEIGHT = 5;
const ADD_BRANCHES = [3, 2, 3];
const CAR_LIVES_PER_LEVEL = [1, 2, 3];
const MAX_AMMOBAGS = 10;
const NUM_THREADS_C = 3;
const MAX_BRANCHES_C = 18;

//HUD
const TIMER_RHYTHM=1*Phaser.Timer.SECOND;
const TIME_TO_MENU=20;
const SIZE_LIFE = 71;
const HUD_MARGIN = 20;
const HUD_SPACE = 30;
const PART = ['A', 'B', 'C']
const TIME_FADING = 500;
const MAX_AMMO = 7;
const SIZE_AMMO = 68;
let game;

let wfConfig = {
    active: function ()
    {
        startGame();
    },

    google: {
        families: ['Rammetto One', 'Sniglet']
    },

    custom: {
        families: ['FerrumExtracondensed', 'Formula_1'],
        urls: ["https://fontlibrary.org/face/ferrum"]
    }
};

WebFont.load(wfConfig);

function startGame()
{
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.CANVAS, 'falling-objects-game');
    game.state.add('welcomeState', welcomeState);
    game.state.add('settingsState', settingsState);
    game.state.add('playStateA', playStateA);
    game.state.add('playStateB', playStateB);
    game.state.add('playStateC', playStateC);
    game.state.add('endState', endState);
    game.state.start('welcomeState');
}