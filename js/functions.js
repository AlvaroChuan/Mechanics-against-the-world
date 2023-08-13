let spawnPositions;
let playerPositions;
let fireButton;
let fireOnce = false;
let playerIndex = 0;
let nuts;
let cars;
let explosions;
let player;
let difficulty = 0;
let lives = MAX_LIVES, score = 0, time = 0;
let n_cars = 0;
let toolBoxes;
let level = -1;
let timerText;
let scoreText;
let difficultyText;
let lifeIcon;
let loaded = false;
let matrix;
let startPoints;
let endPoints;
let background;
let endedGame;
let soundsNotCreated = true;
let goTo;
let healthUps;
let ammoBags;
let ammoIcon;
let ammo = MAX_AMMO - 1;
let spawnpointsC;
let itemSpawnPositions;

/***********************************************************************************************************************************************
General functions
***********************************************************************************************************************************************/

function getRndInteger(min, max) // Gets a Random integer between two numbers, includes the first one, not the second
{
    return Math.floor(Math.random() * (max - min) ) + min;
}

function loadGameplayScreen()
{
    game.input.enbaled = true;
    background = game.add.image(0, 0, 'backgroundLevel');
    verticalSpace = GAME_HEIGHT / 6;
    difficulty = 0;
}

/***********************************************************************************************************************************************
Menu functions
***********************************************************************************************************************************************/
function changeState()
{
    switch (goTo)
    {
        case btnMainMenu:
        case btnReturn:
            game.state.start('welcomeState');
            break;
        case btnSettings:
            game.state.start('settingsState');
            break;
        case btnLevelA:
            game.state.start('playStateA');
            break;
        case btnLevelB:
            game.state.start('playStateB');
            break;
        case btnLevelC:
            game.state.start('playStateC');
            break;
    }
}

function onButtonPressed(button) //Gets the button pressed and depending on what button, make different things
{
    soundButton.play();
    switch (button)
    {
        case btnMainMenu:
        case btnSettings:
        case btnLevelA:
        case btnLevelB:
        case btnLevelC:
        case btnReturn:
            goTo = button;
            game.camera.onFadeComplete.addOnce(changeState, this);
            game.camera.fade(0, TIME_FADING);
            resetGame();
            break;
        case btnAug:    //Augment the number of threads for the game
            if (numThreads < 9) textNumThreads.text = ++numThreads;
            break;
        case btnDec:    //Decrease the number of threads for the game
            if (numThreads > 3) textNumThreads.text = --numThreads;
            break;
        case btnKey:    //In the options menu, depending on which type of control is selected, the other one is changed to a different image
            if (!keyboardControl)
            {
                btnKey.destroy();
                btnMouse.destroy();
                btnKey = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 3, 'keyboardPressedButton', onButtonPressed);
                btnKey.anchor.setTo(1, 0.5);
                btnMouse = game.add.button(GAME_WIDTH - (5 * MARGIN), verticalSpace * 3, 'mouseButton', onButtonPressed);
                btnMouse.anchor.setTo(1, 0.5);
                keyboardControl = true;
            }
            break;
        case btnMouse:
            if (keyboardControl)
            {
                btnKey.destroy();
                btnMouse.destroy();
                btnKey = game.add.button(GAME_WIDTH - MARGIN, verticalSpace * 3, 'keyboardButton', onButtonPressed);
                btnKey.anchor.setTo(1, 0.5);
                btnMouse = game.add.button(GAME_WIDTH - (5 * MARGIN), verticalSpace * 3, 'mousePressedButton', onButtonPressed);
                btnMouse.anchor.setTo(1, 0.5);
                keyboardControl = false;
            }
            break;
    }
}

/***********************************************************************************************************************************************
General gameplay functions
***********************************************************************************************************************************************/

