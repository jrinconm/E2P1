let game = new Phaser.Game(320, 360, Phaser.CANVAS, "", { preload: preload, create: create });
// elementos del juego
let EMPTY = 0;
let WALL = 1;
let SPOT = 2;
let CRATE = 3;
let PLAYER = 4;
// Mapa
let level = [[1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 1, 1, 1, 1, 1], [1, 0, 0, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 4, 2, 1, 3, 0, 1], [1, 0, 0, 0, 1, 0, 0, 1], [1, 0, 0, 0, 1, 1, 1, 1], [1, 0, 0, 0, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]];

// array which will contain all crates
let crates = [];

// size of a tile, in pixels
let tileSize = 40;

// the player! Yeah!
let player;
// Control de tecla
let teclaPulsada;
// Temporizador
let timer;
// Fin partida
let finPartidaText;
// Texto del timer
let timerText;
// Puntuacion
let puntos=0;
// Maxima puntuacion
let maxPuntos;
let maxPuntosText;
function preload() {
    game.load.spritesheet("tiles", "assets/tiles.png", 40, 40);
    game.load.spritesheet("muerte", "assets/muerte.png", 40, 40);
}
// function to scale up the game to full screen
function goFullScreen() {
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.updateLayout (true);
}
function create() {
    // going full screen with the function defined at line 32
    goFullScreen();
    // adding two groups to the game. The fist group is called fixedGroup, it will contain
    // all non-moveable elements (everything but crates and player).
    // Then we add movingGroup which will contain moveable elements (crates and player)
    let fixedGroup = game.add.group();
    let movingGroup = game.add.group();
    // letiable used for tile creation
    let tile
    // looping trough all level rows
    for (let i = 0; i < level[0].length; i++) {
        // creation of 2nd dimension of crates array
        crates[i] = [];
        // looping through all level columns
        for (let j = 0; j < level.length; j++) {
            // by default, there are no crates at current level position, so we set to null its
            // array entry
            crates[i][j] = null;
            // what do we have at row j, col i?
            switch (level[j][i]) {
                case PLAYER:
                case PLAYER + SPOT:
                    // player creation
                    player = game.add.sprite(40 * i, 40 * j, "tiles");
                    // assigning the player the proper frame
                    player.frame = level[j][i];
                    // creation of two custom attributes to store player x and y position
                    player.posX = i;
                    player.posY = j;
                    // adding the player to movingGroup
                    movingGroup.add(player);
                    // since the player is on the floor, I am also creating the floor tile
                    tile = game.add.sprite(40 * i, 40 * j, "tiles");
                    tile.frame = level[j][i] - PLAYER;
                    // floor does not move so I am adding it to fixedGroup
                    fixedGroup.add(tile);
                    break;
                case CRATE:
                case CRATE + SPOT:
                    // crate creation, both as a sprite and as a crates array item
                    crates[j][i] = game.add.sprite(40 * i, 40 * j, "tiles");
                    // assigning the crate the proper frame
                    crates[j][i].frame = level[j][i];
                    // adding the crate to movingGroup
                    movingGroup.add(crates[j][i]);
                    // since the create is on the floow, I am also creating the floor tile
                    tile = game.add.sprite(40 * i, 40 * j, "tiles");
                    tile.frame = level[j][i] - CRATE;
                    // floor does not move so I am adding it to fixedGroup
                    fixedGroup.add(tile);
                    break;
                default:
                    // Creo zona de muerte
                    if(j===7 && (i>=1 && i<=3)){
                        tile = game.add.sprite(40 * i, 40 * j, "muerte");
                        tile.frame = 0;
                        tile.tint = 0xFF0000;
                    } else {
                    // creation of a simple tile                    
                        tile = game.add.sprite(40 * i, 40 * j, "tiles");
                        tile.frame = level[j][i];
                    }
                    fixedGroup.add(tile);
            }
        }
    }
    // once the level has been created, we wait for the player to touch or click, then we call
    // beginSwipe function
    game.input.onDown.add(beginSwipe, this);
    // Con teclas
    cursors = game.input.keyboard.createCursorKeys();
    game.input.keyboard.onDownCallback = function (e){pulsaTecla(e.keyCode);
    };
    game.input.keyboard.onUpCallback = function (e){
        teclaPulsada=false;
    };
    // Creo el timer
    timer = game.time.create(false);
    // A los 60 segundos se acaba la partida
    timer.add(60000, gameOver, this);
    // Actualizo el tiempo cada 1 segundos
    timer.loop(1000, cuentaSegundos, this);
    timer.start();
    // Pongo la puntuacion
    finPartidaText = game.add.text(10, 60, '', { fontSize: '32px', fill: '#000' });
    finPartidaText.visible = false;
    maxPuntosText = game.add.text(10, 120, '', { fontSize: '32px', fill: '#000' });
    maxPuntosText.visible = false;
    // Pongo el temporizador
    timerText = game.add.text(10, 0, 'Segundos: 0', { fontSize: '32px', fill: '#000' });
}
// when the player begins to swipe we only save mouse/finger coordinates, remove the touch/click
// input listener and add a new listener to be fired when the mouse/finger has been released,
// then we call endSwipe function
function beginSwipe() {
    startX = game.input.worldX;
    startY = game.input.worldY;
    game.input.onDown.remove(beginSwipe);
    game.input.onUp.add(endSwipe);
}

