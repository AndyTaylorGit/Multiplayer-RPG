/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io"),				// Socket.IO
	Player = require("./Player").Player,
	Enemy = require("./Enemy").Enemy,
	Wall = require("./Wall").Wall,
	Door = require("./Door").Door,
	Arrow = require("./Arrow").Arrow,
	SpawnPad = require("./SpawnPad").SpawnPad;


/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		// Socket controller
	players,
	all_objects,
	ticks = 0,
	spawning = true,
  objectID = 2000;	// Array of connected players


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];
	all_objects = [];

	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8000);

	loadAllStages();

	// Start listening for events
	setEventHandlers();
	setInterval(update, 100);
};

function update() {
	ticks += 1;
	for (var i = 0; i < all_objects.length; i++){
		var object = all_objects[i];
		if (object.getClass() == "enemy"){
			var ret = object.update(players, all_objects);
			var move = ret[0];
			var hit = ret[1];
			if (move) {
				socket.sockets.emit("move object", {x: object.getX(), y: object.getY(), id: object.getId()});
			} if (hit.id != -1){
				var pl = playerById(hit.id);
				if (!pl.getGod()) {
					if (!pl.takeDamage(hit.damage)){
						kill(pl, "Enemy killed " + pl.getName());
					} else {
						socket.sockets.emit("damage player", {id: pl.id, damage: hit.damage});
					}
		 		}
			}
		} else if (object.getClass() == "arrow"){
			var ret = object.update(players, all_objects);
			var move = ret[0];
			var alive = ret[1];
			var hit = ret[2];
			for (var p = 0; p < players.length; p++){
				var pl = players[p];
				if (pl.getGod()){ continue; }
				if (pl.getStage() != object.getStage()){ continue; }
				if (collision(pl.getX(), pl.getY(), object.getX(), object.getY()) && pl != playerById(object.getOId())){
					if (!pl.takeDamage(10)){
						kill(pl, "Arrow killed " + pl.getName());
					} else {
						socket.sockets.emit("damage player", {id: pl.id, damage: 10});
					}
					alive = false;
					break;
				}
			} if (hit != -1){
				var o = objectById(hit);
				alive = false;
				if (!o.takeDamage(10)){
					all_objects.splice(all_objects.indexOf(o), 1);
					if (playerById(object.getOId())){
						playerById(object.getOId()).addKill();
					}
				}
				socket.sockets.emit("damage object", {id: o.getId(), damage: 10});
			}
			if (!alive){
				socket.sockets.emit("del object", {id: object.getId()});
				all_objects.splice(all_objects.indexOf(object), 1);
			} else if (move) {
				if (object.getX() < 0 || object.getX() > 550 || object.getY() < 0 || object.getY() > 550){
					socket.sockets.emit("del object", {id: object.getId()});
				} else {
					socket.sockets.emit("move object", {x: object.getX(), y: object.getY(), id: object.getId()});
				}
			}
		}
	}

	if (spawning && ticks % 100 == 0){
		for (var i = 1; i < 11; i++){
			var skip = false;
			for (var p = 0; p < players.length; p++){
				if (players[p].getStage() == i){
					skip = true;
					break;
				}
			}
			if (skip) { continue; }
			var tod = [];
			for (var o = 0; o < all_objects.length; o++){
				if (all_objects[o].getClass() != "enemy" || all_objects[o].getStage() != i){ continue; }
				tod.push(all_objects[o]);
			}
			for (var x = 0; x < tod.length; x++){
				delObject(tod[x].getId());
			}
			loadEnemies(i);
		}
	}
}


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Socket.IO
	socket.sockets.on("connection", onSocketConnection);
};

// New socket connection
function onSocketConnection(client) {
	util.log("New player has connected: "+client.id);

	// Listen for client disconnected
	client.on("disconnect", onClientDisconnect);

	// Listen for new player message
	client.on("new player", onNewPlayer);

	// Listen for move player message
	client.on("move player", onMovePlayer);

	client.on("attack", attackPlayer);

	client.on("stage player", changeStagePlayer);

	client.on("command", onCommand);

	client.on("leaderboard", onLeaderboard);
};

function onLeaderboard(data){
	var list = [];
	for (var i = 0; i < players.length; i++){
		list.push({name: players[i].getName(), score: players[i].getKills()});
	}
	this.emit("update leaderboard", {board: list});
}

function nameTaken(n){
	for (var i = 0; i < players.length; i++){
		if (players[i].getName() == n){ return true; }
	}
	return false;
}

function getSpawn(p){
	for (var i = 0; i < all_objects.length; i++){
		if (all_objects[i].getClass() == "spawnpad" && all_objects[i].getTeam() == p.getTeam()){
			return all_objects[i].getSpawn()
		}
	}
}