class Point // Class for the start and end points for the branches
{
    constructor(initialX, initialY, thread)
    {
        this.initialX = initialX;
        this.initialY = initialY;
        this.endX = -1;
        this.endY = -1;
        this.thread = thread;
        this.image = null;
    }

    getInitialX()
    {
        return this.initialX;
    }

    setInitialX(initialX)
    {
        this.initialX = initialX;
    }

    getInitialY()
    {
        return this.initialY;
    }

    setInitialY(initialY)
    {
        this.initialY = initialY;
    }

    getEndX()
    {
        return this.endX;
    }

    setEndX(endX)
    {
        this.endX = endX;
    }

    getEndY()
    {
        return this.endY;
    }

    setEndY(endY)
    {
        this.endY = endY;
    }

    getThread()
    {
        return this.thread;
    }

    setThread(thread)
    {
        this.thread = thread;
    }

    getImage()
    {
        return this.image;
    }

    setImage(image)
    {
        this.image = image;
    }
}

function calculateEndXDisplacement(Y, X) //
{
    //Using the parametric equations of the line and knowing the initial position of X, Y, the final position of Y and the displacement vector,
    //we can solve the equation of Y for t (which would be the amount of times we move the value of the vector) and substitute it in the equation of X
    //to get the final position of X
    let t = Y/MOVEMENT_VECTOR[1];
    let x = X + MOVEMENT_VECTOR[0]*t;
    return x;
}

function calculateDegree(startRow, startColumn) // Using simple trigonometry, gets the angle between a line and the X-axis, taking into account the orientation of the line
{
    if (matrix[startRow][startColumn].getEndX() > matrix[startRow][startColumn].getInitialX()) return 360 - (Math.acos((matrix[startRow][startColumn].getEndY() - matrix[startRow][startColumn].getInitialY())/distanceBetweenPoints(startRow, startColumn))) * (180/Math.PI);
    else return (Math.acos((matrix[startRow][startColumn].getEndY() - matrix[startRow][startColumn].getInitialY())/distanceBetweenPoints(startRow, startColumn))) * (180/Math.PI);
}

function distanceBetweenPoints(startRow, startColumn) // Returns the distance between two points
{
    return Math.sqrt((matrix[startRow][startColumn].getEndX() - matrix[startRow][startColumn].getInitialX())**2 + (matrix[startRow][startColumn].getEndY() - matrix[startRow][startColumn].getInitialY())**2);
}

function calculateSpawnAndPlayerPositions()// Calculate the positions where the cars and items spawns, and where the player can move.
{
    let roadWidth = HORIZONTAL_SPACE / numThreads;
    spawnPositions = new Array(numThreads);
    playerPositions = new Array(numThreads);
    itemSpawnPositions = new Array(numThreads);
    for(let i = 0; i < numThreads; i++)
    {
        itemSpawnPositions[i] = FIRST_THREAD_POSITION + (roadWidth * i) + roadWidth/2;
        spawnPositions[i] = FIRST_THREAD_POSITION + (roadWidth * i) + roadWidth/2;
        playerPositions[i] = FIRST_PLAYER_POSITION + (roadWidth * i) + roadWidth/2;
    }
}

function setLevel(number)
{
    level = number;
}

function checkState(type) // Updates the score and finishes the game if all the cars from the level are destroyed or the player dies.
{
    switch(type)
    {
        case 'carHit':
            score += CAR_SCORE;
            scoreText.text = 'Score: ' + score;
            if(++n_cars == CARS_PER_LEVEL[difficulty])
            {
                if(difficulty < 2)
                {
                    difficultyText.text = 'Level: ' + (++difficulty + 1);
                    if(level == 1) createBranches();
                }
            }
            if(n_cars >= MAX_CARS_PER_PHASE[level])
            {
                if(level == 0)
                {
                    game.state.start('playStateB');
                    soundLevelComplete.play();
                    n_cars = 0;
                }
                else if(level == 1)
                {
                    game.state.start('playStateC');
                    soundLevelComplete.play();
                    n_cars = 0;
                }
                else
                {
                    game.state.start('endState');
                    soundLevelComplete.play();
                    endedGame = 'VICTORY';
                }
            }
            break;
        case 'playerHit':
            if(--lives == 0)
            {
                game.state.start('endState');
                endedGame = 'LOSS';
                soundLevelComplete.play();
            }
            else updateLifeBar('healthDown');
            break;
    }
}