function pulsaTecla() {
    if(!teclaPulsada){
    startX = game.input.worldX;
    startY = game.input.worldY;
    if (cursors.left.isDown)
    {
        //  Move to the left
        move(-1, 0);
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        move(1, 0);
    }
    else if (cursors.up.isDown)
    {
        //  Move to the arriba
        move(0, -1);
    }
    else if (cursors.down.isDown)
    {
        //  Move to the abajo
        move(0, 1);
    }
    }
    /* 
    game.input.onDown.remove(beginSwipe);
    game.input.onUp.add(endSwipe); */
    teclaPulsada = true;
}

// Fin de juego
function gameOver(texto = "Game over"){
    player.kill();
    finPartidaText.text = texto;
    finPartidaText.visible = true;
    timer.stop();
}
// Victoria
// Fin de juego
function victoria(){
    player.kill();
    // Uso el timer text y asi lo reutilizo
    timerText.text = "Has ganado con "
    finPartidaText.text = puntos + " puntos";
    finPartidaText.visible = true;
    timer.stop();
    grabapartida();
}
//Graba las estadisticas en localstorage si es preciso
function grabapartida(){
    let recordPuntos=localStorage.getItem("recordPuntos");
    // Si no existe la variable en el localstorage
    if ( recordPuntos === null || puntos < recordPuntos) {
        localStorage.setItem("recordPuntos",puntos);
        recordPuntos=puntos;
    }
    maxPuntosText.text = "Record: " + recordPuntos;
    maxPuntosText.visible = true;
}

function cuentaSegundos(){
    timerText.text = "Segundos: " + Math.floor((timer.ms)/1000);
}
// function to be called when the player releases the mouse/finger
function endSwipe() {
    // saving mouse/finger coordinates
    endX = game.input.worldX;
    endY = game.input.worldY;
    // determining x and y distance travelled by mouse/finger from the start
    // of the swipe until the end
    let distX = startX - endX;
    let distY = startY - endY;
    // in order to have an horizontal swipe, we need that x distance is at least twice the y distance
    // and the amount of horizontal distance is at least 10 pixels
    if (Math.abs(distX) > Math.abs(distY) * 2 && Math.abs(distX) > 10) {
        // moving left, calling move function with horizontal and vertical tiles to move as arguments
        if (distX > 0) {
            move(-1, 0);
        }
        // moving right, calling move function with horizontal and vertical tiles to move as arguments
        else {
            move(1, 0);
        }
    }
    // in order to have a vertical swipe, we need that y distance is at least twice the x distance
    // and the amount of vertical distance is at least 10 pixels
    if (Math.abs(distY) > Math.abs(distX) * 2 && Math.abs(distY) > 10) {
        // moving up, calling move function with horizontal and vertical tiles to move as arguments
        if (distY > 0) {
            move(0, -1);
        }
        // moving down, calling move function with horizontal and vertical tiles to move as arguments
        else {
            move(0, 1);
        }
    }
    // stop listening for the player to release finger/mouse, let's start listening for the player to click/touch
    game.input.onDown.add(beginSwipe);
    game.input.onUp.remove(endSwipe);
}

