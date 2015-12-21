/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	remotePlayers,	// Remote players
	socket,
	all_objects,
    connected = false;			// Socket connection


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
    
    

	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(300),
		startY = Math.round(550);

	// Initialise the local player
	localPlayer = new Player(startX, startY);

	// Initialise socket connection
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	// Initialise remote players array
	remotePlayers = [];
	all_objects = [];

	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);

	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player move message received
	socket.on("move player", onMovePlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);
	
	// New wall
	socket.on("new wall", newWall);
	
	// New Enemy
	socket.on("new enemy", newEnemy);
	
	socket.on("move enemy", moveEnemy);
    
    socket.on("damage object", damageObject);
	
	// Player is attacking
	socket.on("attack player", attackPlayer);
	
	socket.on("set local id", setLocalID);
};

function newEnemy(data){
	var e = new Enemy(data.x, data.y, data.id);
	if (e.takeDamage(e.getMaxHealth() - data.health)){
        all_objects.push(e);   
    }
}

function moveEnemy(data){
	var object = objectById(data.id);
	if (!object){ return; }
	
	object.setX(data.x);
	object.setY(data.y);
}

function attackPlayer(data){
	var attackPlayer = playerById(data.id);

	// Player not found
	if (!attackPlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	
	attackPlayer.setAttacking(data.attack);
}

// Keyboard key down
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

function damageObject(data) {
    var o = objectById(data.id);
    if (!o){ console.log("Can't find object to be damaged"); return; }
    if (!o.takeDamage(data.damage)){
        all_objects.pop(o);
    }
}

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

    connected = true;
	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

function setLocalID(data) {
	localPlayer.setId(data.id);
}

// Socket disconnected
function onSocketDisconnect() {
    connected = false;
	console.log("Disconnected from socket server");
	remotePlayers = [];
	all_objects = [];
};

function newWall(data){
	var newWall = new Wall(data.x, data.y);
	
	all_objects.push(newWall);
}

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y);
	newPlayer.setId(data.id);
	
	for (var i = 0; i < remotePlayers.length; i++){
		if (newPlayer.getId() == remotePlayers[i].getId()){
			return;
		}
	}
	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Move player
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);
	
	// Player not found
	if (!movePlayer) {
		if (data.id == localPlayer.getId()){ movePlayer = localPlayer; }
		else {
			console.log("Player not found: "+data.id);
			return;
		}
	};

	// Update player position
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
    movePlayer.setFacing(data.facing);
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};


/**************************************************
** GAME ANIMATION LOOP
**************************************************/
function animate() {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
function update() {
	// Update local player and check for change
    if (!connected){ return; }
	var ret = localPlayer.update(keys, remotePlayers)
	if (ret[0] || ret[2]) {
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(), facing: localPlayer.getFacing()});
	} else if (ret[1]) {
		socket.emit("attack player", {attack: localPlayer.getAttacking()});
	}
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
    initialRender();
	// Wipe the canvas clean
	ctx.clearRect(50, 50, 550, 550);
	
	ctx.strokeRect(50, 50, 550, 550); ctx.strokeRect(50, 50, 550, 550);
	for (var x = 0; x < 11; x++){
		for (var y = 0; y < 11; y++){
			if (y % 2 == 0 && x % 2 == 0){
				ctx.strokeRect(x*50+50, y*50+50, 50, 50);
			} else if (y % 2 != 0 && x % 2 != 0) {
				ctx.strokeRect(x*50+50, y*50+50, 50, 50);
			}
		}
	}
    
	
	// Draw the local player
	localPlayer.draw(ctx);

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		remotePlayers[i].draw(ctx);
	};
	for (i = 0; i < all_objects.length; i++) {
		all_objects[i].draw(ctx);
	}
};

function initialRender() {
    var stone = new Image();
    var stoneVert = new Image();
    var stoneCorner = new Image();
    stone.src = "pics/stone wall.png";
    stoneVert.src = "pics/stone vert.png";
    stoneCorner.src = "pics/stone corner.png";
    
    for (var x = 0; x < 13; x++){
        for (var y = 0; y < 13; y++){
            if ((x == 12 && y == 12) || (x == 12 && y == 0) || (x == 0 && y == 0) || (x == 0 && y == 12)){
                ctx.drawImage(stoneCorner, 50*x, 50*y, 50, 50);
            } else if (y == 0 || y == 12){
                ctx.drawImage(stone, 50*x, 50*y, 50, 50);
            } else if (x == 0 || x == 12){
                ctx.drawImage(stoneVert, 50*x, 50*y, 50, 50);
            }
        }
    }
};


/**************************************************
** GAME HELPER FUNCTIONS
**************************************************/
// Find player by ID
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].getId() == id)
			return remotePlayers[i];
	};
	
	return false;
};

function objectById(id){
	for (var i = 0; i < all_objects.length; i++){
		try {
			if (all_objects[i].getId() == id){
				return all_objects[i];
			}
		} catch (err) { 
			
		}
	}
    return false;
}