function loadAssets() // Loads all the assets for the game
{
    if(!loaded)
    {
        game.load.image('backgroundLevel', 'assets/imgs/road.png');
        game.load.image('branch', 'assets/imgs/branch.png');
        game.load.image('road', 'assets/imgs/thread.png');
        game.load.spritesheet('player', 'assets/imgs/player.png', 60, 94);
        game.load.image('nut', 'assets/imgs/nut.png');
        game.load.spritesheet('car', 'assets/imgs/car.png', 107, 134);
        game.load.image('life', 'assets/imgs/life.png');
        game.load.image('toolBox', 'assets/imgs/toolBox.png');
        game.load.image('point', 'assets/imgs/point.png');
        game.load.spritesheet('explosion', 'assets/imgs/explosion.png', 107, 104);
        game.load.spritesheet('healthUp', 'assets/imgs/healthUp.png', 22, 15);
        game.load.image('turn', 'assets/imgs/turn.png');
        game.load.image('ammoBag','assets/imgs/ammoBag.png');
        game.load.image('ammo','assets/imgs/ammo.png');
        loaded = true;
    }
}

/***********************************************************************************************************************************************
Create functions
***********************************************************************************************************************************************/

function createThreads() // Create all the threads in a visual way.
{
    if (level != 2)
    {
        for(let i = 0; i < numThreads; i++)
        {
            let threadBG = game.add.image((spawnPositions[i] + playerPositions[i]) / 2, GAME_HEIGHT / 2, 'road');
            threadBG.anchor.setTo(0.5, 0.5);
        }
    }
    else
    {
        for(let i = 0; i < NUM_THREADS_C*3; i++)
        {
            if (i%3 != 1)
            {
                let threadBG = game.add.image((spawnPositions[i] + playerPositions[i]) / 2, GAME_HEIGHT / 2, 'road');
                threadBG.anchor.setTo(0.5, 0.5);
            }
        }
    }
}

function createKeyControls() // Generate the inputs so the player can play.
{
    if(keyboardControl)
    {
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    }
    else
    {
        fireButton = game.input.mousePointer.leftButton;
    }
}

function createPlayer() //Create the player on the position indicated
{
    player = game.add.sprite(playerPositions[playerIndex], PLAYER_Y_POSITION, 'player');
    player.anchor.setTo(0.5, 0.5);
    player.enableBody = true;
    game.physics.arcade.enable(player);
    setupPlayer();
    createNuts();
}

function createNuts() // Create a bunch of nuts to be used during the game
{
    /*deez*/nuts = game.add.group();
    nuts.enableBody = true;
    nuts.createMultiple(MAX_NUTS, 'nut');
    nuts.callAll('events.onOutOfBounds.add','events.onOutOfBounds', resetNuts);
    nuts.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    nuts.setAll('checkWorldBounds', true);
}

function createCars()   //Generates cars to be used during the games
{
    cars = game.add.group();
    cars.enableBody = true;
    cars.createMultiple(MAX_CARS_PER_PHASE[level], 'car');
    cars.callAll('events.onOutOfBounds.add','events.onOutOfBounds', resetCar);
    cars.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    cars.setAll('checkWorldBounds', true);
    cars.forEach(setupCars, this);
    game.time.events.loop(TIMER_RHYTHM, activateCars, this);
}

