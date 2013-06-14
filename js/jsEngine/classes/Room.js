/**
 * Room:
 * A room is the space wherein game objects reside.
 * A room holds a list of objects to draw, and a list of custom loops.
 * If a room is set as the engine's current rooom (engine.currentRoom); its objects will be drawn, and its custom loops will be executed each time the engine's main loop executes.
 * The engine also has a master room (engine.masterRoom), which is persistent throughout a game (this is the room where you would add persistent objects and custom loops)
 * 
 * By default, the engine creates two empty rooms a master room and a current room.
 */

NewClass('Room', [View]);

/**
 * @param {string} name The name of the room. You can use this name later, to enter the room or to remove it
 * @param {function} onEntered A function to run when the room is entered (set as the engine's current room)
 * @param {function} onLeft A function to run when the room is left
 */
Room.prototype.Room = function (name, onEntered, onLeft) {
	this.View();
	this.name = name ? name : engine.roomList.length;
	this.onEntere = onEntered !== undefined ? onEntered : function () {};
	this.onLeft = onLeft !== undefined ? onLeft : function () {};
	this.loops = {};
	this.addLoop('eachFrame', new CustomLoop());
	engine.addRoom(this);
};

/**
 * Updates all the room's loops.
 * 
 * @private
 */
Room.prototype.update = function () {
	var i;

	for (i in this.loops) {
		if (this.loops.hasOwnProperty(i)) {
			this.loops[i].execute();		
		}
	}
};

/**
 * Adds a custom loop to the room.
 * After being added, the loop will be executed in each frame.
 * 
 * @param {string} name The name the use for the custom loop in the room. When added the loop can be accessed with: [The room].loops[name]
 * @param {object} loop The loop to add
 */
Room.prototype.addLoop = function (name, loop) {
	if (loop === undefined) {throw new Error('Missing argument: loop'); }
	if (name === undefined) {throw new Error('Missing argument: name'); }
	if (this.loops[name] !== undefined) {throw new Error('Name is taken: ' + name); }

	this.loops[name] = loop;
};

/**
 * Removes a custom loop from the room.
 * 
 * @param {string} name The name that the custom loop has been added as
 */
Room.prototype.removeLoop = function (name) {
	if (name === undefined) {throw new Error('Missing argument: name'); }
	if (name === 'eachFrame') {throw new Error('The "eachFrame" loop cannot be removed'); }

	delete this.loops[name];
};

/**
 * Delete the remove-method which was inherited from View
 */
Room.prototype.remove = undefined;