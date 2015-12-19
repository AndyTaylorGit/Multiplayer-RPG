/**************************************************
** NODE.JS REQUIREMENTS
**************************************************/
var util = require("util"),					// Utility resources (logging, object inspection, etc)
	io = require("socket.io"),				// Socket.IO
	Player = require("./Player").Player,
	Enemy = require("./Enemy").Enemy,
	Wall = require("./Wall").Wall;


/**************************************************
** GAME VARIABLES
**************************************************/
var socket,		// Socket controller
	players,
	all_objects;	// Array of connected players


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Create an empty array to store players
	players = [];
	all_objects = [];

	// Set up Socket.IO to listen on port 8000
	socket = io.listen(8000);

	all_objects.push(new Wall(100, 100));
	all_objects.push(new Wall(150, 100));
	all_objects.push(new Wall(100, 150));
	all_objects.push(new Enemy(250, 250, 20001));

	// Start listening for events
	setEventHandlers();
	setInterval(update, 500);
};

function update() {
	for (var i = 0; i < all_objects.length; i++){
		var object = all_objects[i];
		if (object.getClass() == "enemy"){
			var move = object.update(players, all_objects);
			if (move) {
				socket.sockets.emit("move enemy", {x: object.getX(), y: object.getY(), id: object.getId()});
			}
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
	
	client.on("attack player", attackPlayer);
};

function attackPlayer(data) {
	var attackPlayer = playerById(this.id);
	
	if (!attackPlayer) {
		util.log("Player not found: "+this.id);
		return;
	};
	
	this.broadcast.emit("attack player", {id: attackPlayer.id, attack: data.attack});
	
	attackPlayer.setAttacking(data.attack);
	if (data.attack){
		for (var i = 0; i < players.length; i++){
			var player = players[i];
			if (player.id == this.id){ continue; }
			if (player.getY() == attackPlayer.getY() && player.getX()-50 == attackPlayer.getX()){
				player.setX(250);
				player.setY(500);
				this.broadcast.emit("move player", {id: player.id, x: 250, y:500});
				this.emit("move player", {id: player.id, x: 250, y:500});
				break;
			}
		}
	}
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
	// Create a new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;
	
	this.emit("set local id", {id: this.id});

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

	// Send existing players to the new player
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
	};
	
	for (i = 0; i < all_objects.length; i++){
		var object = all_objects[i];
		util.log(object.getClass());
		if (object.getClass() == "wall"){
			this.emit("new wall", {x: object.getX(), y: object.getY()});
		} else if (object.getClass() == "enemy"){
			this.emit("new enemy", {x: object.getX(), y: object.getY(), id: object.getId()});
		}
	}
		
	// Add new player to the players array
	players.push(newPlayer);
};

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

	// Broadcast updated position to connected socket clients
	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};


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


/**************************************************
** RUN THE GAME
**************************************************/
init();