function createToolBox() // Create a bunch of toolboxes to be used during the game
{
    toolBoxes = game.add.group();
    toolBoxes.enableBody = true;
    toolBoxes.createMultiple(MAX_TOOLBOXES_PER_PHASE[level], 'toolBox');
    toolBoxes.callAll('events.onOutOfBounds.add','events.onOutOfBounds', resetToolBoxes);
    toolBoxes.callAll('anchor.setTo', 'anchor', 0.5, 0.5);
    toolBoxes.setAll('checkWorldBounds', true);
}

function createExplosions() // Create a bunch of explosions (animations) to be used during the game
{
    explosions = game.add.group();
    explosions.createMultiple(MAX_CARS_PER_PHASE[level], 'explosion');
    explosions.forEach(setupExplosion, this);
}

function createHealthUp()   //Create the sprites for the health up to be used during the game
{
    healthUps = game.add.group();
    healthUps.createMultiple(20, 'healthUp');
    healthUps.forEach(setupHealthUp, this);
}

function createSounds() // Create the different sounds
{
    soundButton = game.add.audio('button');
    soundCarChange = game.add.audio('carChange');
    soundCarChange.volume = 20;
    soundExplosion = game.add.audio('explosion');
    soundHealthUp = game.add.audio('healthUp');
    soundLevelComplete = game.add.audio('levelComplete');
    soundMusic = game.add.audio('music');
    soundShoot = game.add.audio('shoot');
    soundReload = game.add.audio('reload');
    soundLevelComplete = game.add.audio('levelComplete');
}

/***********************************************************************************************************************************************
Activate functions
***********************************************************************************************************************************************/

function activateCars() // Generates a car that's not being used and starts running down the thread.
{
    let car = cars.getFirstExists(false);
    if (car)
    {
        car.startPoint = undefined;
        car.thread = getRndInteger(0, numThreads);
        car.reset(spawnPositions[car.thread] - MOVEMENT_VECTOR[0] * 70, -MOVEMENT_VECTOR[1] * 70); //Moves the car out of the screen
        car.body.velocity.x = MOVEMENT_VECTOR[0] * CAR_SPEED_PER_LEVEL[difficulty];
        car.body.velocity.y = MOVEMENT_VECTOR[1] * CAR_SPEED_PER_LEVEL[difficulty];
        if(level == 2)
        {
            car.body.velocity.x = MOVEMENT_VECTOR[0] * CAR_SPEED_PER_LEVEL_PARTC[difficulty];
            car.body.velocity.y = MOVEMENT_VECTOR[1] * CAR_SPEED_PER_LEVEL_PARTC[difficulty];
        }
        car.anchor.setTo(0.5, 0.5);
        car.angle = 0;
        car.scale.x = 1;
        car.animations.stop();
        car.animations.frame = 0;
        if (level == 2) car.life = CAR_LIVES_PER_LEVEL[difficulty];
        else car.life = 1;
    }
}

function activateToolBoxes() // Generates a toolbox that's not being used and starts running down the thread.
{
    let toolBox = toolBoxes.getFirstExists(false);
    if (toolBox)
    {
        if (level == 2) toolBox.reset(itemSpawnPositions[getRndInteger(0, numThreads)] - MOVEMENT_VECTOR[0], - MOVEMENT_VECTOR[1])
        else toolBox.reset(spawnPositions[getRndInteger(0, numThreads)] - MOVEMENT_VECTOR[0], - MOVEMENT_VECTOR[1]);
        toolBox.body.velocity.x = MOVEMENT_VECTOR[0] * TOOLBOX_SPEED_PER_LEVEL[difficulty];
        toolBox.body.velocity.y = MOVEMENT_VECTOR[1] * TOOLBOX_SPEED_PER_LEVEL[difficulty];
        toolBox.scale.x = 0.65;
        toolBox.scale.y = 0.65;
    }
}

/***********************************************************************************************************************************************
Reset functions
***********************************************************************************************************************************************/

function resetNuts(item) //Delete the image of the nut selected
{
    item.kill();
}

