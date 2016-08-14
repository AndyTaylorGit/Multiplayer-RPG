/**************************************************
** GAME PLAYER CLASS
**************************************************/
var Player = function(startX, startY, Stage, n, C, Team) {
	var x = startX,
		y = startY,
		stage = Stage,
		attacking = false,
        facing = 1,
		maxHealth = 30,
		health = 30,
		name = n,
		admin = false,
		god = false,
		kills = 0,
		Class = C,
		team = Team,
		rect = {x: startX, y: startY, width: 50, height: 50},
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

	var getStage = function() {
		return stage;
	}

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

	var setStage = function(st) {
		stage = st;
	}

	var getClass = function() {
		return "player";
	}

	var takeDamage = function(dmg) {
		health -= dmg;
		if (health <= 0){ return false; }
		return true;
	}

	var setHealth = function(){
		health = maxHealth;
	}

	var getName = function(){
		return name;
	}

	var setName = function(n){
		name = n;
	}

	var getAdmin = function(){
		return admin;
	}

	var setAdmin = function(a){
		admin = a;
	}

	var getGod = function(){
		return god;
	}

	var inverseGod = function(){
		if (god){ god = false; }
		else { god = true; }
	}

	var getHealth = function(){
		return health;
	}

	var setHealth = function(){
		health = maxHealth;
	}

	var getKills = function(){
		return kills;
	}

	var addKill = function(){
		kills += 1;
	}

	var getClass = function(){
		return Class;
	}

	var setClass = function(w){
		Class = w;
	}

	var getId = function(){
		return id;
	}

	var getTeam = function(){
		return team;
	}

	var setTeam = function(Team){
		team = Team;
	}

	// Define which variables and methods can be accessed
	return {
		getX: getX,
		getY: getY,
		setX: setX,
		setY: setY,
		setHealth: setHealth,
		getStage: getStage,
		setStage: setStage,
        getFacing: getFacing,
        setFacing: setFacing,
		getAttacking: getAttacking,
		setAttacking: setAttacking,
		getClass: getClass,
		takeDamage: takeDamage,
		getName: getName,
		setName: setName,
		setAdmin: setAdmin,
		getAdmin: getAdmin,
		getGod: getGod,
		inverseGod: inverseGod,
		getHealth: getHealth,
		getKills: getKills,
		addKill: addKill,
		setHealth: setHealth,
		getClass: getClass,
		setClass: setClass,
		getId: getId,
		getTeam: getTeam,
		setTeam: setTeam,
		id: id
	}
};

// Export the Player class so you can use it in
// other files by using require("Player").Player
exports.Player = Player;
