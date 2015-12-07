/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Wall = function(startX, startY) {
	var x = startX,
		y = startY,
		id, 
		img;
	
	img = new Image();
	img.src = "pics/crate.png";
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
	
	var draw = function(ctx) {
		ctx.drawImage(img, x, y, 50, 50);
	};

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		id: id,
		draw: draw
	}
};
