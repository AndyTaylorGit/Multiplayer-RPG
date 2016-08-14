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
	messages,
	name,
	rainbow,
	rainbowIndex = 0,
	rainbowTick = 0,
	messageFills,
	input,
	scores = [],
	leaderboard = [],
	pass = false;
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
	/*name = prompt("My apologies this is temporary, what is your name? (5 char limit)", "");
	if (name == "null" || name == ""){ name = "noob"; }
	while (name.toLowerCase() == "andy" || name.toLowerCase() == "you"){
		name = prompt("No you don't, choose again!");
	}*/
	localPlayer = new Player(startX, startY, 1, "", "hero", "green");

	// Initialise socket connection
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	// Initialise remote players array
	remotePlayers = [];
	all_objects = [];
	messages = [];
	rainbow = ["#FF0000", "#FF9900", "#FFFF00", "#33cc00", "#00cccc", "#0066cc", "#9933cc"];
	messageFills = ["#FFFFFF", "#000000", "#00ff00", "#FF0000"];
	messages.push({msg: "Connecting...", type: 0});
	messages.push({msg: "Type /help for help", type: 2});

	// Start listening for events
	setEventHandlers();

	input = new CanvasInput({
  		canvas: document.getElementById('gameCanvas'),
		x: 658,
		y: 700,
		width: 169,
		height: 25,
		onsubmit: messageServer
	});
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

	socket.on("new spawnpad", onNewSpawnPad);

	socket.on("move enemy", moveEnemy);

    socket.on("damage object", damageObject);

	// Player is attacking
	socket.on("attack player", attackPlayer);

	socket.on("set local id", setLocalID);

	socket.on("stage player", changeStagePlayer);

	socket.on("new door", newDoor);

	socket.on("damage player", damagePlayer);

	socket.on("server msg", onServerMessage);

	socket.on("player name", onPlayerNameChange);

	socket.on("update leaderboard", onUpdateLeaderboard);

	socket.on("player class", onPlayerClass);

	socket.on("new arrow", onNewArrow);

	socket.on("move object", moveObject);

	socket.on("del object", deleteObject);
};

function deleteObject(data){
	var o = objectById(data.id);
	if (!o){ return; }
	console.log(all_objects.indexOf(o));
	all_objects.splice(all_objects.indexOf(o), 1);
}

function moveObject(data){
	var o = objectById(data.id);
	if (!o){  return; };
	o.setX(data.x);
	o.setY(data.y);
}

function onNewArrow(data){
	if (!objectById(data.id)){
		all_objects.push(new Arrow(data.x, data.y, data.stage, data.id));
	}
}

function onNewSpawnPad(data){
	all_objects.push(new SpawnPad(data.x, data.y, data.w, data.h, data.stage, data.team));
}

function onPlayerClass(data){
	var p = playerById(data.id);
	if (!p){ console.log("Could not change player class"); return; }
	p.setClass(data.Class);
}

function sortNumber(a, b){
	return b-a;
}

function onUpdateLeaderboard(data){
	scores = [];
	for (var i = 0; i < data.board.length; i++){
		scores.push(data.board[i].score);
	}
	scores.sort(sortNumber);
	leaderboard = data.board;
}

function onPlayerNameChange(data){
	var namePlayer = playerById(data.id);
	if (!namePlayer){ console.log("Could not find player: " + data.id); return; }
	namePlayer.setName(data.name);
}

function damagePlayer(data){
	var dmgPlayer = playerById(data.id);
	if (!dmgPlayer){ console.log("Can't find player: " + data.id); return; }
	if (data.damage == -30){
		dmgPlayer.resetHealth();
	} else {
		dmgPlayer.takeDamage(data.damage);
	}
}

function newDoor(data){
	var d = new Door(data.x, data.y, data.x2, data.y2, data.s1, data.s2);
	all_objects.push(d);
}

