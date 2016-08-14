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

    var draw = function(ctx){
        if (team == "blue"){ ctx.fillStyle = "#00FFFF"; }
        else if (team == "green"){ ctx.fillStyle = "#66FF66"; }
        ctx.fillRect(x, y, w, h);
        if (team == "blue"){ ctx.fillStyle = "#0000FF"; }
        else if (team == "green"){ ctx.fillStyle = "#00FF00"; }
        ctx.fillRect(x+10, y+10, w-20, h-20);
    }

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
        draw: draw
	}
};
