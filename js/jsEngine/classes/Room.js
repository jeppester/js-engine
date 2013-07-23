new Class('Room', [View], {
	/**
     * Constructor for the Room class
     *
     * @name Room
     * @class A room is the space wherein game objects reside.
     *        A room holds a list of objects to draw, and a list of custom loops.
     *        If a room is set as the engine's current room (engine.currentRoom); its objects will be drawn, and its custom loops will be executed each time the engine's main loop executes.
     *        The engine also has a master room (engine.masterRoom), which is persistent throughout a game (this is the room where you would add persistent objects and custom loops)
     * @augments View
     *
     * @property {string} name The name of the room
     * @property {function} onEntered A function which will be executed when the room is entered
     * @property {function} onLeft A function which will be executed when the room is left
     * @property {object} loops An object containing the custom loops which has been added to the room
     *
	 * @param {string} name The name of the room. You can use this name later, to enter the room or to remove it
	 * @param {function} [onEntered=function () {}] A function to run when the room is entered (set as the engine's current room)
	 * @param {function} [onLeft=function () {}] A function to run when the room is left
	 */
	Room: function (name, onEntered, onLeft) {
		this.View();
		this.name = name ? name : engine.roomList.length;
		this.onEntered = onEntered !== undefined ? onEntered : function () {};
		this.onLeft = onLeft !== undefined ? onLeft : function () {};
		this.loops = {};
		this.addLoop('eachFrame', new CustomLoop());
		engine.addRoom(this);
	},
    /** @scope Room */

	/**
	 * Updates all the room's loops.
	 * 
	 * @private
	 */
	update: function () {
		var i;

		for (i in this.loops) {
			if (this.loops.hasOwnProperty(i)) {
				this.loops[i].execute();		
			}
		}
	},

	/**
	 * Adds a custom loop to the room.
	 * After being added, the loop will be executed in each frame.
	 * 
	 * @param {string} name The name the use for the custom loop in the room. When added the loop can be accessed with: [The room].loops[name]
	 * @param {CustomLoop} loop The loop to add
	 */
	addLoop: function (name, loop) {
		if (loop === undefined) {throw new Error('Missing argument: loop'); }
		if (name === undefined) {throw new Error('Missing argument: name'); }
		if (this.loops[name] !== undefined) {throw new Error('Name is taken: ' + name); }

		this.loops[name] = loop;
	},

	/**
	 * Removes a custom loop from the room.
	 * 
	 * @param {string} name The name that the custom loop has been added as
	 */
	removeLoop: function (name) {
		if (name === undefined) {throw new Error('Missing argument: name'); }
		if (name === 'eachFrame') {throw new Error('The "eachFrame" loop cannot be removed'); }

		delete this.loops[name];
	},

	/**
	 * Delete the remove-method which was inherited from View
	 */
	remove: undefined
});