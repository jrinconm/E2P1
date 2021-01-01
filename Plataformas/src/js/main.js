"use strict";
/* 
Implementación de funcionalidades
Pendiente:
que cuando se obtenga, el protagonista puede hacer salto doble (saltar una vez extra cuando esta en el aire).

Realizado:
Hacer que conforme pase el tiempo se reduzca el número de puntos que te da coger una estrella, hasta un mínimo de 1 punto. Por ejemplo, cada estrella podría valer 100 puntos y cada segundo restarse dos puntos.
El protagonista si lo toca morirá.
Añadir un enemigo que se mueva lateralmente por la pantalla. 
Crear estrellas malvadas (de otro color) que cuando el protagonista las toque te resten 100 puntos.
Coger un ítem que aparezca en un lugar aleatorio de la pantalla y 
*/
let game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('sky', 'assets/andes.jpg');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('starMalvada', 'assets/star.png');
    game.load.image('diamante', 'assets/diamond.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('malo', 'assets/baddie.png', 32, 32);
}

let player;
let platforms;
let cursors;
let enemigo;
let diamante;
let stars;
let starsMalvadas;
let score = 0;
let scoreText;
let timer;
let puntos = 100;
let total = 0;
let finPartidaText;
let direccionEnemigo='left';
let dobleSalto = false;
let solteSalto = false;
let toquesuelo;
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
    //  Las que restan puntos
    starsMalvadas = game.add.group();
    //  We will enable physics for any star that is created in this group
    starsMalvadas.enableBody = true;

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

    //  Creare 3 en sitios random (a la misma altura, pero dentro dfe los 800px)
    for (let i = 0; i < 3; i++)
    {
        //  Create a star inside of the 'stars' group
        var starMalvada = starsMalvadas.create(Math.floor(Math.random() * 801), 0, 'star');

        //  Let gravity do its thing
        starMalvada.body.gravity.y = 300;
        starMalvada.tint = 0x006400;
        //  This just gives each star a slightly random bounce value
        starMalvada.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    diamante = game.add.sprite(Math.floor(Math.random() * 801), 0, 'diamante');
    game.physics.arcade.enable(diamante);
    // Fisicas del enemigo
    diamante.body.bounce.y = 0.2;
    diamante.body.gravity.y = 300;


    //  The score
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    finPartidaText = game.add.text(200, 300-32, '', { fontSize: '32px', fill: '#FFF' });
    finPartidaText.visible = false;
    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
    // Arranco el timer
    timer.start();
    game.input.keyboard.onUpCallback = function (e){
        sueltaTecla(e.keyCode);
    };
}
function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.collide(enemigo, platforms);
    game.physics.arcade.collide(starsMalvadas, platforms);
    game.physics.arcade.collide(diamante, platforms);
    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);
    game.physics.arcade.overlap(player, starsMalvadas, collectStarMalvada, null, this);
    game.physics.arcade.overlap(player, diamante, collectDiamante, null, this);
    // Compruebo si me ha mordido el perro
    game.physics.arcade.overlap(player, enemigo, muertePerro, null, this);
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;
    // Muevo el enemigo de lado a lado
    if(enemigo.body.x===0 && direccionEnemigo==='left'){
        enemigo.animations.play('right');
        direccionEnemigo='right'
    } else if(enemigo.body.x===768 && direccionEnemigo==='right'){     
        enemigo.animations.play('left');
        direccionEnemigo='left'
    } 
    if(direccionEnemigo==='left'){
        enemigo.body.velocity.x = -150;
    } else {
        enemigo.body.velocity.x = 150;
    }
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
    if (cursors.up.isDown && player.body.touching.down){        
        player.body.velocity.y = -350;
        toquesuelo=true;
        solteSalto = false;
    } else {
        if (cursors.up.isDown && solteSalto && dobleSalto && toquesuelo){
                player.body.velocity.y = -350;
                solteSalto = false;     
                toquesuelo=false;
            }
    }
} 
function descuentaPuntos() {
    if(puntos > 2){
        puntos-=2;
    } else {
        puntos = 1;
        timer.stop();
    }
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
function collectStarMalvada (player, starMalvada) {    
    // Removes the star from the screen
    starMalvada.kill();
    //  Add and update the score
    score -= 100;
    scoreText.text = 'Score: ' + score;
}
function collectDiamante (player, diamante) {    
    // Removes the star from the screen
    diamante.kill();
    //  Add and update the score
    dobleSalto = true;
}
function muertePerro (player, enemigo) {    
    // Removes the star from the screen
    player.kill();
    finPartidaText.text = "Perdiste, te ha mordido el perro!";
    finPartidaText.visible = true;
}
function sueltaTecla(tecla){
//    Tecla 38
    if (tecla==38){
        solteSalto = true;
    }
}