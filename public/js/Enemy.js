/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Enemy = function(startX, startY, ID) {
	var x = startX,
		y = startY,
		moveAmount = 50,
		attacking = false,
		id = ID,
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

	// Draw player
	var draw = function(ctx) {
		var i = img;
		ctx.drawImage(i, x+1, y+1);
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
		setId: setId,
		getId: getId
	}
};