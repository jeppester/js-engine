(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var StressTest;

StressTest = (function() {
  function StressTest() {
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
    this.objectView = new Engine.Views.Container();
    this.hudView = new Engine.Views.Container();
    engine.currentRoom.addChildren(this.objectView, this.hudView);
    this.fpsCounter = new Engine.Views.TextBlock('FPS: 0', 10, 10, 150, {
      color: '#FFF'
    });
    this.objectCounter = new Engine.Views.TextBlock('Objects: 0', 10, 30, 150, {
      color: '#FFF'
    });
    this.hudView.addChildren(this.fpsCounter, this.objectCounter);
    engine.currentRoom.addLoop('each20Frames', new Engine.CustomLoop(20));
    engine.currentRoom.loops.each20Frames.attachFunction(this, this.updateFPS);
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.controls);
  }

  StressTest.prototype.onLoaded = function() {
    return this.addObjects(2000);
  };

  StressTest.prototype.updateFPS = function() {
    this.fpsCounter.string = 'FPS: ' + engine.fps;
    return this.objectCounter.string = 'Objects: ' + (Object.keys(engine.objectIndex).length - 2);
  };

  StressTest.prototype.addObjects = function(count) {
    var i, j, ref, results, sprite;
    if (count == null) {
      count = 10;
    }
    results = [];
    for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      sprite = new Engine.Views.GameObject('rock', Math.random() * 600, Math.random() * 400, Math.random() * Math.PI * 2, {
        speed: new Engine.Geometry.Vector(-5 + Math.random() * 10, -5 + Math.random() * 10)
      });
      sprite.checkBounce = function() {
        if (this.x < 0) {
          this.x = 0;
          this.speed.x = -this.speed.x;
        } else if (this.x > 600) {
          this.x = 600;
          this.speed.x = -this.speed.x;
        }
        if (this.y < 0) {
          this.y = 0;
          return this.speed.y = -this.speed.y;
        } else if (this.y > 400) {
          this.y = 400;
          return this.speed.y = -this.speed.y;
        }
      };
      engine.currentRoom.loops.eachFrame.attachFunction(sprite, sprite.checkBounce);
      results.push(this.objectView.addChildren(sprite));
    }
    return results;
  };

  StressTest.prototype.removeObjects = function(count) {
    var i, j, objects, ref, results;
    if (count == null) {
      count = 10;
    }
    objects = this.objectView.getChildren();
    count = Math.min(count, objects.length);
    results = [];
    for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      results.push(engine.purge(objects.shift()));
    }
    return results;
  };

  StressTest.prototype.controls = function() {
    if (engine.keyboard.isDown(Engine.Globals.KEY_UP)) {
      this.addObjects();
    }
    if (engine.keyboard.isDown(Engine.Globals.KEY_DOWN)) {
      return this.removeObjects();
    }
  };

  return StressTest;

})();

new Engine({
  gameClass: StressTest,
  themes: ['example'],
  backgroundColor: "#000",
  disableWebGL: /canvas/.test(window.location.search),
  pauseOnBlur: false,
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
