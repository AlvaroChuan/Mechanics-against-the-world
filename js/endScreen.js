let btnMainMenu, enterButton;

let endState = {
    create: createEndingScreen,
    update: manageEnterKey,
};

function createEndingScreen()
{
    game.camera.fadeIn(0, TIME_FADING);
    game.input.enbaled = true;
    game.add.image(0, 0, 'background');
    verticalSpace = GAME_HEIGHT / 6;
    end = game.add.text(GAME_WIDTH - MARGIN, verticalSpace, endedGame, titleStyle);
    end.anchor.setTo(1, 0.5);
    punctuationText = 'Points: ' + score;
    punctuation = game.add.text(GAME_WIDTH - MARGIN, verticalSpace * 2, punctuationText, titleStyle);
    punctuation.anchor.setTo(1, 0.5);
    timeText = 'Time: ' + time + ' s';
    timeEnd = game.add.text(GAME_WIDTH - MARGIN, verticalSpace * 3, timeText, titleStyle);
    timeEnd.anchor.setTo(1, 0.5);
    enterText = 'Press Enter to play again';
    enter = game.add.text(GAME_WIDTH / 2, verticalSpace * 5, enterText, titleStyle);
    enter.anchor.setTo(0.5, 0.5);
    btnMainMenu = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 4, 'returnButton', onButtonPressed);
    btnMainMenu.anchor.setTo(1, 0.5);
    enterButton = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    game.time.events.loop(TIMER_RHYTHM * TIME_TO_MENU, returnToMainMenu, this);
}

function manageEnterKey() //If enter is pressed, the game restarts at part A
{
    if (enterButton.justDown)
    {
        resetGame();
        game.state.start('playStateA');
    }
}

function returnToMainMenu() //If the button is pressed, the game returns to the main menu
{
    resetGame();
    game.state.start('welcomeState');
}