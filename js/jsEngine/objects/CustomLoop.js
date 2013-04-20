/**
 * CustomLoop:
 * A loop (object) with a list of functions to run each time the loop executes.
 * For the loop to be executed, it will have to be added to the engine via the Engine.addLoop.
 * A loop also has it's own time that is stopped when the loop is not executed. This makes it possible to schedule a function execution that will be "postphoned" if the loop is paused before the execution.
 */

NewObject('CustomLoop');

/**
 * Constructor for CustomLoop object
 * 
 * @param {number} framesPerExecution The number of frames between each execution of the custom loop
 * @param {function} maskFunction A function that will be run before each execution, if the function returns true the execution procedes as planned, if not, the execution will not be run
 */
CustomLoop.prototype.customLoop = function (framesPerExecution, maskFunction) {
	this.framesPerExecution = framesPerExecution === undefined ? 1 : framesPerExecution;
	this.maskFunction = maskFunction === undefined ? function () {return true; } : maskFunction;

	this.activitiesQueue = [];
	this.activities = [];
	this.animations = [];
	this.lastFrame = engine.frames;
	this.last = engine.now ? engine.now : new Date().getTime();
	this.time = 0;
	this.execTime = 0;
	this.scheduledExecutions = [];
};

/**
 * Attaches a function to the loop.
 * 
 * @param {object} caller The object to run the function as
 * @param {function} func The function to run on each execution of the custom loop
 * @param {string} loop A string representing the loop to add the function to
 */
CustomLoop.prototype.attachFunction = function (caller, func) {
	if (caller === undefined) {throw new Error('Missing argument: caller'); }
	if (func === undefined) {throw new Error('Missing argument: func'); }
	if (typeof func !== "function") {throw new Error('Argument func must be of type function'); }

	this.activitiesQueue.push({
		object: caller,
		activity: func
	});
};

/**
 * Detaches a function from the loop
 * 
 * @param {object} caller The object the function was run as
 * @param {function} func The function to detach from the loop
 * @param {string} loop A string representing the loop to remove the function from
 * @return {object} The detached function
 */
CustomLoop.prototype.detachFunction = function (caller, func) {
	if (caller === undefined) {throw new Error('Missing argument: caller'); }
	if (func === undefined) {throw new Error('Missing argument: func'); }

	var removeArray, i, a;

	removeArray = [];

	// Search activities and remove function
	for (i = 0; i < this.activities.length; i ++) {
		a = this.activities[i];

		if (a.object === caller && a.activity === func) {
			removeArray.push(this.activities.splice(i, 1));
		}
	}
	// Search activities queue and remove function
	for (i = 0; i < this.activitiesQueue.length; i ++) {
		a = this.activitiesQueue[i];

		if (a.object === caller && a.activity === func) {
			removeArray.push(this.activitiesQueue.splice(i, 1));
		}
	}

	if (removeArray.length) {
		return removeArray;
	}
	else {
		return false;
	}
};

/**
 * Schedules a function to be run after a given amount of time in the loop.
 * If the loop is paused before the execution has happened, the loop's time will stand still, and therefore the scheduled execution will not happen untill the loop is started again.
 * 
 * @param {function} func The function to execute
 * @param {number} delay The delay in ms
 * @caller {object} caller The object with which to run the function (by default the custom loop itself)
 */
CustomLoop.prototype.schedule = function (func, delay, caller) {
	if (func === undefined) {throw new Error('Missing argument: function'); }
	if (delay === undefined) {throw new Error('Missing argument: delay'); }
	caller = caller !== undefined ? caller : this;

	this.scheduledExecutions.push({
		func: func,
		execTime: this.time + delay,
		caller: caller,
	});
};

/**
 * Unschedules all scheduled executions
 */
CustomLoop.prototype.unScheduleAll = function () {
	this.scheduledExecutions = [];
};

/**
 * Unschedules a single scheduled execution
 * 
 * @param {function} func The function to unschedule an execution of
 * @param {object} caller The object with which the function was to be executed (by default the custom loop itself)
 */
CustomLoop.prototype.unSchedule = function (func, caller) {
	if (func === undefined) {throw new Error('Missing argument: function'); }
	caller = caller !== undefined ? caller : this;

	var i, exec;

	for (i = 0; i < this.scheduledExecutions.length; i++) {
		exec = this.scheduledExecutions[i];

		if (caller === exec.caller && (exec.func === func || exec.func.toString() === func)) {
			this.scheduledExecutions.splice(i, 1);
			break;
		}
	}
};

/**
 * Queues a function for being added to the executed functions. The queue works as a buffer which prevent functions, that have just been added, from being executed before the next frame.
 *
 * @private
 */
CustomLoop.prototype.addQueue = function () {
	this.activities = this.activities.concat(this.activitiesQueue);
	this.activitiesQueue = [];
};

/**
 * Executes the custom loop. This will execute all the functions that have been added to the loop, and checks all scheduled executions to see if they should fire.
 * This function will automatically be executed, if the loop has been added to the engine with Engine.addLoop.
 */
CustomLoop.prototype.execute = function () {
	var timer, i, exec;

	timer = new Date().getTime();

	if (!this.maskFunction() || engine.frames % this.framesPerExecution) {return; }

	if (engine.frames - this.lastFrame === this.framesPerExecution) {
		this.time += engine.timeIncrease;
	}

	this.lastFrame = engine.frames;
	this.last = engine.now;

	// Execute scheduled executions
	for (i = 0; i < this.scheduledExecutions.length; i++) {
		exec = this.scheduledExecutions[i];

		if (this.time >= exec.execTime) {
			exec.func.call(exec.caller);
			this.scheduledExecutions.splice(i, 1);
		}
	}

	// Execute attached functions
	for (i = 0; i < this.activities.length; i++) {
		exec = this.activities[i];

		if (!exec.activity) {
			console.log('Trying to exec non-existent attached function');
			console.log(exec);
			return;
		}

		exec.activity.call(exec.object);
	}

	this.addQueue();

	this.execTime = (new Date().getTime()) - timer;
};