function resetCar(item) //Delete the cars and if the level is 2, recharge all the ammo
{
    item.anchor.setTo(0.5, 1);
    item.kill();
    checkState('playerHit');
    if(level == 2)
    {
        for (let i = ammo; i < MAX_AMMO; i++)
        {
            updateAmmo('AmmoUp');
            ammo++;
        }
    }
}

function resetToolBoxes(item)   //Delete the toolBox
{
    item.kill();
}

function resetGame()        //Reset the game to the start values
{
    time = 0;
    score = 0;
    n_cars = 0;
    playerIndex = 0;
    difficulty = 0;
    level = -1;
    lives = MAX_LIVES;
    ammo = MAX_AMMO
}

/***********************************************************************************************************************************************
Hitbox functions
***********************************************************************************************************************************************/

function manageHitboxes() //Using phaser physics system to detect collisions between different objects.
{
    game.physics.arcade.overlap(nuts,cars,nutHitsCar,null,this);
    game.physics.arcade.overlap(nuts,toolBoxes,nutHitsToolBox,null,this);
    game.physics.arcade.overlap(player,toolBoxes,playerHitsToolBox,null,this);
    if(level > 0)
    {
        game.physics.arcade.overlap(cars,startPoints,carHitsStartPoint,null,this);
        game.physics.arcade.overlap(player,ammoBags,playerHitsAmmoBag,null,this);
        game.physics.arcade.overlap(nuts,ammoBags,nutHitsAmmoBag,null,this);
        if(level < 2)
        {
            game.physics.arcade.overlap(cars,endPoints,carHitsEndPoint,null,this);
        }
    }
}

function nutHitsCar(nut, car) //If a nut hits a car
{
    nut.kill();
    if(--car.life <= 0) // If the car does not have health remaining, it explodes
    {
        car.kill();
        checkState('carHit');
        displayExplosion(car);
        if (Math.random() > TOOLBOX_SPAWNRATES_PER_LEVEL[difficulty]) //Rolls a chance to generato a toolbox
        {
            activateToolBoxes();
        }
    }
    if(level == 2) // If we are in part C, it also refills part of your ammo
    {
        for (let i = 0; i < CAR_LIVES_PER_LEVEL[difficulty] && ammo < MAX_AMMO; i++)
        {
            updateAmmo('AmmoUp');
            ammo++;
        }
    }
}

function nutHitsToolBox(nut, toolBox)       //If a nut hits a toolBox, they are deleted and the animation of explosion start
{
    displayExplosion(toolBox);
    nut.kill();
    toolBox.kill();
}

function playerHitsToolBox(player, toolBox) // If a player hits a toolbox, it heals him.
{
    toolBox.kill();
    soundHealthUp.play();
    displayHealthUp(toolBox);
    if(lives < MAX_LIVES)
    {
        updateLifeBar('healthUp');
        lives++;
    }
}

function carHitsStartPoint(car, startPoint) // If a car hits the entrance of a branch
{
    if(level < 2) // If we're not in part C
    {
        if(car.y >= startPoint.y && startPoint != car.startPoint && car.body.velocity.y == MOVEMENT_VECTOR[1] * CAR_SPEED_PER_LEVEL[difficulty]) // We confirm that the car is close to the startPoint and that the startPoint is not the one that the car has saved
                                                                                                                                                // so the car does not do mora than one rolls on the same startPoints
        {
            car.startPoint = startPoint;
            if(getRndInteger(0, 2) == 1) // If it rolls, the car will start going to the branch
            {
                let vector = calculateCarTrajectory(startPoint);
                car.body.velocity.x = vector[0] * CAR_SPEED_PER_LEVEL[difficulty];
                car.body.velocity.y = vector[1] * CAR_SPEED_PER_LEVEL[difficulty];
                displayCar(car);
                soundCarChange.play();
                car.angle = matrix[startPoint.row][startPoint.column].image.angle; // Tha car faces the direction of the branch.
                if (car.y > matrix[startPoint.row][startPoint.column].getEndY()) //Flips the car if necessary
                {
                    car.scale.x = -1;
                }
            }
        }
    }
    else
    {
        if(car.y >= startPoint.y && startPoint != car.startPoint) // If we are in Part C, the zigzag is maded with startPoints, so to get the effect, going throught the branch is needed.
        {
            car.startPoint = startPoint;
            let vector = calculateCarTrajectory(startPoint);
            car.body.velocity.x = vector[0] * CAR_SPEED_PER_LEVEL_PARTC[difficulty];
            car.body.velocity.y = vector[1] * CAR_SPEED_PER_LEVEL_PARTC[difficulty];
            displayCar(car);
            soundCarChange.play();
            soundCarChange.volume = 10;
            car.angle = matrix[startPoint.row][startPoint.column].image.angle;
            if (car.y > matrix[startPoint.row][startPoint.column].getEndY())
            {
                car.scale.x = -1;
            }
        }
    }
}

