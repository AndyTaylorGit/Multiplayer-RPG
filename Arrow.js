var Arrow = function(startX, startY, xSpeed, ySpeed, Stage, Id, oId) {
	var x = startX,
		y = startY,
		stage = Stage,
		xspeed = xSpeed,
		id = Id,
		oId = oId,
		yspeed = ySpeed;

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

	var getStage = function() {
		return Stage;
	}

	// Update player position
	var update = function(players, objects) {
		var alive = true;
		var id = -1;
		x += xspeed;
		for (var i = 0; i < objects.length; i++){
			var o = objects[i];
			if (collision(o.getX(), o.getY()) && o.getStage() == getStage()){
				if (o.getId() == getId()){ continue; }
				if (o.getClass() == "enemy"){
					id = o.getId();
				}
				alive = false;
			}
		}
		return [true, alive, id];
	};

	var collision = function(x2, y2){
		if (x == x2 && y == y2) {
			return true;
		}
		return false;
	}

	var check_collisions = function(prevX, prevY, players, objects){
		for (var i = 0; i < players.length; i++){
			if (players[i].getStage() != stage){ continue; }
			if (collision(players[i].getX(), players[i].getY())){
				x = prevX;
				y = prevY;
			}
		}

		for (var i = 0; i < objects.length; i++){
			if (objects[i].getId() == getId()|| objects[i].getStage() != stage){ continue; }
			if (collision(objects[i].getX(), objects[i].getY())){
				x = prevX;
				y = prevY;
			}
		}

		return [x, y];
	}

	var movement = function(players){

	}

	var getClass = function(){
		return "arrow";
	}

	var getId = function(){
		return id;
	}

	var getOId = function(){
		return oId;
	}

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		update: update,
		getClass: getClass,
		getId: getId,
		getStage: getStage,
		getOId: getOId
	}
};
exports.Arrow = Arrow;
