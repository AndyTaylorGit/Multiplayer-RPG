/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Wall = function(startX, startY, Stage) {
	var x = startX,
		y = startY,
		stage = Stage,
		id;

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

	var getId = function() {
		return -1;
	}

	var getStage = function() {
		return stage;
	}

	var getClass = function(){
		return "wall";
	}

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		getId: getId,
		getStage: getStage,
		id: id,
		getClass: getClass
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Wall = Wall;