function calculateCarTrajectory(point)  //This calculates the trajectory of the car in the game using a matrix and math operations
{
    x = matrix[point.row][point.column].getEndX() - matrix[point.row][point.column].getInitialX();
    y = matrix[point.row][point.column].getEndY() - matrix[point.row][point.column].getInitialY();
    unitaryDivision = Math.sqrt(x**2 + y**2);
    x /= unitaryDivision;
    y /= unitaryDivision;

    return [x,y];
}

/***********************************************************************************************************************************************
HUD functions
***********************************************************************************************************************************************/

function createHUD()    //Generates the HUD icons and text for the game
{
    lifeIcon = new Array(lives);
    ammoIcon = new Array(MAX_AMMO);
    timerText = game.add.text(GAME_WIDTH - MARGIN, HUD_MARGIN, 'Time: ' + time, hudStyle);
    timerText.anchor.setTo(1, 0.5);
    scoreText = game.add.text(GAME_WIDTH - MARGIN, HUD_MARGIN + HUD_SPACE, 'Score: ' + score, hudStyle);
    scoreText.anchor.setTo(1, 0.5);
    difficultyText = game.add.text(GAME_WIDTH - MARGIN, HUD_MARGIN + HUD_SPACE * 2, 'Level: ' + (difficulty + 1), hudStyle);
    difficultyText.anchor.setTo(1, 0.5);
    game.time.events.loop(TIMER_RHYTHM, timer, this);
    for(let i = 0; i < lives; i++)
    {
        if(level < 2) lifeIcon[i] = game.add.image(48, GAME_HEIGHT - (SIZE_LIFE * i) - 20, 'life');
        else lifeIcon[i] = game.add.image(48 + SIZE_AMMO, GAME_HEIGHT - (SIZE_LIFE * i) - 20, 'life');
        lifeIcon[i].anchor.setTo(0.5, 1);
    }
    partText = game.add.text(GAME_WIDTH - MARGIN, HUD_MARGIN + HUD_SPACE * 3, 'Part ' + PART[level], hudStyle);
    partText.anchor.setTo(1, 0.5);
    if(level == 2)
    {
        for(let i = 0; i < MAX_AMMO; i++)
        {
            ammoIcon[i] = game.add.image(48, GAME_HEIGHT - (SIZE_AMMO * i) - 20, 'ammo');
            ammoIcon[i].anchor.setTo(0.5, 1);
        }
    }
}

function updateLifeBar(type) //Updates the life bar when the player gets hit or healed
{
    switch (type)
    {
        case 'healthDown':
            lifeIcon[lives].kill();
            break;
        case 'healthUp':
            if(level < 2) lifeIcon[lives] = game.add.image(48, GAME_HEIGHT - (SIZE_LIFE * lives) - 20, 'life');
            else lifeIcon[lives] = game.add.image(48 + SIZE_AMMO, GAME_HEIGHT - (SIZE_LIFE * lives) - 20, 'life');
            lifeIcon[lives].anchor.setTo(0.5, 1);
            break;
    }
}

