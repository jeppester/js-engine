new Class('Engine.CustomLoop', {
	/**
     * @name Engine.CustomLoop
	 * @class A loop class.
     *        Contains a list of functions to run each time the loop executes.
     *        For the loop to be executed, it will have to be added to the current room via the Engine.currentRoom.addLoop.
     *        A loop also has it's own time that is stopped whenever the loop is not executed. This makes it possible to schedule a function execution that will be "postponed" if the loop gets paused.
     *
     * @property {number} framesPerExecution The number of frames between each execution of the custom loop
     * @property {function} maskFunction A function that will be run before each execution, if the function returns true the execution proceeds as planned, if not, the execution will not be run
     * @property {number} time The "local" time of the loop. The loop's time is stopped when the loop is not executed.
     * @property {number} execTime The time it took to perform the last execution
     *
	 * @param {number} [framesPerExecution=1] The number of frames between each execution of the custom loop
	 * @param {function} [maskFunction=function(){}] A function that will be run before each execution, if the function returns true the execution proceeds as planned, if not, the execution will not be run
	 */
	CustomLoop: function (framesPerExecution, maskFunction) {
		this.framesPerExecution = framesPerExecution === undefined ? 1 : framesPerExecution;
		this.maskFunction = maskFunction === undefined ? function () {return true; } : maskFunction;

		// Attached functions
		this.functionsQueue = [];
		this.functions = [];

		// Scheduled executions
		this.executionsQueue = [];
		this.executions = [];

		// Animations
		this.animations = [];

		// Time tracking
		this.lastFrame = engine.frames;
		this.last = engine.now ? engine.now : new Date().getTime();
		this.time = 0;
		this.execTime = 0;
	},
    /** @scope Engine.CustomLoop */

	/**
	 * Attaches a function to the loop.
	 * 
	 * @param {Object} caller The object to run the function as
	 * @param {function} func The function to run on each execution of the custom loop
	 */
	attachFunction: function (caller, func) {
		if (caller === undefined) {throw new Error('Missing argument: caller'); } //dev
		if (func === undefined) {throw new Error('Missing argument: func'); } //dev
		if (typeof func !== "function") {throw new Error('Argument func must be of type function'); } //dev

		this.functionsQueue.push({
			object: caller,
			activity: func
		});
	},

	/**
	 * Queues a function for being added to the executed functions. The queue works as a buffer which prevent functions, that have just been added, from being executed before the next frame.
	 *
	 * @private
	 */
	addFunctionsQueue: function () {
		this.functions = this.functions.concat(this.functionsQueue);
		this.functionsQueue = [];
	},

	/**
	 * Detaches a function from the loop. If the same function is attached multiple times (which is never a good idea), only the first occurrence is detached.
	 * 
	 * @param {Object} caller The object the function was run as
	 * @param {function} func The function to detach from the loop
	 * @return {boolean} Whether or not the function was found and detached
	 */
	detachFunction: function (caller, func) {
		if (caller === undefined) {throw new Error('Missing argument: caller'); } //dev
		if (func === undefined) {throw new Error('Missing argument: func'); } //dev

		var i, a;

		// Search activities and remove function
		for (i = 0; i < this.functions.length; i ++) {
			a = this.functions[i];

			if (a.object === caller && a.activity === func) {
				this.functions.splice(i, 1);
				return true;
			}
		}
		// Search activities queue and remove function
		for (i = 0; i < this.functionsQueue.length; i ++) {
			a = this.functionsQueue[i];

			if (a.object === caller && a.activity === func) {
				this.functionsQueue.splice(i, 1);
				return true;
			}
		}

		return false;
	},

	/**
	 * Detaches all occurrences of a specific function, no matter the caller.
	 * 
	 * @param {function} func The function to detach from the loop
	 * @return {function[]} An array of detached functions
	 */
	detachFunctionsByFunction: function (func) {
		if (func === undefined) {throw new Error('Missing argument: func'); } //dev

		var removeArray, i;

		removeArray = [];
		// Search activities and remove function
		i = this.functions.length;
		while (i--) {
			if (func === this.functions[i].func) {
				removeArray.push(this.functions.splice(i, 1));
			}
		}
		// Search activities queue and remove function
		i = this.functionsQueue.length;
		while (i--) {
			if (func === this.functions[i].func) {
				removeArray.push(this.functionsQueue.splice(i, 1));
			}
		}

		if (removeArray.length) {
			return removeArray;
		}
		else {
			return false;
		}
	},

	/**
	 * Detaches all attached functions with a specific caller
	 * 
	 * @param {Object} caller The object the function was run as
	 * @return {function[]} An array of detached functions
	 */
	detachFunctionsByCaller: function (caller) {
		if (caller === undefined) {throw new Error('Missing argument: caller'); } //dev
		
		var removeArray, i;

		removeArray = [];
		// From activities
		i = this.functions.length;
		while (i--) {
			if (caller === this.functions[i].object) {
				removeArray.push(this.functions.splice(i, 1));
			}
		}

		// From activities queue
		i = this.functionsQueue.length;
		while (i--) {
			if (caller === this.functionsQueue[i].object) {
				removeArray.push(this.functionsQueue.splice(i, 1));
			}
		}

		if (removeArray.length) {
			return removeArray;
		}
		else {
			return false;
		}
	},

	/**
	 * Schedules a function to be run after a given amount of time in the loop.
	 * If the loop is paused before the execution has happened, the loop's time will stand still, and therefore the scheduled execution will not happen until the loop is started again.
	 * 
	 * @param {Object} caller The object with which to run the function (by default the custom loop itself)
	 * @param {function} func The function to execute
	 * @param {number} delay The delay in ms
	 */
	schedule: function (caller, func, delay) {
		if (caller === undefined) {throw new Error('Missing argument: caller'); } //dev
		if (func === undefined) {throw new Error('Missing argument: function'); } //dev
		if (delay === undefined) {throw new Error('Missing argument: delay'); } //dev

		this.executionsQueue.push({
			func: func,
			execTime: this.time + delay,
			caller: caller
        });
	},

	/**
	 * Adds the current executions queue to the list of planned executions. Automatically called at the end of each frame
	 *
	 * @private
	 */
	addExecutionsQueue: function () {
		this.executions = this.executions.concat(this.executionsQueue);
		this.executionsQueue = [];
	},

	/**
	 * Unschedules a single scheduled execution. If multiple similar executions exists, only the first will be unscheduled.
	 * 
	 * @param {function} func The function to unschedule an execution of
	 * @param {Object} caller The object with which the function was to be executed (by default the custom loop itself)
	 * @return {boolean} Whether or not the function was found and unscheduled
	 */
	unschedule: function (caller, func) {
		if (caller === undefined) {throw new Error('Missing argument: caller'); } //dev
		if (func === undefined) {throw new Error('Missing argument: function'); } //dev

		var i, exec;

		// Remove from executions
		for (i = 0; i < this.executions.length; i++) {
			exec = this.executions[i];

			if (caller === exec.caller && (exec.func === func || exec.func.toString() === func)) {
				this.executions.splice(i, 1);
				return true;
			}
		}

		// Remove from executions queue
		for (i = 0; i < this.executionsQueue.length; i++) {
			exec = this.executionsQueue[i];

			if (caller === exec.caller && (exec.func === func || exec.func.toString() === func)) {
				this.executionsQueue.splice(i, 1);
				return true;
			}
		}

		return false;
	},

	/**
	 * Unschedule all scheduled executions of a specific function, no matter the caller.
	 * 
	 * @param {function} func The function to unschedule all executions of
	 * @return {boolean|function[]} False if no functions has been unscheduled, otherwise an array containing the unscheduled functions
	 */
	unscheduleByFunction: function (func) {
		if (func === undefined) {throw new Error('Missing argument: func'); } //dev

		var unscheduledArray, i, exec;

		unscheduledArray = [];
		i = this.executions.length;
		while (i--) {
			exec = this.executions[i];

			if (func === exec.func) {
				unscheduledArray.push(this.executions.splice(i, 1));
			}
		}

		i = this.executionsQueue.length;
		while (i--) {
			exec = this.executionsQueue[i];

			if (func === exec.func) {
				unscheduledArray.push(this.executionsQueue.splice(i, 1));
			}
		}

		if (unscheduledArray.length) {
			return unscheduledArray;
		}
		else {
			return false;
		}
	},

	/**
	 * Unschedule all executions scheduled with a specific caller
	 * 
	 * @param {object} caller The caller
	 * @return {boolean|function[]} False if no functions has been unscheduled, otherwise an array containing the unscheduled functions
	 */
	unscheduleByCaller: function (caller) {
		if (caller === undefined) {throw new Error('Missing argument: caller'); } //dev

		var unscheduledArray, i, exec;

		unscheduledArray = [];
		i = this.executions.length;
		while (i--) {
			exec = this.executions[i];

			if (caller === exec.caller) {
				unscheduledArray.push(this.executions.splice(i, 1));
			}
		}

		i = this.executionsQueue.length;
		while (i--) {
			exec = this.executionsQueue[i];

			if (caller === exec.caller) {
				unscheduledArray.push(this.executionsQueue.splice(i, 1));
			}
		}

		if (unscheduledArray.length) {
			return unscheduledArray;
		}
		else {
			return false;
		}
	},

	/**
	 * Unschedules all scheduled executions
	 * 
	 * @return {function[]} An array of all the unscheduled functions
	 */
	unscheduleAll: function () {
		var removeArray;

		removeArray = [].concat(this.executions, this.executionsQueue);

		this.executions = [];
		this.executionsQueue = [];

		return removeArray;
	},

	/**
	 * Adds a new animation to the animator class (done automatically when running the animate-function).
	 * 
	 * @private
	 * @param {object} animation An animation object
	 */
	addAnimation: function (animation) {
		if (animation === undefined) {throw new Error('Missing argument: animation'); } //dev
		var anim, propList, currentAnimations, i, cur, propName;

		anim = animation;
		anim.start = this.time;

		// If there are other animations of the same properties, stop the current animation of these properties
		propList = Object.keys(anim.prop);
		currentAnimations = anim.obj.getAnimations();
		for (i = 0; i < currentAnimations.length; i ++) {
			cur = currentAnimations[i];
			for (propName in cur.prop) {
				if (cur.prop.hasOwnProperty(propName)) {
					if (propList.indexOf(propName) !== -1) {
						delete cur.prop[propName];
					}
				}
			}
		}

		this.animations.push(anim);
	},

	/**
	 * Stop all animations of a specific object from the loop
	 * 
	 * @param {Lib.Animatable} object The object to stop all animations of
	 */
	removeAnimationsOfObject: function (object) {
        var i;

		i = this.animations.length;
		while (i--) {
			if (object === this.animations[i].obj) {
				this.animations.splice(i, 1);
			}
		}
	},

	/**
	 * Update the loop's animations in a single loop (called by updateAllLoops)
	 * 
	 * @private
	 */
	updateAnimations: function () {
		var animId, a, propId, t;
		
		// Run through the animations to update them
		for (animId = this.animations.length - 1; animId > -1; animId --) {
			a = this.animations[animId];

			if (a === undefined) {
				continue;
			}

			t = this.time - a.start;

			if (t > a.duration) {
				// Delete animation
				this.animations.splice(animId, 1);

				// If the animation has ended: delete it and set the animated properties to their end values
				for (propId in a.prop) {
					if (a.prop.hasOwnProperty(propId)) {
						a.obj[propId] = a.prop[propId].end;
					}
				}
				if (typeof a.callback === "string") {
					eval(a.callback);
				} else {
					a.callback.call(a.obj);
				}
			} else {
				// If the animation is still running: Ease the animation of each property
				for (propId in a.prop) {
					if (a.prop.hasOwnProperty(propId)) {
						a.obj[propId] = engine.ease(a.easing, t, a.prop[propId].begin, a.prop[propId].end - a.prop[propId].begin, a.duration);
					}
				}

				// Execute the animation's onStep-function
				a.onStep();
			}
		}
	},

	/**
	 * Executes the custom loop. This will execute all the functions that have been added to the loop, and checks all scheduled executions to see if they should fire.
	 * This function will automatically be executed, if the loop has been added to the current room, or the engine's masterRoom
	 */
	execute: function () {
		var timer, i, exec;

		timer = new Date().getTime();

		if (!this.maskFunction() || engine.frames % this.framesPerExecution) {return; }

		if (engine.frames - this.lastFrame === this.framesPerExecution) {
			this.time += engine.gameTimeIncrease;
		}

		this.lastFrame = engine.frames;
		this.last = engine.now;

		// Update animations
		this.updateAnimations();

		// Execute scheduled executions
		i = this.executions.length;
		while (i--) {
			if (i >= this.executions.length) {continue; }

			exec = this.executions[i];

			if (this.time >= exec.execTime) {
				exec.func.call(exec.caller);
				this.executions.splice(i, 1);
			}
		}

		// Execute attached functions
		for (i = 0; i < this.functions.length; i++) {
			exec = this.functions[i];

			if (!exec.activity) { //dev
				throw new Error('Trying to exec non-existent attached function'); //dev
			} //dev

			exec.activity.call(exec.object);
		}

		// Add queued attached functions
		this.addFunctionsQueue();

		// Add queued executions
		this.addExecutionsQueue();

		this.execTime = (new Date().getTime()) - timer;
	}
});
