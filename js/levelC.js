let playStateC = {
    preload: loadAssets,
    create: loadLevelCScreen,
    update: updateLevelC,
};

function loadLevelCScreen()
{
    numThreads = 9;
    game.camera.fadeIn(0, TIME_FADING);
    setLevel(2);
    loadGameplayScreen();
    calculateSpawnAndPlayerPositions(); // Calculates the position of the original 9 threads
    createMatrixC();
    numThreads = NUM_THREADS_C;
    calculateSpawnAndPlayerPositions(); // Calculates the correct position of the player
    createStartPointsC();
    createBranchesC();
    calculateSpawnPointsC();
    createKeyControls();
    createPlayer();
    createCars();
    createToolBox();
    createHUD();
    createExplosions();
    createHealthUp();
    createAmmoBag();
    game.time.events.loop(TIMER_RHYTHM * 10, activateAmmoBags, this); //Sets a timer to activate the ammo bags
}

function updateLevelC()
{
    managePlayerMovement();
    managePlayerShots();
    manageHitboxes();
}

function createMatrixC() //As in the part B we create a matrix full of points
{
    matrix = new Array(BRANCHES_HEIGHT + 1);
    for (let i = 0; i < BRANCHES_HEIGHT + 1; i++)
    {
        matrix[i] = new Array(NUM_THREADS_C*2 - 1);
    }

    let jumpColumn = 0;
    let height = GAME_HEIGHT / (BRANCHES_HEIGHT);
    for (let row = 0; row < BRANCHES_HEIGHT + 1; row++) //We create the matrix with the same logic as in part B, but we skip the middle columns to generate a zigzag pattern
    {
        for (let column = 0; column < NUM_THREADS_C*3; column++)
        {
            if (column%3 != 1)
            {
                let point = new Point(calculateEndXDisplacement((height * row), spawnPositions[column]), height * row, column + jumpColumn);
                matrix[row][column - jumpColumn] = point;
                //DEBUG CODE to see the matrix
                //let magicAlonso = game.add.image(point.getInitialX(), point.getInitialY(), 'magicAlonso');
                //let magicAlonso = game.add.text(point.getInitialX(), point.getInitialY(), (row) + ' / ' + (column - jumpColumn));
                //magicAlonso.anchor.setTo(0.5, 0.5);
            }
            else
            {
                jumpColumn += 1
            }
        }
        jumpColumn = 0;
    }
}

function createStartPointsC() //We create the start points for the branches of part C
{
    startPoints = game.add.group();
    startPoints.enableBody = true;
    startPoints.createMultiple(MAX_BRANCHES_C, 'turn');
    startPoints.callAll('events.onOutOfBounds.add','events.onOutOfBounds', resetStartPoints);
    startPoints.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    startPoints.setAll('checkWorldBounds', true);
}

