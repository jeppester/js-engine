jseCreateClass('CustomLoop');

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

CustomLoop.prototype.schedule = function (func, delay) {
	if (func === undefined) {throw new Error('Missing argument: function'); }
	if (delay === undefined) {throw new Error('Missing argument: delay'); }

	this.scheduledExecutions.push({
		func: func,
		execTime: this.time + delay
	});
};

CustomLoop.prototype.addQueue = function () {
	this.activities = this.activities.concat(this.activitiesQueue);
	this.activitiesQueue = [];
}

CustomLoop.prototype.execute = function () {
	var timer, loop;

	timer = new Date().getTime();

	if (!this.maskFunction() || engine.frames % this.framesPerExecution) {return; }

	if (engine.frames - this.lastFrame === this.framesPerExecution) {
		this.time += engine.timeIncrease;
	}

	this.lastFrame = engine.frames;
	this.last = engine.now;

	// Execute scheduled executions
	loop = this;
	this.scheduledExecutions.forEach(function (i) {
		if (loop.time >= this.execTime) {
			this.func();
			loop.scheduledExecutions.splice(i, 1);
		}
	})

	// Execute attached functions
	this.activities.forEach(function () {
		if (!this.activity) {
			console.log(this);
			return;
		}

		this.activity.call(this.object);
	})

	this.addQueue();

	this.execTime = (new Date().getTime()) - timer;
};