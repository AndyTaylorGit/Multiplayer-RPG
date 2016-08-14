/**************************************************
** GAME KEYBOARD CLASS
**************************************************/
var Keys = function(up, left, right, down) {
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false,
		shift = false,
		space = false;

	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			// Controls
			case 32: // Space
				that.space = true;
				break;
			case 37: // Left
				that.left = true;
				break;
			case 38: // Up
				that.up = true;
				break;
			case 39: // Right
				that.right = true; // Will take priority over the left key
				break;
			case 40: // Down
				that.down = true;
				break;
			case 16:
				that.shift = true;
				break;
		};
	};

	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 32: // Space
				that.space = false;
				break;
			case 37: // Left
				that.left = false;
				break;
			case 38: // Up
				that.up = false;
				break;
			case 39: // Right
				that.right = false;
				break;
			case 40: // Down
				that.down = false;
				break;
			case 16:
				that.shift = false;
				break;
		};
	};

	return {
		up: up,
		left: left,
		right: right,
		down: down,
		shift: shift,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};
