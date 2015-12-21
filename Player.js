/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY) {
	var x = startX,
		y = startY,
		attacking = false,
        facing = 1,
		id;

	// Getters and setters
	var getX = function() {
		return x;
	};
    
    var getFacing = function() {
        return facing;
    };
    
    var setFacing = function(f) {
        facing = f;
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
	
	var getAttacking = function(){
		return attacking;
	};
	
	var setAttacking = function(att){
		attacking = att;
	};

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
        getFacing: getFacing,
        setFacing: setFacing,
		getAttacking: getAttacking,
		setAttacking: setAttacking,
		id: id
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;