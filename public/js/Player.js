/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY) {
	var x = startX,
		y = startY,
		moveAmount = 50,
		leftPressed = false,
		rightPressed = false,
		upPressed = false,
		downPressed = false,
		attacking = false,
		prevAttacking = false,
		id = -1,
        facing = 1,
		img,
        img_l,
		attackImg,
        attackImg_l;
		
	img = new Image();
    img_l = new Image();
	attackImg = new Image();
    attackImg_l = new Image();
	img.src = "pics/hero.png";
    img_l.src = "pics/hero-l.png";
	attackImg.src = "pics/hero attack.png";
    attackImg_l.src = "pics/hero attack-l.png";
	
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

	// Update player position
	var update = function(keys, remotePlayers) {
		// Previous position
		var prevX = x,
			prevY = y,
            prevFacing = facing,
			prevAttack = attacking;

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
		
		// OOB checking
		if (y > 500){ y = 500; }
		else if (y < 0){ y = 0; }
		if (x > 500){ x = 500; }
		else if (x < 0){ x = 0; }
		
		var move = false, 
            changeFace = false,
			att = false;
		if (prevX != x || prevY != y){ move = true; }
		if (prevAttack != attacking){ att = true; }
        if (prevFacing != facing){ changeFace = true; }
		
		return [move, att, changeFace];
	};
	
	var collision = function(x2, y2){
		if (x == x2 && y == y2) {
			return true;
		}
		return false;
	}
	
	var check_collisions = function(prevX, prevY){
		for (var i = 0; i < remotePlayers.length; i++){
			if (collision(remotePlayers[i].getX(), remotePlayers[i].getY())){
				x = prevX;
				y = prevY;
			}
		}
		
		for (var i = 0; i < all_objects.length; i++){
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
	var draw = function(ctx) {
        var i;
        if (facing == 1){
            i = img;
		    if (attacking){ i = attackImg; }
        } else {
            i = img_l;
            if (attacking){ i = attackImg_l; }
        }
		var diff = 0;
        if (facing == -1){ diff = 21; }
		ctx.drawImage(i, x-diff, y);
	};

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
		getId: getId
	}
};