function kill(pl, msg){
	var pos = getSpawn(pl);
	pl.setHealth();
	pl.setX(pos[0]);
	pl.setY(pos[1]);
	pl.setStage(pos[2]);
	socket.sockets.emit("move player", {id: pl.id, x:pos[0], y:pos[1], facing: 1, stage: pos[2]});
	socket.sockets.emit("damage player", {id: pl.id, damage: -30});
	if (msg) {
		socket.sockets.emit("server msg", {string: msg, type:0});
	}
}

function onCommand(data){
	var p = playerById(this.id);
	if (data.string.substring(0, 1) == "/"){
		data.string = data.string.substring(1);
		if (data.string.substring(0, 5) == "name "){
			var n = data.string.substring(5, 10).trim();
			if ((n == "" || n.toLowerCase() == "you") || (n.toLowerCase() == "andy" && !p.getAdmin())){
				this.emit("server msg", {string: "Invalid Name.", type: 3});
			} else if (nameTaken(n)) {
				this.emit("server msg", {string: "Name Taken.", type: 3});
			} else {
				if (n.toLowerCase() == "andy"){ n = "Andy"; }
				socket.sockets.emit("player name", {id: this.id, name: n});
				p.setName(n);
			}
		} 																												else if (data.string.substring(0, 6) == "ctfrv6"){ // this isn't actually my password, just some random digits
			p.setAdmin(true);
			this.emit("server msg", {string: "Admin Granted.", type: 2});

		} else if (data.string.substring(0, 3) == "god"){
			if (p.getAdmin()){
				if (p.getGod()){
					this.emit("server msg", {string: "Godmode Disabled.", type: 2});
				} else {
					this.emit("server msg", {string: "Godmode Enabled.", type: 2});
				}
				p.inverseGod();
			} else {
				this.emit("server msg", {string: "Bad Permissions.", type: 3});
			}

		} else if (data.string.substring(0, 5) == "kill ") {
			if (p.getAdmin()) {
				var n = data.string.substring(5, 10);
				var dp = playerByName(n);
				if (!dp){
					this.emit("server msg", {string: "Invalid Player.", type: 3});
				} else {
					dp.setHealth();
					dp.setX(300);
					dp.setY(550);
					dp.setStage(1);
					socket.sockets.emit("damage player", {id: dp.id, damage: -(30-dp.getHealth())});
					socket.sockets.emit("move player", {id: dp.id, x: 300, y:550, facing: 1, stage: 1});
					socket.sockets.emit("server msg", {string: "Server killed " + dp.getName(), type: 2});
				}
			} else {
				this.emit("server msg", {string: "Bad Permissions.", type: 3});
			}

		} else if (data.string.substring(0, 6) == "class ") {
			var c = data.string.substring(6).toLowerCase();
			if (c != "hero" && c != "archer"){ this.emit("server msg", {string: "Invalid Class.", type: 3}); return; }
			this.emit("server msg", {string: "Class changed to " + c, type: 2});
			socket.sockets.emit("player class", {Class: c, id: this.id});
			var classPlayer = playerById(this.id);
			classPlayer.setClass(c);
		} else if (data.string.substring(0, 5) == "team ") {
			var t = data.string.substring(5).toLowerCase();
			if (t != "blue" && t != "green"){ this.emit("server msg", {string: "Invalid Team.", type: 3}); return; }
			this.emit("server msg", {string: "Team changed to " + t, type: 2});
			socket.sockets.emit("change team", {team: t, id: this.id});
			var tp = playerById(this.id);
			tp.setTeam(t);
			kill(tp);
		} else if (data.string.substring(0, 5) == "spawn") {
			if (p.getAdmin()) {
				if (spawning){ spawning = false; }
				else{ spawning = true; }
			} else {
				this.emit("server msg", {string: "Bad Permissions.", type: 3});
			}
		} else if (data.string.substring(0, 4) == "help") {
			this.emit("server msg", {string: "Type /name to change name", type: 2});
			this.emit("server msg", {string: "Type /class to change class", type: 2});
			this.emit("server msg", {string: "Type /team [team] to change team", type: 2});
			if (p.getAdmin()){
				this.emit("server msg", {string: "Type /god for god mode", type: 2});
				this.emit("server msg", {string: "Type /kill [player] to kill", type: 2});
				this.emit("server msg", {string: "Type /spawn to pause spawning", type: 2});
			}
		} else if (data.string.substring(0, 6) == "admin ") {
			if (p.getAdmin()){
				var n = data.string.substring(6, 11);
				var dp = playerByName(n);
				if (!dp){
					this.emit("server msg", {string: "Invalid Name.", type: 3});
				} else {
					dp.setAdmin(true);
					socket.sockets.emit("server msg", {string: n + " is now an admin.", type: 2});
				}
			} else {
				this.emit("server msg", {string: "Bad Permissions.", type: 3});
			}
		} else {
			this.emit("server msg", {string: "Command Not Found.", type: 3});
		}
	}  else {
		var t = 0;
		if (p.getAdmin()){ t = 2; }
		var s = "[" + p.getName() + "] " + data.string;
		socket.sockets.emit("server msg", {string: s, type: t});
	}
}

