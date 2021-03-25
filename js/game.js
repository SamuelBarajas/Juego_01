var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    audio: {
        disableWebAudio: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
    
};

var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var colision_gameOver;



var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/background.png');
    //this.load.spritesheet('calaca','assets/skull.png',{frameWidth: 32, frameHeight: 32})
    this.load.image('ground', 'assets/Terrain_01.png');
    this.load.image('ground_2', 'assets/Terrain_02.png');
    this.load.image('ground_3', 'assets/Terrain_03.png');
    this.load.image('colision','assets/colision.png');
    this.load.image('colision_death','assets/colision.png');
    this.load.image('pared','assets/pared.png');
    this.load.spritesheet('star', 'assets/01.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('bomb', 'assets/Spiked_Ball.png');
    this.load.spritesheet('dude', 'assets/Run.png', { frameWidth: 32, frameHeight: 32 });

    this.load.audio('background_sound','assets/sound_01.mp3');
    this.load.audio('jump','assets/jump.mp3');
}

function create ()
{
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    //aqui se coloca el personaje
    platforms.create(177, 477,'ground').setScale(1).refreshBody();

    platforms.create((Math.random()*100)+50, (Math.random()*100)+100,'ground').setScale(1).refreshBody();
    platforms.create((Math.random()*160)+150, (Math.random()*150)+100,'ground').setScale(1).refreshBody();
    platforms.create((Math.random()*200)+170, (Math.random()*200)+150,'ground').setScale(1).refreshBody();
    platforms.create((Math.random()*300)+290, (Math.random()*250)+240,'ground_2').setScale(1).refreshBody();
    platforms.create((Math.random()*350)+340, (Math.random()*100)+90,'ground').setScale(1).refreshBody();
    platforms.create((Math.random()*450)+440, (Math.random()*200)+190,'ground_2').setScale(1).refreshBody();
   
    //aqui va la colision de los arboles
    platforms.create(650, 400,'ground_3').setScale(1).refreshBody();
    platforms.create(500, 450,'ground_3').setScale(1).refreshBody();
    

    //  colision del suelo
    platforms.create(600, 600, 'colision').setScale(3).refreshBody();
    colision_gameOver = platforms.create(80, 800, 'colision_death').setScale(3).refreshBody();
    colision_gameOver.setCollideWorldBounds(true);
    platforms.create(-30, 553, 'colision').setScale(1).refreshBody();

    //colision de la izquierda y derecha
    platforms.create(-10, 0, 'pared').setScale(2).refreshBody();
    platforms.create(810,0, 'pared').setScale(2).refreshBody();


 

    // The player and its settings
    player = this.physics.add.sprite(150, 450, 'dude');

    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    //player.setCollideWorldBounds(true);


    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 8 }),
        frameRate: 15,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 10
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();
    


    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 8,
        setXY: { x: 100, y: 0, stepX: 70 }
    });

  /*  stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.3, 0.4));

    });*/

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    
    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    var cancion = this.sound.add('background_sound');

        cancion.play({
            loop: true
        });
   
  
}

function update ()
{
    if (gameOver)
    {
        return this.add.text(300, 16, 'GAME OVER', { fontSize: '32px', fill: '#000' });
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-260);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(260);

        player.anims.play('right', true);

    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');

    
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-360);
    }

    

}

function collectStar (player, star)
{
    star.disableBody(true, true);

    //  Add and update the score
    score += 5;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        

    }
    var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
}

function hitBomb (player, bomb)
{
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;


}

