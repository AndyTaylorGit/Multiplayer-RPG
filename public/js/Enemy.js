/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY) {
	var x = startX,
		y = startY,
		moveAmount = 50,
		attacking = false,
		prevAttacking = false,
		id = -1,
		img,
		attackImg;
		
	img = new Image();
	attackImg = new Image();
	img.src = "pics/hero.png";
	attackImg.src = "pics/hero attack.png";
	
	// Getters and setters
	var getX = function() {
		return x;
	};

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
			prevAttack = attacking;

		movement();
		var ret = check_collisions(prevX, prevY);
		prevX = ret[0];
		prevY = ret[1];
		
		
		
		// OOB checking
		if (y > 500){ y = 500; }
		else if (y < 0){ y = 0; }
		if (x > 500){ x = 500; }
		else if (x < 0){ x = 0; }
		
		var move = false, 
			att = false;
			
		if (prevX != x || prevY != y){ move = true; }
		if (prevAttack != attacking){ att = true; }
		
		return [move, att];
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
		
	}

	// Draw player
	var draw = function(ctx) {
		var i = img;
		if (attacking){ i = attackImg; }
		ctx.drawImage(i, x, y);
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
		draw: draw,
		setId: setId,
		getId: getId
	}
};