// play state of the game 
//


var play_state = 
{
	
	preload: function()
	{// preload assets
		console.log('preload'); // loads all files nessary for the level 
		reference_chart = util.load_image(images);
		game.load.spritesheet('redfighter', 'assets/img/redfighter.png', 343, 383);
		game.load.spritesheet('part', 'assets/img/part.png', 17,17);
		game.load.spritesheet('ophanim_sprite', 'assets/img/ophanim_sprite.png', 167, 114 );
		game.load.audio('music_1', 'assets/audio/game_maoudamashii_7_rock51.ogg');
		game.load.audio('music_kappa', 'assets/audio/Runninginthe90s.ogg');
		game.load.audio('boost_sound', 'assets/audio/honoohonoonotama.wav');
		game.load.audio('shoot_sound', 'assets/audio/shagekishot.wav');
		game.load.audio('hit_sound', 'assets/audio/small_explosion1.mp3');
		
	},// End preload 
	
	create: function()
	{// create play_state
		
		console.log('create');
		///*
		music_1 = game.add.audio('music_1');
		music_1.volume = 0.1;
		music_1.loop = true;
		music_1.addMarker('restart', 0.3, 54, 0.1, true);
		music_1.play('restart', 0, 0.1, true, true);
		//*/

		boost_sound = game.add.audio('boost_sound');
		boost_sound.volume = 0.08;
		shoot_sound = game.add.audio('shoot_sound');
		shoot_sound.volume = 0.03;
		hit_sound = game.add.audio('hit_sound');
		hit_sound.volume = 0.2;
		hit_sound.addMarker('start', 0.1, 2, 0.1, false);
		
		
		//create scene 
		game.physics.startSystem(Phaser.Physics.P2JS);
		sky = game.add.sprite(0, 0, 'space');
		//sky.angle = 90;
		sky.height = game.world.height;
		sky.width = game.world.width;
		
		var emitter = game.add.emitter(game.world.centerX, 0, 400);
		emitter.width = game.world.width;
		// emitter.angle = 30; // uncomment to set an angle for the rain.

		emitter.makeParticles('part');
		emitter.forEach(function (p)
		{
			p.tint = 0xEEEEEE;
		});
		emitter.maxParticles = 25;
		emitter.minParticleScale = 0.1;
		emitter.maxParticleScale = 0.5;

		emitter.setYSpeed(300, 500);
		emitter.setXSpeed(-5, 5);

		emitter.minRotation = 0;
		emitter.maxRotation = 0;
		
		emitter.start(false, 1600, 5, 0);
		
		
		shots = game.add.group();
		shots.enableBody = true;
		shots.damage = 10;
		game.physics.arcade.enable(shots);
		
		enemies = game.add.group();
		enemies.enableBody = true;
		
		timer_skirmish = game.time.create(false);
		timer_skirmish.loop(2000, this.skirmish, this);
		timer_skirmish.start();
		
		timer_shoot = game.time.create(false);
		timer_shoot.loop(100, this.shoot, this);
		
		timer_damaged = game.time.create(false);
		timer_damaged.loop(1000, this.stop_damaged, this);
		//timer_move.start();
		
		// create player
		player = game.add.sprite(0, game.world.height - 250, 'redfighter', 4); // set player 150px above the ground 
		player.scale.setTo(0.2, 0.2);
		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.2;
		player.body.gravity.y = 0; // gravity of the player 
		player.body.collideWorldBounds = true; 
		player.move_right = false;
		player.move_left = false;
		player.move_up = false;
		player.move_down = false;
		player.boost = false;
		player.velocity = 350;
		player.boost_velocity = 1000;
		player.health = 100;
		player.damaged = false;
		
		var left = player.animations.add('left', [3, 2, 1, 0], 20, true); // sets the animation sprites of the spritesheet 
		left.onLoop.add(this.animation_stop, this);
		left.loop = false;
		var right = player.animations.add('right', [5, 6, 7, 8], 20, true);
		right.onLoop.add(this.animation_stop, this);
		right.loop = false;
		
		var shooting = game.input.keyboard.addKey(Phaser.Keyboard.NUMPAD_1);
		shooting.onDown.add(() => { 

			this.shoot();
			timer_shoot.start();
			shoot_start = true;
			
		}, this);
		shooting.onUp.add(() => { timer_shoot.stop(false);}, this);
		
		var boosting = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		boosting.onDown.add(() => { 
			player.boost = true;
			boost_sound.play();
		}, this);
		boosting.onUp.add(() => {
			player.boost = false;
			
		}, this);
		
		var w_press = game.input.keyboard.addKey(Phaser.Keyboard.W);
		w_press.onDown.add(() => {
			player.move_up = true;
		}, this);
		w_press.onUp.add(() => {
			player.move_up = false;
		}, this);
		
		var a_press = game.input.keyboard.addKey(Phaser.Keyboard.A);
		a_press.onDown.add(() => {
			player.move_left = true;
			player.animations.play('left');
		}, this);
		a_press.onUp.add(() => {
			player.move_left = false;
		}, this);
		
		var s_press = game.input.keyboard.addKey(Phaser.Keyboard.S);
		s_press.onDown.add(() => {
			player.move_down = true;
			
		}, this);
		s_press.onUp.add(() => {
			player.move_down = false;
		}, this);
		
		var d_press = game.input.keyboard.addKey(Phaser.Keyboard.D);
		d_press.onDown.add(() => {
			player.move_right = true;
			player.animations.play('right');
		}, this);
		d_press.onUp.add(() => {
			player.move_right = false;
		}, this);
		
		// create player data text
		scoreText = game.add.text(16,16, 'score: ' + score, {fontSize: '22px', fill:'#FFF'});
		livesText = game.add.text(16, 40, 'health: ' + player.health,  {fontSize: '22px', fill:'#FFF'});
		levelText = game.add.text(16, 64, 'level: ' + level,  {fontSize: '22px', fill:'#FFF'});
		//barrierText = game.add.text(game.world.width - 150, 16, 'barrier: ' + barrier,  {fontSize: '22px', fill:'#FFF'});
		
		
	},// End create 
	
	update: function() 
	{// run game loop
		//console.log('update');
		score++;
		
		this.move_player();
		this.move_shots();
		this.move_ophanims();
		
		livesText.setText('health: ' + player.health + ' damaged: ' + player.damaged);
		scoreText.setText('score: ' + score); // increase the score by time 
		//barrierText.setText('barrier: ' + parseInt(barrier)); // update the text of the data 
		
		game.physics.arcade.overlap(shots, enemies, this.attack_enemy, null, this); // calls collect_obj, if player and diamond overlap 
		game.physics.arcade.overlap(player, enemies, this.player_hit , null, this);
		
	},
	
	player_hit: function(play, enem)
	{
		if(!player.damaged)
		{
			player.health -= enem.damage;
			if(player.health <= 0)
			{
				music_1.stop();
				game.state.start('game_over');
			}
			player.damaged = true;
			timer_damaged.start();
		}
	},
	
	stop_damaged: function() 
	{
		player.damaged = false;
		timer_damaged.stop(false);
	},
	
	
	collect_obj: function(player, obj)
	{ // player collects objects 
		obj.kill();
		score += obj.parent.points; // get the point assignment from the parent object
		
	}, // End collect_obj
	
	attack_enemy: function(shot, enemy)
	{// damages enemy when fire hits 
		
		hit_sound.play('start', 0, 0.1, false, true);
		if(!enemy.damaged)
		{
			enemy.animations.play('hit');
		}
		enemy.health -= shot.parent.damage;
		if(enemy.health <= 0)
		{
			score += enemy.points;
			enemy.kill();
		}
		shot.kill();
		
	}, // End attack_enemy 
	
	animation_stop: function(sprite, animation)
	{// stop loop animation 
		player.animations.stop(null, true);
		
	}, // End animation_stop
	
	move_shots: function()
	{// moves the shots fired by the ship 
		shots.forEach((shot) => {
			try {
				shot.body.y -= 30;
				if (shot.body.y < -20)
				{
					shots.remove(shot, true);
				}
			}
			catch (e)
			{
				console.log(shot);
			}
		});
	}, // End move_shot
	
	skirmish: function()
	{
		var num = util.rand_int(1, 3);
		for(var i = 0; i < num; i++)
		{
			var pat = util.rand_int(0,2); 
			this.spawn_ophanim(
				pat, // pattern 
				pat ? util.rand_int(200, 600) : util.rand_int(0, 750), // opha_x
				-10, // opha_y
				util.rand_int(300, 500), //origin_x
				0,  // origin_y
				util.rand_int(2, 5), // speed 
				util.rand_int(2, 5), // orbit_speed
				util.rand_int(0, 1) ? 1 : -1// down direction
			);
		}
	},
	
	shoot: function()
	{
		shots.create(player.body.x + 26, player.body.y + 10, 'part');
		shoot_sound.play();
	},
	
	move_player: function()
	{
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
		var vel =  player.boost ? player.boost_velocity : player.velocity;
		if(player.move_right)
		{
			player.body.velocity.x += vel
		}		
		
		if(player.move_left)
		{
			player.body.velocity.x += vel * -1;
		}
		
		if(player.move_up)
		{
			player.body.velocity.y += vel * -1;
		}
	
		if(player.move_down)
		{
			player.body.velocity.y += vel;
		}
		if(!(player.move_right || player.move_left || player.move_up || player.move_down))
		{
			player.animations.frame = 4;
		}
	},
	
	spawn_ophanim: function(p, opha_x, opha_y, o_x, o_y, spd, o_spd, dwn_dir)
	{
		var opha = enemies.create(opha_x, opha_y, 'ophanim_sprite')
		var hit = opha.animations.add('hit', [1,0,1,0], 30, true);
		hit.onComplete.add((sprite, animation) => {
			sprite.damaged = false;
		}, this);
		hit.loop = false;
		opha.type_mode = {
			pattern: p, 
			oribit: false, 
			turn: false, 
			orig_x: o_x,
			orig_y: o_y,
			speed: spd, 
			orbit_speed: o_spd,
			down_direction: dwn_dir,
			theta: 0, 
			rad: 0,
		};
		opha.damaged = false;
		opha.damage = 30;
		opha.health = 50;
		opha.points = 500;
		opha.scale.setTo(0.5, 0.5);
	},
	
	move_ophanims: function()
	{
		try
		{
			enemies.forEach((opha) => { 
				var pat = opha.type_mode.pattern;
				console.log(opha);
				switch(pat)
				{
					case 0: 
						opha.body.y += opha.type_mode.speed;
						if(opha.body.y > game.world.height)
							opha.kill();
					break;
						
					case 1: 
						if(opha.body.y < opha.type_mode.orig_y && !opha.type_mode.orbit)
						{
							opha.body.y += opha.type_mode.speed;
							if(opha.body.y >= opha.type_mode.orig_y)
							{
								opha.body.y = opha.type_mode.orig_y;
								opha.type_mode.rad = opha.body.x - opha.type_mode.orig_x;
								opha.type_mode.orbit = true;
							}
						}
						else
						{
							opha.body.x = (opha.type_mode.rad * Math.cos(opha.type_mode.theta / 180 * Math.PI) + opha.type_mode.orig_x);
							opha.body.y = (opha.type_mode.rad * Math.sin(opha.type_mode.theta / 180 * Math.PI) + opha.type_mode.orig_y);
							opha.type_mode.theta -= opha.type_mode.orbit_speed;
							opha.type_mode.orig_y += opha.type_mode.speed;
						}
						if(opha.body.y - Math.abs(opha.type_mode.rad) > game.world.height)
							opha.kill();
					break;

					case 2:
						if(opha.body.y < game.world.height - opha.body.height && !opha.type_mode.turn)
							opha.body.y += opha.type_mode.speed;
						else if(opha.type_mode.turn && (opha.body.x <= 0 || opha.body.x >= game.world.width - opha.body.width))
						{
							opha.body.y -= opha.type_mode.speed;
						}
						else if(opha.body.y >= game.world.height - opha.body.height)
						{
							opha.type_mode.turn = true;
							opha.body.x += opha.type_mode.speed * opha.type_mode.down_direction;
						}
						
						if(opha.type_mode.turn && opha.body.y < 0 - opha.height)
							opha.kill(); 
						
					break;
				}
			});	
		}catch(e)
		{
			console.log('error');
		}
	},
	
	
	
	
};

