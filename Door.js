/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Door = function(startX, startY, xEnd, yEnd, st, st2) {
	var x = startX,
		y = startY,
		x2 = xEnd,
		y2 = yEnd,
		stage = st,
		stage2 = st2;

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

	var getX2 = function() {
		return x2;
	};

	var getY2 = function() {
		return y2;
	}

	var getStage = function() {
		return stage;
	}

	var getStage2 = function() {
		return stage2;
	}

	var getClass = function() {
		return "door";
	}

	var getId = function() {
		return -1;
	}

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		getX2: getX2,
		getY2: getY2,
		getStage: getStage,
		getStage2: getStage2,
		getClass: getClass,
		getId: getId
	}
};
exports.Door = Door;