function newEnemy(data){
	var e = new Enemy(data.x, data.y, data.id, data.stage);
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
        all_objects.splice(all_objects.indexOf(o), 1);
    }
}

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");
	messages.push({msg: "Connected!", type: 0});
    connected = true;
	// Send local player data to the game server
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY(), Class: localPlayer.getClass(), team: localPlayer.getTeam()});
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
	var newWall = new Wall(data.x, data.y, data.stage);

	all_objects.push(newWall);
}

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new Player(data.x, data.y, data.stage, data.name, data.Class, data.team);
	newPlayer.setId(data.id);

	for (var i = 0; i < remotePlayers.length; i++){
		if (newPlayer.getId() == remotePlayers[i].getId()){
			return;
		}
	}
	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

function onServerMessage(data) {
	messages.push({msg: data.string, type: data.type});
}

function messageServer(){
	pass = false;
	if (!connected){ return; }
	if (input.value() == "/pass"){
		input.value("");
		pass = true;
		return;
	}
	socket.emit("command", {string: input.value()});
	input.value("");
	input.blur();
}

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
	if (data.stage){
		movePlayer.setStage(data.stage);
	}
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

function changeStagePlayer(data) {
	console.log("CHANGE PLAYER STAGE");
	var stagePlayer = playerById(data.id);

	if (!stagePlayer) {
		console.log("Player not found:"+data.id);
		return;
	}

	stagePlayer.setStage(data.stage);
}


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
	var ret = localPlayer.update(keys, remotePlayers);
	if (ret[0] || ret[2]) {
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(), facing: localPlayer.getFacing()});
	} if (ret[1]) {
		socket.emit("attack", {attack: localPlayer.getAttacking()});
	} if (ret[3]) {
		socket.emit("stage player", {stage: localPlayer.getStage()});
		initialRender();
	}

	while (messages.length > 29){
		messages.shift();
	}
};


/**************************************************
** GAME DRAW
**************************************************/
function draw() {
    initialRender();
	ctx.translate(0, 100);
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

	rainbowTick++;
	if (rainbowTick > 50){ rainbowTick = 0; rainbowIndex++; }
	if (rainbowIndex >= rainbow.length){ rainbowIndex = 0; }

	for (i = 0; i < all_objects.length; i++) {
		if (all_objects[i].getStage() != localPlayer.getStage() && all_objects[i].getClass() != "door"){ continue; }
		if (all_objects[i].getClass() == "door" && !(localPlayer.getStage() == all_objects[i].getStage() || localPlayer.getStage() == all_objects[i].getStage2())){ continue; }
		if (all_objects[i].getClass() == "door") {
			all_objects[i].draw(ctx, localPlayer.getStage());
		} else {
			all_objects[i].draw(ctx);
		}
	}

	// Draw the local player
	localPlayer.draw(ctx, rainbow[rainbowIndex]);

	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].getStage() != localPlayer.getStage()){ continue; }
		remotePlayers[i].draw(ctx, rainbow[rainbowIndex]);
	};

	ctx.fillStyle="#888888";
	ctx.fillRect(650, 0, 200, 650);

	ctx.strokeRect(651, 1, 198, 648); // Literally no idea why I need to double draw to make it black,
	ctx.strokeRect(651, 1, 198, 648); // have tried setting the alpha to 1

	ctx.font = "15px OBGB";
	var maxLength = 190;
	var lineOffset = 0;
	var draw = [];

	for (var i = 0; i < messages.length; i++){
		var words = messages[i].msg.split(" ");
		var currLength = 0;

		renderChat(words, draw, messages, maxLength, i);
	}

	for (var i = 0; i < draw.length; i++){
		ctx.fillStyle = draw[i].fill;
		ctx.fillText(draw[i].str, draw[i].x, draw[i].y);
	}

	var r = Math.round((255-(localPlayer.getHealth()/localPlayer.getMaxHealth())*255));
	var g = Math.round(((localPlayer.getHealth()/localPlayer.getMaxHealth())*255));
	if (g <= 125){ g = 0; }
	if (r <= 125){ r = 0; }
	var healthCol = "rgba(" + r.toString() + ", " + g.toString() + ", 0, 0.5)";
	ctx.font = "bold 34px American Typewriter";
	ctx.fillStyle = "#FF0000";
	ctx.fillText("- LIFE -", 630, -70);
	ctx.fillStyle = "#000000";
	ctx.fillRect(590, -60, 210*(localPlayer.getHealth()/localPlayer.getMaxHealth()), 50);
	ctx.fillStyle = healthCol;
	ctx.fillRect(594, -56, 210*(localPlayer.getHealth()/localPlayer.getMaxHealth())-8, 42);

	if (keys.shift){
		ctx.font = "18px Arial";
		if (connected) { socket.emit("leaderboard", {}); }
		ctx.strokeStyle="#000000";
		var namesTaken = [];
		for (var p = -1; p < leaderboard.length; p++){
			//console.log(leaderboard[i].name + " : " + leaderboard[i].score);
			ctx.strokeRect(72, 72+((p+1)*20), 100, 20); ctx.strokeRect(72, 72+((p+1)*20), 100, 20);
			ctx.strokeRect(172, 72+((p+1)*20), 100, 20); ctx.strokeRect(172, 72+((p+1)*20), 100, 20);
			if (p == -1){
				ctx.fillStyle = "rgba(0, 0, 255, 0.4)";
				ctx.fillRect(73, 73, 198, 18);
				ctx.fillStyle = "#000000";
				ctx.fillText("Name", 122-ctx.measureText("Name").width/2, 87);
				ctx.fillText("Score", 222-ctx.measureText("Score").width/2, 87);
				continue;
			}
			for (var i = 0; i < leaderboard.length; i++){
				if (leaderboard[i].score != scores[p]){ continue; }
				if (arrContains(namesTaken, leaderboard[i].name)){
					continue;
				}
				if (leaderboard[i].name == localPlayer.getName()){
					ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
				} else {
					ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
				}
				ctx.fillRect(73, 73+((p+1)*20), 98, 18);
				ctx.fillRect(173, 73+((p+1)*20), 98, 18);
				ctx.fillStyle = "#000000";
				ctx.fillText(leaderboard[i].name, 122-ctx.measureText(leaderboard[i].name).width/2, 87+((p+1)*20));
				ctx.fillText(leaderboard[i].score, 222-ctx.measureText(leaderboard[i].score).width/2, 87+((p+1)*20));
				namesTaken.push(leaderboard[i].name);
				break;
			}

		}
	}

	ctx.translate(0, -100);
	input.render(ctx);

	if (pass){
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(660, 702, 175, 31);
	}
};