function timer()   //Updates and displays the timer
{
    timerText.text = ('Time: ' + ++time);
}

/***********************************************************************************************************************************************
Player action functions
***********************************************************************************************************************************************/

function managePlayerMovement() //Manages the player movement using the arrow keys or calculating the distance of the mouse pointer to the player spawn points
{
    if(keyboardControl)
    {
        if (cursors.left.justDown && playerIndex > 0)
        {
            player.x = playerPositions[--playerIndex];
        }
        else if (cursors.right.justDown && playerIndex < (numThreads - 1))
        {
            player.x = playerPositions[++playerIndex];
        }
    }
    else
    {
        let min = 100000;
        for (let i = 0; i < numThreads; i++)
        {
            let distance = Math.sqrt((Math.abs(game.input.mousePointer.x - playerPositions[i]) ** 2) + (Math.abs(game.input.mousePointer.y - PLAYER_Y_POSITION) ** 2));
            if(distance < min)
            {
                min = distance;
                playerIndex = i;
            }
        }
        player.x = playerPositions[playerIndex];
    }
}

function managePlayerShots()   //Manages the player shots using the space bar or the mouse click
{
    if (fireButton.justDown || (!keyboardControl && fireButton.isDown))
    {
        if (!fireOnce)
        {
            if(level < 2)
            {
                soundShoot.play();
                fireNuts();
                fireOnce = true;
            }
            else if(ammo > 0)
            {
                ammo--;
                soundShoot.play();
                fireNuts();
                fireOnce = true;
            }
        }
    }
    else
    {
        fireOnce = false;
    }
}

function fireNuts()    //Fires the nuts in the direction of the car
{
    let nut = shootNut(player.x, player.y, -MOVEMENT_VECTOR[0] * NUT_SPEED, -MOVEMENT_VECTOR[1] * NUT_SPEED);
    displayPlayer(player);
    if(level == 2)updateAmmo('AmmoDown');
}

function shootNut(x, y, vx, vy) //Shoots a nut in the direction of the car
{
    let shot = nuts.getFirstExists(false);
    if (shot)
    {
        shot.reset(x, y);
        shot.body.velocity.x = vx;
        shot.body.velocity.y = vy;
    }
    return shot;
}

/***********************************************************************************************************************************************
Animation functions
***********************************************************************************************************************************************/

function setupExplosion(explosion)
{
    explosion.anchor.x = 0.5;
    explosion.anchor.y = 0.5;
    explosion.animations.add('explosion');
}

function setupHealthUp(healthUp)
{
    healthUp.anchor.x = 0.5;
    healthUp.anchor.y = 0.5;
    healthUp.animations.add('healthUp');
}

function displayHealthUp(item)
{
    let healthUp = healthUps.getFirstExists(false);
    let x = item.body.center.x;
    let y = item.body.center.y;
    healthUp.reset(x, y);
    soundHealthUp.play();
    healthUp.play('healthUp', 15, false, true);
}

function displayExplosion(item)
{
    let explosion = explosions.getFirstExists(false);
    let x = item.body.center.x;
    let y = item.body.center.y;
    explosion.reset(x, y);
    soundExplosion.play();
    explosion.play('explosion', 30, false, true);
}

function setupPlayer()
{
    player.anchor.x = 0.5;
    player.anchor.y = 0.5;
    player.animations.add('player');
    player.animations.frame = 2;
}

function displayPlayer()
{
    player.reset(player.body.center.x, player.body.center.y);
    player.play('player', 5, false, false);
}

function setupCars(car)
{
    car.anchor.x = 0.5;
    car.anchor.y = 0.5;
    car.animations.add('car');
}

function displayCar(car)
{
    car.play('car', 10, true, false);
}