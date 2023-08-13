let welcomeState = {
    preload: loadTitleAssets,
    create: loadScreen,
};

let btnLevelA, btnLevelB, btnLevelC, btnSettings; //Buttons
let textTitle, textNames, instructionsText; //Texts
let verticalSpace;
let instructions;

function loadTitleAssets() //We load some of the assets and all the sounds
{
    game.camera.fadeIn(0, TIME_FADING);
    game.load.image('background', 'assets/imgs/background.png');
    game.load.image('background', 'assets/imgs/background.png');
    game.load.image('levelAButton', 'assets/imgs/levelAButton.png');
    game.load.image('levelBButton', 'assets/imgs/levelBButton.png');
    game.load.image('levelCButton', 'assets/imgs/levelCButton.png');
    game.load.image('settingsButton', 'assets/imgs/settingsButton.png');
    game.load.image('returnButton', 'assets/imgs/returnButton.png');
    game.load.audio('music','assets/snds/music.mp3');
    game.load.audio('button','assets/snds/button.mp3');
    game.load.audio('explosion','assets/snds/explosion.mp3');
    game.load.audio('carChange','assets/snds/carChange.mp3');
    game.load.audio('healthUp','assets/snds/healthUp.mp3');
    game.load.audio('levelComplete','assets/snds/levelComplete.mp3');
    game.load.audio('shoot','assets/snds/shoot.mp3');
    game.load.audio('reload','assets/snds/reload.mp3');
    game.load.audio('levelComplete','assets/snds/levelComplete.mp3');
}

function loadScreen()
{
    game.input.enbaled = true;
    game.add.image(0, 0, 'background');
    textTitle = 'Mechanics against the world';
    verticalSpace = GAME_HEIGHT / 6;
    title = game.add.text(GAME_WIDTH - MARGIN, verticalSpace, textTitle, titleStyle);
    title.anchor.setTo(1, 0.5);
    textNames = 'Mario Beltran, Alvaro Chuan y Sergio Gallardo';
    names = game.add.text(MARGIN, GAME_HEIGHT-MARGIN, textNames, creditStyle);
    names.anchor.setTo(0, 0.5);
    instructionsText = '·Move between threads using the arrow keys or the mouse.'
                        + '\n·Shoot with the spacebar or the left mouse button.'
                        + '\n·Kill all the cars to complete the level.'
                        + '\n·Collect the health packs to recover health.'
                        + '\n·Be careful when the cars change directions.';
    instructions = game.add.text(MARGIN, verticalSpace * 3.5 , instructionsText, instructionsStyle);
    instructions.anchor.setTo(0, 0.5);
    btnLevelA = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 2, 'levelAButton', onButtonPressed);
    btnLevelA.anchor.setTo(1, 0.5);
    btnLevelB = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 3, 'levelBButton', onButtonPressed);
    btnLevelB.anchor.setTo(1, 0.5);
    btnLevelC = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 4, 'levelCButton', onButtonPressed);
    btnLevelC.anchor.setTo(1, 0.5);
    btnSettings = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 5, 'settingsButton', onButtonPressed);
    btnSettings.anchor.setTo(1, 0.5);
    if (soundsNotCreated)
    {
        createSounds();
        soundsNotCreated = false;
    }
    if(soundMusic.isPlaying == false)
    {
        soundMusic.play();
        soundMusic.loopFull();
        soundMusic.isPlaying = true;
    }
}