function createBranchesC() //We generate the branches in a similar way to part B but ensuring there is a zigzag pattern and no using endPoints as they are not needed
{
    for(let i = 0; i < NUM_THREADS_C; i++)
    {
        let startCRow = 0;
        let startCColumn = getRndInteger(0,2);
        let endCRow;
        let endCColumn;

        while (startCRow < 5)
        {
            endCRow = startCRow + 1;
            endCColumn = switchLeftOrRight(startCColumn);
            matrix[startCRow][startCColumn+ 2*i].setEndX(matrix[endCRow][endCColumn+ 2*i].getInitialX());
            matrix[startCRow][startCColumn+ 2*i].setEndY(matrix[endCRow][endCColumn+ 2*i].getInitialY());
            matrix[startCRow][startCColumn+ 2*i].image = game.add.image(matrix[startCRow][startCColumn+ 2*i].getEndX(), matrix[startCRow][startCColumn+ 2*i].getEndY(), 'branch');
            matrix[startCRow][startCColumn+ 2*i].image.anchor.setTo(0.5, 1);
            matrix[startCRow][startCColumn+ 2*i].image.angle = calculateDegree(startCRow, startCColumn+ 2*i);
            matrix[startCRow][startCColumn+ 2*i].image.cropRect = new Phaser.Rectangle(0, 0, BRANCHES_WITDH, distanceBetweenPoints(startCRow, startCColumn+ 2*i));
            matrix[startCRow][startCColumn+ 2*i].image.updateCrop();
            matrix[startCRow][startCColumn+ 2*i].image.sendToBack();

            let branchStartPoint = startPoints.getFirstExists(false);
            if (branchStartPoint)
            {
                branchStartPoint.reset(matrix[startCRow][startCColumn+ 2*i].getInitialX(), matrix[startCRow][startCColumn+ 2*i].getInitialY());
                branchStartPoint.row = startCRow;
                branchStartPoint.column = startCColumn+ 2*i;
                branchStartPoint.scale.setTo(0.78, 0.78); //We change the appearance of the start points to make them look like a turn
                if(matrix[startCRow][startCColumn+ 2*i].getEndX() < matrix[startCRow][startCColumn+ 2*i].getInitialX()) branchStartPoint.scale.setTo(-0.78, 0.78);
            }
            startCColumn = endCColumn;
            startCRow++;
        }
    }
    background.sendToBack();
}

function createAmmoBag() //We create the ammo bags
{
    ammoBags = game.add.group();
    ammoBags.enableBody = true;
    ammoBags.createMultiple(MAX_AMMOBAGS, 'ammoBag');
    ammoBags.callAll('events.onOutOfBounds.add','events.onOutOfBounds', resetAmmoBags);
    ammoBags.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    ammoBags.setAll('checkWorldBounds', true);
}

function switchLeftOrRight(number) //Decides whether the zigzag pattern goes left or right
{
    if (number % 2 == 0) return 1;
    return 0;
}

function calculateSpawnPointsC() //We calculate the spawn points for the cars based on the zigzag pattern created in the matrix
{
    let j = 0;
    for (let i = 0; i < NUM_THREADS_C*2; i++)
    {
        if(matrix[0][i].getEndX() != -1) spawnPositions[j++] = matrix[0][i].getInitialX();
    }
}

function activateAmmoBags() //We activate the ammo bags
{
    let ammoBag = ammoBags.getFirstExists(false);
    if (ammoBag)
    {
        ammoBag.reset(itemSpawnPositions[getRndInteger(0, numThreads)] - MOVEMENT_VECTOR[0], - MOVEMENT_VECTOR[1])
        ammoBag.body.velocity.x = MOVEMENT_VECTOR[0] * TOOLBOX_SPEED_PER_LEVEL[difficulty];
        ammoBag.body.velocity.y = MOVEMENT_VECTOR[1] * TOOLBOX_SPEED_PER_LEVEL[difficulty];
        ammoBag.scale.x = 0.65;
        ammoBag.scale.y = 0.65;
    }
}

function updateAmmo(type) //We update the ammo icons
{
    switch (type)
    {
        case 'AmmoDown':
            ammoIcon[ammo].kill();
            break;
        case 'AmmoUp':
            ammoIcon[ammo] = game.add.image(48, GAME_HEIGHT - (SIZE_AMMO * ammo) - 20, 'ammo');
            ammoIcon[ammo].anchor.setTo(0.5, 1);
            break;
    }
}

function playerHitsAmmoBag(player, ammoBag) //We update the ammo when the player hits an ammo bag
{
    ammoBag.kill();
    soundReload.play();
    for (let i = ammo; i < MAX_AMMO; i++)
    {
        updateAmmo('AmmoUp');
        ammo++;
    }
}

function resetAmmoBags(item)
{
    item.kill();
}

function nutHitsAmmoBag(nut, ammoBag) //We destroy the ammo bags if the player shoots them
{
    displayExplosion(ammoBag);
    nut.kill();
    ammoBag.kill();
}