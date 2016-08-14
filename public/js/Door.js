/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Door = function(startX, startY, xEnd, yEnd, st, st2) {
	var x = startX,
		y = startY,
		x2 = xEnd,
		y2 = yEnd,
		img,
		stage = st,
		stage2 = st2;

	img = new Image();
	img.src = "pics/door1.png";

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
	};

	var draw = function(ctx, s) {
		var i = img;
		if (s == stage){ ctx.drawImage(i, x, y, 50, 50); }
		else if (s == stage2){ ctx.drawImage(i, x2, y2, 50, 50); }

	};

	var getStage = function() {
		return stage;
	}

	var getStage2 = function() {
		return stage2;
	}

	var getClass = function() {
		return "door";
	}

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		getX2: getX2,
		getY2: getY2,
		draw: draw,
		getStage: getStage,
		getStage2: getStage2,
		getClass: getClass
	}
};
