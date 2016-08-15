/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, st, n, C, Team) {
	var x = startX,
		y = startY,
		moveAmount = 50,
		leftPressed = false,
		rightPressed = false,
		upPressed = false,
		downPressed = false,
		attacking = false,
		prevAttacking = false,
		stageCanUpdate = true,
		health = 30,
		maxHealth = 30,
		id = -1,
        facing = 1,
		img,
        img_l,
		attackImg,
		name = n,
        attackImg_l,
		Class = C,
		images = [],
		attackImages = [],
		team = Team,
		stage = st;

	var classes = ["hero", "archer"];
	for (var i = 0; i < classes.length; i++){
		img = new Image();
	    img_l = new Image();
		attackImg = new Image();
	    attackImg_l = new Image();
		img.src = "pics/" + classes[i] + ".png";
	    img_l.src = "pics/" + classes[i] + "-l.png";
		attackImg.src = "pics/" + classes[i] + " attack.png";
	    attackImg_l.src = "pics/" + classes[i] + " attack-l.png";
		images.push(img); images.push(img_l);
		attackImages.push(attackImg); attackImages.push(attackImg_l);
	}


	// Getters and setters
	var getX = function() {
		return x;
	};

    var getFacing = function() {
        return facing;
    }

    var setFacing = function(f){
        facing = f;
    }

	var getY = function() {
		return y;
	};

	var setX = function(newX) {
		x = newX;
	};

	var setY = function(newY) {
		y = newY;
	};

	var setId = function(newId) {
		id = newId;
	};

	var getId = function() {
		return id;
	};

	var setAttacking = function(att) {
		attacking = att;
	}

	var getAttacking = function() {
		return attacking;
	}

	var takeDamage = function(dmg) {
		health -= dmg;
	}

	var resetHealth = function() {
		health = maxHealth;
	}

	var getName = function() {
		return name;
	}

	// Update player position
	var update = function(keys, remotePlayers) {
		// Previous position
		var prevX = x,
			prevY = y,
            prevFacing = facing,
			prevAttack = attacking,
			prevStage = stage;

		movement();
		var ret = check_collisions(prevX, prevY);
		prevX = ret[0];
		prevY = ret[1];

		// Can't hold the keys to move
		if (!keys.left){ leftPressed = false; }
		if (!keys.right){ rightPressed = false; }
		if (!keys.up){ upPressed = false; }
		if (!keys.down){ downPressed = false; }

		if (keys.space){ attacking = true; }
		else { attacking = false; }

		// OOB checking after checkStage, since doors are technically OOB
		checkStage(keys);
		if (y > 550){ y = 550; }
		else if (y < 50){ y = 50; }
		if (x > 550){ x = 550; }
		else if (x < 50){ x = 50; }

		var move = false,
            changeFace = false,
			att = false,
			stageChanged = false;
		if (prevX != x || prevY != y){ move = true; }
		if (prevAttack != attacking){ att = true; }
        if (prevFacing != facing){ changeFace = true; }
		if (prevStage != stage) { stageChanged = true; }

		return [move, att, changeFace, stageChanged];
	};

	var checkStage = function(keys){
		for (var i = 0; i < all_objects.length; i++){
			var o = all_objects[i];
			if (o.getClass() != "door"){ continue; }
			var tx, ty;
			if (o.getStage() == stage){ tx = o.getX(); ty = o.getY(); }
			else if (o.getStage2() == stage){ tx = o.getX2(); ty = o.getY2(); }
			if (x == tx && y == ty){
				if (o.getStage() == stage){
					stage = o.getStage2();
					x = o.getX2();
					y = o.getY2();
					break;
				}
				else if (o.getStage2() == stage){
					stage = o.getStage();
					x = o.getX();
					y = o.getY();
					break;
				}
			}
		}
	}

	var collision = function(x2, y2){
		if (x == x2 && y == y2) {
			return true;
		}
		return false;
	}

	var check_collisions = function(prevX, prevY){
		for (var i = 0; i < remotePlayers.length; i++){
			if (remotePlayers[i].getStage() != localPlayer.getStage()){ continue; }
			if (collision(remotePlayers[i].getX(), remotePlayers[i].getY())){
				x = prevX;
				y = prevY;
			}
		}

		for (var i = 0; i < all_objects.length; i++){
			if (all_objects[i].getStage() != localPlayer.getStage() || all_objects[i].getClass() == "door" || all_objects[i].getClass() == "arrow" || all_objects[i].getClass() == "spawnpad"){ continue; }
			if (collision(all_objects[i].getX(), all_objects[i].getY())){
				x = prevX;
				y = prevY;
			}
		}

		return [prevX, prevY];
	}

	var movement = function(){
		// Up key takes priority over down
		if (keys.up && !upPressed) {
			y -= moveAmount;
			upPressed = true;
		} else if (keys.down && !downPressed) {
			y += moveAmount;
			downPressed = true;
		};

		// Left key takes priority over right
		if (keys.left && !leftPressed) {
			x -= moveAmount;
			leftPressed = true;
            setFacing(-1);
		} else if (keys.right && !rightPressed) {
			x += moveAmount;
			rightPressed = true;
            setFacing(1);
		};
	}

	// Draw player
	var draw = function(ctx, rainbow) {
		if (Class == "hero"){ var imgIndex = 0; }
		else if (Class == "archer"){ var imgIndex = 1; }
        var i;
        if (facing == 1){
            i = images[imgIndex*2];
		    if (attacking){ i = attackImages[imgIndex*2]; }
        } else {
            i = images[imgIndex*2+1];
            if (attacking){ i = attackImages[imgIndex*2+1]; }
        }
		var diff = 0;
        if (facing == -1){ diff = 21; }
		if (i == undefined){
			console.log("shit, i is undefined again...");
			i = images[0];
		}
		ctx.drawImage(i, x-diff, y);

		ctx.fillStyle = "#000000";
		if (team == "blue"){ ctx.fillStyle = "#0000FF"; }
		else if (team == "red"){ ctx.fillStyle = "#FF0000"; }
		else if (team == "green"){ ctx.fillStyle = "#00FF00"; }
		ctx.font = "15px Arial";
		if (name == "Andy"){ ctx.fillStyle = rainbow; }
		ctx.fillText(name, x, y-5);
	};

	var getStage = function(){
		return stage;
	};

	var setStage = function(st){
		stage = st;
	};

	var setName = function(n){
		name = n;
	}

	var getClass = function(){
		return Class;
	}

	var setClass = function(c){
		Class = c;
	}

	var getHealth = function(){
		return health;
	}

	var getMaxHealth = function(){
		return maxHealth;
	}

	var setTeam = function(Team){
		team = Team;
	}

	var getTeam = function(){
		return team;
	}


	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		setAttacking: setAttacking,
		getAttacking: getAttacking,
		update: update,
        getFacing: getFacing,
        setFacing: setFacing,
		draw: draw,
		setId: setId,
		getId: getId,
		takeDamage: takeDamage,
		resetHealth: resetHealth,
		getHealth: getHealth,
		getMaxHealth: getMaxHealth,
		getStage: getStage,
		setStage: setStage,
		getName: getName,
		getClass: getClass,
		setClass: setClass,
		setTeam: setTeam,
		getTeam: getTeam,
		setName: setName
	}
};