// function to move the player
function move(deltaX, deltaY) {
    // if destination tile is walkable...
    if (isWalkable(player.posX + deltaX, player.posY + deltaY)) {
        // ...then move the player and exit the function
        movePlayer(deltaX, deltaY);
        return;
    }
    // if the destination tile is a crate... 
    if (isCrate(player.posX + deltaX, player.posY + deltaY)) {
        // ...if  after the create there's a walkable tils...
        if (isWalkable(player.posX + 2 * deltaX, player.posY + 2 * deltaY)) {
            // move the crate
            moveCrate(deltaX, deltaY);
            // move the player	
            movePlayer(deltaX, deltaY);
        }
    }
}

// a tile is walkable when it's an empty tile or a spot tile
function isWalkable(posX, posY) {
    return level[posY][posX] == EMPTY || level[posY][posX] == SPOT;
}

// a tile is a crate when it's a... guess what? crate, or it's a crate on its spot
function isCrate(posX, posY) {
    return level[posY][posX] == CRATE || level[posY][posX] == CRATE + SPOT;
}

// function to move the player
function movePlayer(deltaX, deltaY) {
    // moving with a 1/10s tween
    let playerTween = game.add.tween(player);
    playerTween.to({
        x: player.x + deltaX * tileSize,
        y: player.y + deltaY * tileSize
    }, 100, Phaser.Easing.Linear.None, true);
    // updating player old position in level array   
    level[player.posY][player.posX] -= PLAYER;
    // updating player custom posX and posY attributes
    player.posX += deltaX;
    player.posY += deltaY;
    // updating player new position in level array 
    level[player.posY][player.posX] += PLAYER;
    // changing player frame accordingly  
    player.frame = level[player.posY][player.posX];
    // Me he quemado 
    if (player.posX >= 1 && player.posX <= 3 && player.posY === 7){
        gameOver();
    }
    puntos++;
}

// function to move the crate
function moveCrate(deltaX, deltaY) {
    // moving with a 1/10s tween
    let crateTween = game.add.tween(crates[player.posY + deltaY][player.posX + deltaX]);
    crateTween.to({
        x: crates[player.posY + deltaY][player.posX + deltaX].x + deltaX * tileSize,
        y: crates[player.posY + deltaY][player.posX + deltaX].y + deltaY * tileSize,
    }, 100, Phaser.Easing.Linear.None, true);
    // updating crates array   
    crates[player.posY + 2 * deltaY][player.posX + 2 * deltaX] = crates[player.posY + deltaY][player.posX + deltaX];
    crates[player.posY + deltaY][player.posX + deltaX] = null;
    // updating crate old position in level array  
    level[player.posY + deltaY][player.posX + deltaX] -= CRATE;
    // updating crate new position in level array  
    level[player.posY + 2 * deltaY][player.posX + 2 * deltaX] += CRATE;
    // changing crate frame accordingly  
    crates[player.posY + 2 * deltaY][player.posX + 2 * deltaX].frame = level[player.posY + 2 * deltaY][player.posX + 2 * deltaX];
    // Compruebo si la caja está en la X, que es el sprite 5
    if (crates[player.posY + 2 * deltaY][player.posX + 2 * deltaX].frame===5){
        victoria();
    }
}