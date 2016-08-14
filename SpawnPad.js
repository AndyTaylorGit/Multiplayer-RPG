/**************************************************
** GAME PLAYER CLASS
**************************************************/
var SpawnPad = function(X, Y, W, H, S, T) {
	var x = X,
		y = Y,
		stage = S,
		w = W,
        h = H,
        team = T;

	// Getters and setters
	var getX = function() {
		return x;
	};

	var getY = function() {
		return y;
	};

    var getWidth = function() {
        return w;
    }

    var getHeight = function() {
        return h;
    }

    var getTeam = function() {
        return team;
    }

	var getStage = function() {
		return stage;
	}

	var getClass = function() {
		return "spawnpad";
	}

	var getId = function() {
		return -1;
	}

    var getSpawn = function() {
        var pos = [];
        for (var x2 = 0; x2 < w/50; x2++){
            for (var y2 = 0; y2 < h/50; y2++){
                pos.push([x+x2*50, y+y2*50, stage]);
            }
        }
        return pos[Math.floor(Math.random()*pos.length)];;
    }

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
        getWidth: getWidth,
        getHeight: getHeight,
        getTeam: getTeam,
		getStage: getStage,
		getClass: getClass,
		getId: getId,
        getSpawn: getSpawn
	}
};
exports.SpawnPad = SpawnPad;