function delObject(id){
	socket.sockets.emit("del object", {id: id});
	all_objects.splice(all_objects.indexOf(objectById(id)), 1);
}

function attackPlayer(data) {
	var attackPlayer = playerById(this.id);

	if (!attackPlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	this.broadcast.emit("attack player", {id: attackPlayer.id, attack: data.attack});

	attackPlayer.setAttacking(data.attack);
	if (data.attack){
		if (attackPlayer.getClass() == "archer"){
			objectID++;
			socket.sockets.emit("new arrow", {x: attackPlayer.getX(), y: attackPlayer.getY(), stage: attackPlayer.getStage(), id: objectID})
			all_objects.push(new Arrow(attackPlayer.getX(), attackPlayer.getY(), 50*attackPlayer.getFacing(), 0, attackPlayer.getStage(), objectID, attackPlayer.id));

		} else if (attackPlayer.getClass() == "hero"){
			for (var i = 0; i < all_objects.length; i++){
	            var o = all_objects[i];
				if (o.getClass() == "door"){ continue; }
	            if (checkHit(o, attackPlayer)){
					if (!o.takeDamage(10)){
						//attackPlayer.addKill();
						all_objects.splice(all_objects.indexOf(o), 1);
					}
					socket.sockets.emit("damage object", {id: o.getId(), damage: 10});
				}
	        }

			for (var i = 0; i < players.length; i++){
				var player = players[i];
				if (player.id == this.id){ continue; }
				if (checkHit(player, attackPlayer)){
					if (!player.takeDamage(2)){
						attackPlayer.addKill();
						kill(player, attackPlayer.getName() + " killed " + player.getName());
					} else {
						this.broadcast.emit("damage player", {id: player.id, damage: 2});
						this.emit("damage player", {id: player.id, damage: 2});
					}
					break;
				}
			}
		}
	}
}

function checkHit(o, attackPlayer){
	if (o.getClass() == "wall"){ return false; }
	if (o.getClass() == "enemy" || o.getClass() == "arrow"){
		if (attackPlayer.getY() == o.getY() && attackPlayer.getX() == o.getX()-(50*attackPlayer.getFacing()) && attackPlayer.getStage() == o.getStage()
			&& (o.getX() != 300 || o.getY() != 550 || o.getStage() != 1) && (attackPlayer.getX() != 300 || attackPlayer.getY() != 550 || attackPlayer.getStage() != 1)){
				return true;
			}
	}
	if (attackPlayer.getY() == o.getY() && attackPlayer.getX() == o.getX()-(50*attackPlayer.getFacing()) && attackPlayer.getStage() == o.getStage()
		&& (o.getX() != 300 || o.getY() != 550 || o.getStage() != 1) && (attackPlayer.getX() != 300 || attackPlayer.getY() != 550 || attackPlayer.getStage() != 1) && !o.getGod()
		&& attackPlayer.getTeam() != o.getTeam()){
		return true;
	}
	return false;
}

// Socket client has disconnected
function onClientDisconnect() {
	util.log("Player has disconnected: "+this.id);

	var removePlayer = playerById(this.id);

	// Player not found
	if (!removePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Remove player from players array
	players.splice(players.indexOf(removePlayer), 1);

	// Broadcast removed player to connected socket clients
	this.broadcast.emit("remove player", {id: this.id});
};

// New player has joined
function onNewPlayer(data) {
	var n = "0";
	while (nameTaken(n)){
		n = parseInt(n);
		n++;
		n = n.toString();
	}
	var newPlayer = new Player(data.x, data.y, 1, n, data.Class, data.team);
	newPlayer.id = this.id;

	this.emit("set local id", {id: this.id});
	this.emit("player name", {id: this.id, name: n});


	var ret = getSpawn(newPlayer);
	newPlayer.setX(ret[0]);
	newPlayer.setY(ret[1]);
	newPlayer.setStage(ret[2]);

	this.emit("move player", {id: this.id, x: newPlayer.getX(), y: newPlayer.getY(), stage: newPlayer.getStage(), facing: 1});

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), stage: newPlayer.getStage(), name: newPlayer.getName(), Class: newPlayer.getClass(), team: newPlayer.getTeam()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), stage: existingPlayer.getStage(), name: existingPlayer.getName(), Class: existingPlayer.getClass(), team: existingPlayer.getTeam()});
	};

	for (i = 0; i < all_objects.length; i++){
		var object = all_objects[i];
		if (object.getClass() == "wall"){
			this.emit("new wall", {x: object.getX(), y: object.getY(), stage: object.getStage()});
		} else if (object.getClass() == "enemy"){
			this.emit("new enemy", {x: object.getX(), y: object.getY(), health: object.getHealth(), id: object.getId(), stage: object.getStage()});
		} else if (object.getClass() == "door"){
			this.emit("new door", {x: object.getX(), y: object.getY(), x2: object.getX2(), y2: object.getY2(), s1: object.getStage(), s2: object.getStage2()});
		} else if (object.getClass() == "arrow"){
			this.emit("new arrow", {x: object.getX(), y: object.getY(), id: object.getId(), stage: object.getStage()});
		} else if (object.getClass() == "spawnpad"){
			this.emit("new spawnpad", {x: object.getX(), y: object.getY(), w: object.getWidth(), h: object.getHeight(), stage: object.getStage(), team: object.getTeam()});
		}
	}

	// Add new player to the players array
	players.push(newPlayer);
};

