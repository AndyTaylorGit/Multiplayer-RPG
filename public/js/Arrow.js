/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Arrow = function(startX, startY, st, Id) {
	var x = startX,
		y = startY,
		id = Id,
		img,
		stage = st;

	img = new Image();
	img.src = "pics/arrow.png";
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
		ctx.drawImage(img, x, y);
	};

	var getStage = function() {
		return stage;
	};

	var setStage = function(st) {
		stage = st;
	}

	var getClass = function(){
		return "arrow";
	}

	var getId = function(){
		return id;
	}

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getId: getId,
		draw: draw,
		getStage: getStage,
		setStage: setStage,
		getClass: getClass
	}
};
