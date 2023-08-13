let playStateB = {
    preload: loadAssets,
    create: loadLevelBScreen,
    update: updateLevelB,
};

function loadLevelBScreen()
{
    setLevel(1);
    game.camera.fadeIn(0, TIME_FADING);
    loadGameplayScreen();
    calculateSpawnAndPlayerPositions();
    createMatrix();
    createStartPoints();
    createEndPoints();
    createBranches();
    createThreads();
    createKeyControls();
    createPlayer();
    createCars();
    createToolBox();
    createHUD();
    createExplosions();
    createHealthUp();
}

function updateLevelB()
{
    managePlayerMovement();
    managePlayerShots();
    manageHitboxes();
}

function createMatrix() //Creates a mtrix of points to be used as a reference for the branches
{
    matrix = new Array(BRANCHES_HEIGHT);
    for (let i = 0; i < BRANCHES_HEIGHT; i++)
    {
        matrix[i] = new Array(numThreads - 1);
    }


    let height = GAME_HEIGHT / (BRANCHES_HEIGHT + 1);
    for (let row = 1; row < BRANCHES_HEIGHT + 1; row++)
    {
        for (let column = 0; column < numThreads; column++) //Each space is filled with a point that contains its initial positions and the positions of the point it is connected to
        {
            let point = new Point(calculateEndXDisplacement((height * row), spawnPositions[column]), height * row, column);
            point.setEndX(-1);
            point.setEndY(-1);
            matrix[row - 1][column] = point;
            //DEBUG CODE to see the matrix
            //let magicAlonso = game.add.image(point.getInitialX(), point.getInitialY(), 'magicAlonso');
            //let magicAlonso = game.add.text(point.getInitialX(), point.getInitialY(), (row - 1) + ' / ' + column);
            //magicAlonso.anchor.setTo(0.5, 0.5);
        }
    }
}

function createStartPoints() //Creates a group for the startingPoints
{
    let totalBranches = 0;
    for(let i = 0; i < ADD_BRANCHES.length; i++) totalBranches += ADD_BRANCHES[i];
    startPoints = game.add.group();
    startPoints.enableBody = true;
    startPoints.createMultiple(totalBranches, 'point');
    startPoints.callAll('events.onOutOfBounds.add','events.onOutOfBounds', resetStartPoints);
    startPoints.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    startPoints.setAll('checkWorldBounds', true);
}

function createEndPoints() //Creates a group for the endPoints
{
    let totalBranches = 0;
    for(let i = 0; i < ADD_BRANCHES.length; i++) totalBranches += ADD_BRANCHES[i];
    endPoints = game.add.group();
    endPoints.enableBody = true;
    endPoints.createMultiple(totalBranches, 'point');
    endPoints.callAll('events.onOutOfBounds.add','events.onOutOfBounds', resetEndPoints);
    endPoints.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    endPoints.setAll('checkWorldBounds', true);
}

function createBranches() //Creates the branches by joining points that have not been joined yet and stablises the starting and ending points
{
    for(let i = 0; i < ADD_BRANCHES[difficulty]; i++)
    {
        let startRow = getRndInteger(0, BRANCHES_HEIGHT - 1);
        let startColumn = getRndInteger(0, numThreads);

        while (matrix[startRow][startColumn].getEndX() != -1) //if it has no endX it has not been used yet so it can be used as an starting point
        {
            startRow = getRndInteger(0, BRANCHES_HEIGHT - 1);
            startColumn = getRndInteger(0, numThreads);
        }

        let endRow = getRndInteger(startRow + 1, BRANCHES_HEIGHT - 1);
        let endColumn =  getRndInteger(0, numThreads);

        while (endColumn == matrix[startRow][startColumn].getThread()) //the end point is randomly selected but it has to be from other thread and under the starting point
        {
            endColumn =  getRndInteger(0, numThreads);
        }

        matrix[startRow][startColumn].setEndX(matrix[endRow][endColumn].getInitialX());
        matrix[startRow][startColumn].setEndY(matrix[endRow][endColumn].getInitialY());
        matrix[startRow][startColumn].image = game.add.image(matrix[startRow][startColumn].getEndX(), matrix[startRow][startColumn].getEndY(), 'branch'); //Creates the image of the branch
        matrix[startRow][startColumn].image.anchor.setTo(0.5, 1);
        matrix[startRow][startColumn].image.angle = calculateDegree(startRow, startColumn); //Rotates the branch to the correct angle
        matrix[startRow][startColumn].image.cropRect = new Phaser.Rectangle(0, 0, BRANCHES_WITDH, distanceBetweenPoints(startRow, startColumn)); //Crops the branch to the correct size
        matrix[startRow][startColumn].image.updateCrop();
        matrix[startRow][startColumn].image.sendToBack();

        //These lines are used to setup the starting and ending points in their correct postitions according to the branch
        let branchStartPoint = startPoints.getFirstExists(false);
        if (branchStartPoint)
        {
            branchStartPoint.reset(matrix[startRow][startColumn].getInitialX(), matrix[startRow][startColumn].getInitialY());
            branchStartPoint.row = startRow;
            branchStartPoint.column = startColumn;
        }

        let branchEndPoint = endPoints.getFirstExists(false);
        if (branchEndPoint)
        {
            branchEndPoint.reset(matrix[startRow][startColumn].getEndX(), matrix[startRow][startColumn].getEndY());
            branchEndPoint.row = endRow;
            branchEndPoint.column = endColumn;
        }
    }
    background.sendToBack();
}

function resetStartPoints(item)
{
    item.kill();
}

function resetEndPoints(item)
{
    item.kill();
}

function carHitsEndPoint(car, endPoint) //When the car hits the end point assigned to its entrypoint it stops branching and starts moving as usual
{
    if (car.startPoint != undefined)
    {
        if(car.y >= matrix[car.startPoint.row][car.startPoint.column].getEndY())
        {
            car.startPoint = undefined;
            car.body.velocity.x = MOVEMENT_VECTOR[0] * CAR_SPEED_PER_LEVEL[difficulty];
            car.body.velocity.y = MOVEMENT_VECTOR[1] * CAR_SPEED_PER_LEVEL[difficulty];
            car.angle = 0;
            car.scale.x = 1;
            car.animations.stop();
            car.animations.frame = 0;
        }
    }
}