function changeStagePlayer(data) {
	var stagePlayer = playerById(this.id);

	if (!stagePlayer){
		util.log("Player not found: " + this.id);
		return;
	}

	stagePlayer.setStage(data.stage);
	this.broadcast.emit("stage player", {id: stagePlayer.id, stage: stagePlayer.getStage()});
}

// Player has moved
function onMovePlayer(data) {
	// Find player in array
	var movePlayer = playerById(this.id);

	// Player not found
	if (!movePlayer) {
		util.log("Player not found: "+this.id);
		return;
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

    movePlayer.setFacing(data.facing);

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), facing: movePlayer.getFacing()});
};

function loadAllStages(){
	/*all_objects.push(new Wall(100, 100, 4));
	all_objects.push(new Wall(150, 100, 4));
	all_objects.push(new Wall(100, 150, 4));
	all_objects.push(new Enemy(150, 150, newObjectID(), 4));
	//all_objects.push(new Door(300, 0, 300, 600, 1, 2));*/


	all_objects.push(new SpawnPad(50, 50, 150, 150, 1, "blue"));

	all_objects.push(new Door(300, 600, 300, 0, 1, 9));
	all_objects.push(new Door(600, 300, 0, 300, 1, 2));

	all_objects.push(new Door(600, 300, 0, 300, 9, 10));

	all_objects.push(new Wall(100, 100, 10));
	all_objects.push(new Wall(150, 100, 10));
	all_objects.push(new Wall(100, 150, 10));
	all_objects.push(new Wall(450, 100, 10));
	all_objects.push(new Wall(500, 100, 10));
	all_objects.push(new Wall(500, 150, 10));
	all_objects.push(new Wall(450, 500, 10));
	all_objects.push(new Wall(500, 500, 10));
	all_objects.push(new Wall(500, 450, 10));
	all_objects.push(new Wall(100, 500, 10));
	all_objects.push(new Wall(150, 500, 10));
	all_objects.push(new Wall(100, 450, 10));
}

function loadEnemies(level) {
	if (level == 9) {
		addEnemy(new Enemy(300, 300, newObjectID(), 9));
	} else if (level == 10) {
		addEnemy(new Enemy(150, 150, newObjectID(), 10));
		addEnemy(new Enemy(450, 150, newObjectID(), 10));
		addEnemy(new Enemy(450, 450, newObjectID(), 10));
		addEnemy(new Enemy(150, 450, newObjectID(), 10));
	}
}

function addEnemy(e){
	all_objects.push(e);
	socket.sockets.emit("new enemy", {x: e.getX(), y: e.getY(), id: e.getId(), health: e.getHealth(), stage: e.getStage()});
}


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id)
			return players[i];
	};

	return false;
};

function objectById(id) {
	var i;
	for (i = 0; i < all_objects.length; i++) {
		if (all_objects[i].getId() == id){
			return all_objects[i];
		}
	};

	return false;
};

function playerByName(name) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].getName() == name)
			return players[i];
	};

	return false;
};

function newObjectID() {
    objectID += 1;
    return objectID;
}

var collision = function(x1, y1, x2, y2){
	if (x1 == x2 && y1 == y2) {
		return true;
	}
	return false;
}

function rectangleCollosions(rect1, rect2){
	if (rect1.x < rect2.x + rect2.width &&
   	rect1.x + rect1.width > rect2.x &&
   	rect1.y < rect2.y + rect2.height &&
   	rect1.height + rect1.y > rect2.y) {
	    return true;
	}
	return false;
}

/**************************************************
** RUN THE GAME
**************************************************/
init();
