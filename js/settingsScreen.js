let settingsState = {
    preload: loadSettingsAssets,
    create: loadSettingsScreen,
};

let btnAug, btnDec, btnKey, btnMouse, btnReturn;
let textNumThreads, textThreads;
let numThreads = 3;
let keyboardControl = true; //true = Keyboard, false = Mouse

function loadSettingsAssets()
{
    game.camera.fadeIn(0, TIME_FADING);
    game.load.image('increaseButton', 'assets/imgs/arrow.png');
    game.load.image('decreaseButton', 'assets/imgs/arrow.png');
    game.load.image('keyboardButton', 'assets/imgs/keyboardButton.png');
    game.load.image('keyboardPressedButton', 'assets/imgs/keyboardPressedButton.png');
    game.load.image('mouseButton', 'assets/imgs/mouseButton.png');
    game.load.image('mousePressedButton', 'assets/imgs/mousePressedButton.png');
    game.load.image('returnButton', 'assets/imgs/returnButton.png');
}

function loadSettingsScreen()
{
    game.input.enbaled = true;
    game.add.image(0, 0, 'background');
    verticalSpace = GAME_HEIGHT / 6;
    title = game.add.text(GAME_WIDTH - MARGIN, verticalSpace, 'Settings', titleStyle);
    title.anchor.setTo(1, 0.5);
    textThreads = game.add.text(GAME_WIDTH - (4.2 * MARGIN), verticalSpace * 2, 'Threads: ', titleStyle);
    textThreads.anchor.setTo(1, 0.5);
    btnAug = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 2, 'increaseButton', onButtonPressed);
    btnAug.anchor.setTo(1, 0.5);
    textNumThreads =  game.add.text(GAME_WIDTH - (3 * MARGIN) + 8, verticalSpace * 1.75, numThreads, titleStyle);
    btnDec = game.add.button(GAME_WIDTH - (4 * MARGIN), verticalSpace * 2, 'decreaseButton', onButtonPressed);
    btnDec.anchor.setTo(1, 0.5);
    btnDec.scale.setTo(-1, 1);
    textControls = game.add.text(GAME_WIDTH - (8.5 * MARGIN), verticalSpace * 3, 'Controls: ', titleStyle);
    textControls.anchor.setTo(1, 0.5);
    if(keyboardControl)
    {
        btnKey = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 3, 'keyboardPressedButton', onButtonPressed);
        btnMouse = game.add.button(GAME_WIDTH - (5 * MARGIN), verticalSpace * 3, 'mouseButton', onButtonPressed);
    }
    else
    {
        btnKey = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 3, 'keyboardButton', onButtonPressed);
        btnMouse = game.add.button(GAME_WIDTH - (5 * MARGIN), verticalSpace * 3, 'mousePressedButton', onButtonPressed);
    }
    btnKey.anchor.setTo(1, 0.5);
    btnMouse.anchor.setTo(1, 0.5);
    btnReturn = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 5, 'returnButton', onButtonPressed);
    btnReturn.anchor.setTo(1, 0.5);
}