let playStateA = {
    preload: loadAssets,
    create: loadLevelAScreen,
    update: updateLevelA,
};

function loadLevelAScreen()
{
    setLevel(0);
    game.camera.fadeIn(0, TIME_FADING);
    loadGameplayScreen();
    calculateSpawnAndPlayerPositions();
    createThreads();
    createKeyControls();
    createPlayer();
    createCars();
    createToolBox();
    createHUD();
    createExplosions();
    createHealthUp();
}

function updateLevelA()
{
    managePlayerMovement();
    managePlayerShots();
    manageHitboxes();
}