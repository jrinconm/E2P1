"use strict";

let game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('malo', 'assets/baddie.png', 32, 32);
}

let player;
let platforms;
let cursors;
let enemigo;
let stars;
let score = 0;
let scoreText;
let timer;
let puntos = 100;
let puntosText;
let total = 0;
let finPartidaText;

function create() {
    // Creo el timer
    timer = game.time.create(false);
    // Actualizo el tiempo cada 1 segundos
    timer.loop(1000, descuentaPuntos, this);
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    let ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(2, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    let ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');
    enemigo = game.add.sprite(600, game.world.height - 150, 'malo');
    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    game.physics.arcade.enable(enemigo);
    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;
    // Fisicas del enemigo
    enemigo.body.bounce.y = 0.2;
    enemigo.body.gravity.y = 300;
    enemigo.body.collideWorldBounds = true;
    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
    // Animacion del malo
    enemigo.animations.add('left', [0, 1], 10, true);
    enemigo.animations.add('right', [2, 3], 10, true);
    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (let i = 0; i < 12; i++)
    {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'star');

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  The score
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
    puntosText = game.add.text(16, 40, 'Puntos: ' + puntos, { fontSize: '32px', fill: '#000' });
    finPartidaText = game.add.text(200, 300-32, '', { fontSize: '32px', fill: '#000' });
    finPartidaText.visible = false;
    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    // Arranco el timer
    timer.start();
}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(enemigo, platforms);
    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    // Compruebo si me ha mordido el perro
    game.physics.arcade.overlap(player, enemigo, muertePerro, null, this);
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();
        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }

}
function descuentaPuntos() {
    if(puntos > 2){
        puntos-=2;
    } else {
        puntos = 1;
        timer.stop();
    }
    puntosText.text = 'Puntos: ' + puntos;
}
function collectStar (player, star) {    
    // Removes the star from the screen
    star.kill();
    //  Add and update the score
    score += puntos;
    scoreText.text = 'Score: ' + score;
    if(stars.total === 0){
        player.kill();
        finPartidaText.text = "Se acabaron las estrellas por hoy!";
        finPartidaText.visible = true;
    }
}
function muertePerro (player, enemigo) {    
    // Removes the star from the screen
    player.kill();
    finPartidaText.text = "Perdiste, te ha mordido el perro!";
    finPartidaText.visible = true;
}
