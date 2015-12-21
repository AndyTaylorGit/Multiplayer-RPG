/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Enemy = function(startX, startY, ID) {
	var x = startX,
		y = startY,
		moveAmount = 50,
		attacking = false,
		id = ID,
        health = 30,
        maxHealth = 30,
		img,
		attackImg;
		
	img = new Image();
	attackImg = new Image();
	img.src = "pics/slime.png";
	attackImg.src = "pics/slime.png";
	
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
	};
	
	var getAttacking = function() {
		return attacking;
	};
    
    var getHealth = function() {
        return health;
    }
    
    var takeDamage = function(damage) {
        health -= damage;
        if (health <= 0){ return false; }
        return true;
    }
    
    var getMaxHealth = function() {
        return maxHealth;
    }

	var draw = function(ctx) {
		var i = img;
		ctx.drawImage(i, x+1, y+1);
        ctx.fillStyle="#FF0000";
        ctx.fillRect(x+1, y+1, (48/30)*health, 10);
	};

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		setAttacking: setAttacking,
		getAttacking: getAttacking,
		draw: draw,
        getHealth: getHealth,
        takeDamage: takeDamage,
        getMaxHealth: getMaxHealth,
		setId: setId,
		getId: getId
	}
};