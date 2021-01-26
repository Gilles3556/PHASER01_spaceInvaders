
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example',
    { preload: preload, create: create, update: update, render: render,}
);


/* by pndg: 20201014 
changement du chemin pour les images 
ATTENTION: est en relation avec this.loadPath = "./"; de la page HTML
*/
function preload() {

    game.load.image('bullet', 'assets/invaders/bullet.png');
    game.load.image('enemyBullet', 'assets/invaders/enemy-bullet.png');
    game.load.spritesheet('invader', 'assets/invaders/invader32x32x4.png', 32, 32);
    game.load.image('ship', 'assets/invaders/player.png');
	game.load.image('ship2', 'assets/invaders/player2.png');
	game.load.image('shield', 'assets/invaders/shield-ok-icon.png');
	game.load.image('shield0', 'assets/invaders/shield-nok-icon.png');
	
    game.load.spritesheet('kaboom', 'assets/invaders/explode.png', 128, 128);
	game.load.spritesheet('kaboom2', 'assets/invaders/explode2.png', 128, 128);
    game.load.image('starfield', 'assets/invaders/starfield3.png');
    game.load.image('background', 'assets/starstruck/background2.png');
	
	game.load.audio('coupDeFeu', 'assets/soundEffects/pistol.wav');
    game.load.audio('explosion', 'assets/soundEffects/explosion.mp3');   
}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];
/* by pndg */
var ctrBouclier=0;
var bouclier = false;
var bouclierText;

/* by pndg : mep d'un nombre d'alien selon le level du joueur */
var level_joueur=1;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    /* pndg: 1) pour gérer NON sortie du terrain */
	game.world.enableBody = true;
	game.world.setBounds(0,0,800,600);
	
	//  The scrolling starfield background
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
	
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
	player = game.add.sprite(400, 580, 'ship');
	player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);
	/* pndg: 2)pour gérer NON sortie du terrain */
	player.body.collideWorldBounds=true;
	
	//The baddies!
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens();

    //  The score
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    /* by pndg 20201014: ajout de l'affichage du niveau du joueur */
	//  Le niveau
    levelString = 'Niveau : ';
    levelText = game.add.text(10, 50, levelString + level_joueur, { font: '34px Arial', fill: '#fff' });
	
    //  Lives
    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives : ', { font: '34px Arial', fill: '#fff' });

    //bouclier
	//bouclier = game.add.sprite(game.world.width - 100, 80, 'shield');
	mepBouclier();
	bouclierText = game.add.text(game.world.width - 80, 80, ctrBouclier, { font: '34px Arial', fill: '#fff' });
	bouclierText.visible = false;
   
   //  Text
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Arial', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    for (var i = 0; i < 3; i++) 
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.4;
    }

    //  An explosion pool
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	
	/* by pndg: ajout "écouteur */
	fireEnter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);	
	//Détecter appui sur B:
	fireBouclier = game.input.keyboard.addKey(Phaser.Keyboard.B);	
	
	/* ajout des sons */
	this.sound.add('coupDeFeu');
    this.sound.add('explosion');
		
}
function mepBouclier(){
	if (ctrBouclier<=0){
		name="shield0";
	}else{
		name="shield";
	
	}
    bouclier = game.add.sprite(game.world.width - 100, 80, name);
}
function createAliens () {
	/* by pndg 20201014 : le nombre d eligne dépend du level du joueur */
	maxalien = level_joueur;
	if (level_joueur>5){
		maxalien =5;
	}
	
    for (var y = 0; y < maxalien; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }

    aliens.x = 100;
    aliens.y = 50;

    //  All this does is basically start the invaders moving.
   //	Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
	tween.onLoop.add(descend, this);
	
}
function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    aliens.y += 10;

}

/* by pndg: 20201014 
faire descendre les aliens jqa 300px
sinon les faire remonter
*/
function move_aliens(){
   if ((aliens.y+1)>300){
	   aliens.y-=1;
   }else{
	aliens.y+=1;
   }
	   
}
function update() {
    
    //  Scroll the background
    starfield.tilePosition.y += 2;
    
	//Move the aliens
	move_aliens();
	
	if (player.alive)
	{
		//  Reset the player, then check for movement keys
		player.body.velocity.setTo(0, 0);

		if (cursors.left.isDown)
		{
			player.body.velocity.x = -200;
		}
		else if (cursors.right.isDown)
		{
			player.body.velocity.x = 200;
		}
		//pndg
		if (cursors.up.isDown){
			player.body.velocity.y = -150;
		}
		if (cursors.down.isDown){
			player.body.velocity.y = +150;
		}
		
		//  Firing?
		if (fireButton.isDown)
		{
			this.sound.play('coupDeFeu');
			fireBullet();
		}
		/* by pndg: 20201015 appuie sur ENTER, level suivant */
		if (fireEnter.isDown){
			if (lives.countLiving() < 1 || aliens.countLiving() == 0 ){
				restart();
			}
		}
		
		if (game.time.now > firingTimer)
		{
			enemyFires();
		}

		//  Run collision
		game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
		game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
		/* by pndg : mep méthode sur collision un BULLTETS avec enemyBULLET*/
		game.physics.arcade.overlap(bullets,enemyBullet, bulletHitsEniBullet, null, this);
		/* pndg */
		game.physics.arcade.overlap(player, aliens, enemyHitsPlayer, null, this);
		
	}
	
}

function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}
/* by pndg : 20201015 ajout d'une explosion sur rencontre de 2 tirs */
function bulletHitsEniBullet(bullet,ENIbullet){
	ctrBouclier++;
	mepBouclier();
	console.log("Détection collision : tir J avec tir ENI:"+ctrBouclier);
	bouclierText.text=" = "+ctrBouclier;
	bouclierText.visible = true;
	
	/* pndg son */
	playExplosion();
	
    ENIbullet.kill();
	
	var explosion = explosions.getFirstExists(false);
    explosion.reset(bullet.body.x, bullet.body.y);
    explosion.play('kaboom', 20, false, true);
	bullet.kill();
}
function playExplosion(){
	game.sound.play('explosion');
}
function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;
	
	//  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);
	//pndg: son explosion
	playExplosion();
	this.sound.play('explosion');
    
	if (aliens.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        stateText.text = " You Won, \n Click or \n 'ENTER' to restart";
		
		//by pndg 2021014: gestion du level du joueur */
		level_joueur+=1;
				
		levelText.text = levelString + level_joueur;
		
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
       
		
    }

}

function enemyHitsPlayer (player,bullet) {
    
    bullet.kill();
    live = lives.getFirstAlive();

    if (live){
		if (ctrBouclier<=0){
			mepBouclier();
		
			live.kill();
		}else{
			ctrBouclier--;
			//Afficher
			bouclierText.text=" = "+ctrBouclier;
			bouclierText.visible = true;
		}
    }

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    if (lives.countLiving() < 1)
    {
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;
        
		//by pndg
		// RAZ du level
		level_joueur =1;
		levelText.text = levelString + level_joueur;
		
        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function enemyFires () {
	/* pndg */
	game.sound.play('coupDeFeuAlien');
    
	//  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
        firingTimer = game.time.now + 2000;
    }

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 300; //200;
        }
    }

}

function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function restart () {

    //  A new level starts
	
	//resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();

    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

}