function initialRender() {
	ctx.translate(0, 100);
    var stone = new Image();
    var stoneVert = new Image();
    var stoneCorner = new Image();
	var door = new Image();
	door.src = "pics/door1.png";
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
	ctx.translate(0, -100);

	ctx.lineWidth = 2;
	ctx.fillStyle = "#312D2E";
	ctx.strokeStyle = "#000000";
	ctx.fillRect(0, 0, 850, 100);
	ctx.strokeRect(1, 1, 848, 99);
	ctx.lineWidth = 5;
	ctx.fillStyle = "#C3A7B2";
	ctx.strokeRect(450, 10, 80, 80);
	ctx.strokeRect(350, 10, 80, 80);
	ctx.fillRect(454, 14, 72, 72);
	ctx.fillRect(354, 14, 72, 72);
	ctx.lineWidth = 1;
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
	if (id == localPlayer.getId()){ return localPlayer; }

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

// Specifically for the scoreboard
function arrContains(arr, value){
	for (var i = 0; i < arr.length; i++){
		if (arr[i] == value){ return true; }
	}
	return false;
}

/**************************************************
** GENERALLY UGLY FUNCTIONS
**************************************************/
function renderChat(words, draw, messages, maxLength, i){
	var currLength = 0;
	for (var d = 0; d < draw.length; d++){
		draw[d].y = draw[d].y-20;
	}
	for (var w = 0; w < words.length; w++){
		var width = ctx.measureText(words[w]).width;
		if (currLength + width < maxLength){
			draw.push({str: words[w] + " ", x: 660+currLength, y: 590, fill: messageFills[messages[i].type]});
			currLength += ctx.measureText(words[w] + " ").width;
		} else {
			for (var d = 0; d < draw.length; d++){
				draw[d].y = draw[d].y-20;
			}
			draw.push({str: words[w] + " ", x: 660, y: 590, fill: messageFills[messages[i].type]});
			currLength = ctx.measureText(words[w] + " ").width;
		}
	}
}
