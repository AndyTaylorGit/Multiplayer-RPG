var Enemy = function(startX, startY, ID) {
	var x = startX,
		y = startY,
		moveAmount = 50,
		attacking = false,
		prevAttacking = false,
        health = 30,
        maxHealth = 30,
        lastMoveX = false, // Alternate between x & y plane movement
		id = ID;
	
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
	
	var getClass = function() {
		return "enemy";
	}
    
    var getHealth = function() {
        return health;
    }
    
    var takeDamage = function(dam) {
        health -= dam;
        if (health <= 0){ return false; }
        return true;
    }
    
    var getMaxHealth = function() {
        return maxHealth;
    }

	// Update player position
	var update = function(players, objects) {
		// Previous position
		var prevX = x,
			prevY = y;

		var ret = movement(players, x, y);
		x = ret[0];
		y = ret[1];
		
		ret = check_collisions(prevX, prevY, players, objects);
		x = ret[0];
		y = ret[1];
		
		// OOB checking
		if (y > 550){ y = 550; }
		else if (y < 50){ y = 50; }
		if (x > 550){ x = 550; }
		else if (x < 50){ x = 50; }
		
		var move = false;
		if (prevX != x || prevY != y){ move = true; }
		
		return move;
	};
	
	var collision = function(x2, y2){
		if (x == x2 && y == y2) {
			return true;
		}
		return false;
	}
	
	var check_collisions = function(prevX, prevY, players, objects){
		for (var i = 0; i < players.length; i++){
			if (collision(players[i].getX(), players[i].getY())){
				x = prevX;
				y = prevY;
			}
		}
		
		for (var i = 0; i < objects.length; i++){
			if (objects[i].getId() == getId()){ continue; }
			if (collision(objects[i].getX(), objects[i].getY())){
				x = prevX;
				y = prevY;
			}
		}
		
		return [x, y];
	}
	
	var movement = function(players, prevX, prevY){
		var closest = -1;
		var maxDist = 999999999;
		for (var i = 0; i < players.length; i++){
			var dist = Math.sqrt((players[i].getX() - x)*(players[i].getX() - x) + (players[i].getY() - y)*(players[i].getY() - y));
			if (dist < maxDist){
				maxDist = dist;
				closest = i;
			}
		}
		if (closest == -1){ return [x, y]; }
        if (!lastMoveX) {
		    if (players[closest].getX() < x){ x -= 50; }
		    else if (players[closest].getX() > x){ x += 50; }
		    else if (players[closest].getY() < y){ y -= 50; }
		    else if (players[closest].getY() > y){ y += 50; }
            lastMoveX = true;
        } else {
		    if (players[closest].getY() < y){ y -= 50; }
		    else if (players[closest].getY() > y){ y += 50; }
            else if (players[closest].getX() < x){ x -= 50; }
		    else if (players[closest].getX() > x){ x += 50; }
            lastMoveX = false;
        }
		return [x, y];
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
		setId: setId,
		getClass: getClass,
        getHealth: getHealth,
        takeDamage: takeDamage,
        getMaxHealth: getMaxHealth,
		getId: getId
	}
};
exports.Enemy = Enemy;