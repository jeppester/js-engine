(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Benchmark, Main, startEngine,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Benchmark = require('./shared/benchmark');

startEngine = require('./shared/startEngine');

Main = (function(superClass) {
  extend(Main, superClass);

  function Main() {
    engine.defaultActivityLoop.attachOperation('check-bounce', function(objects) {
      var i, len, object, results;
      results = [];
      for (i = 0, len = objects.length; i < len; i++) {
        object = objects[i];
        if (object.x < 0) {
          object.x = 0;
          object.speed.x = -object.speed.x;
        } else if (object.x > 600) {
          object.x = 600;
          object.speed.x = -object.speed.x;
        }
        if (object.y < 0) {
          object.y = 0;
          results.push(object.speed.y = -object.speed.y);
        } else if (object.y > 400) {
          object.y = 400;
          results.push(object.speed.y = -object.speed.y);
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
    Main.__super__.constructor.apply(this, arguments);
  }

  Main.prototype.getObject = function(x, y, direction) {
    var speed, sprite;
    speed = new Engine.Geometry.Vector().setFromDirection(direction, 5);
    sprite = new Engine.Views.GameObject('rock', x, y, direction, {
      speed: speed
    });
    engine.defaultActivityLoop.subscribeToOperation('check-bounce', sprite);
    return sprite;
  };

  return Main;

})(Benchmark);

startEngine(Main);



},{"./shared/benchmark":2,"./shared/startEngine":3}],2:[function(require,module,exports){
var Benchmark;

module.exports = Benchmark = (function() {
  Benchmark.prototype.defaultObjectsCount = 8000;

  function Benchmark() {
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
    this.lastFive = [];
    this.posX = 0;
    this.posY = 0;
    setTimeout(((function(_this) {
      return function() {
        return _this.startTest();
      };
    })(this)), 2000);
  }

  Benchmark.prototype.getSearch = function() {
    var j, len, name, part, parts, ref, s, search, value;
    s = window.location.search.replace(/^\?/, '');
    parts = s.split('&');
    search = {};
    for (j = 0, len = parts.length; j < len; j++) {
      part = parts[j];
      ref = part.split('='), name = ref[0], value = ref[1];
      search[name] = value;
    }
    return search;
  };

  Benchmark.prototype.onLoaded = function() {
    return this.addObjects(this.getSearch()['objects'] || this.defaultObjectsCount);
  };

  Benchmark.prototype.startTest = function() {
    this.startFrames = engine.frames;
    return setTimeout(((function(_this) {
      return function() {
        return _this.endTest();
      };
    })(this)), 1000);
  };

  Benchmark.prototype.endTest = function() {
    var average, fps, frames, objectsCount;
    objectsCount = this.getObjectsCount();
    frames = engine.frames - this.startFrames;
    fps = engine.frames - this.startFrames;
    this.lastFive.push(frames);
    if (this.lastFive.length > 5) {
      this.lastFive.shift();
    }
    average = this.lastFive.reduce(function(a, b) {
      return a + b;
    });
    average /= this.lastFive.length;
    console.log("Objects: " + objectsCount + " - FPS: " + fps + " - Average: " + average);
    return this.startTest();
  };

  Benchmark.prototype.getObjectsCount = function() {
    return engine.currentRoom.children.length;
  };

  Benchmark.prototype.addObjects = function(count) {
    var col, cols, direction, directionInt, i, j, ref, results, row, rows, x, xInt, y, yInt;
    if (count == null) {
      count = 10;
    }
    cols = rows = Math.max(Math.sqrt(count));
    col = 0;
    row = 0;
    direction = 0;
    xInt = engine.canvasResX / cols;
    yInt = engine.canvasResY / rows;
    directionInt = Math.PI / 100;
    results = [];
    for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      x = col * xInt;
      y = row * yInt;
      engine.currentRoom.addChildren(this.getObject(x, y, direction));
      direction += directionInt;
      ++row;
      if (row > rows) {
        row = 0;
        results.push(++col);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  Benchmark.prototype.getObject = function(x, y) {
    throw new Error('getObject must be overwritten');
  };

  return Benchmark;

})();



},{}],3:[function(require,module,exports){
module.exports = function(gameClass) {
  return new Engine({
    gameClass: gameClass,
    themesPath: '../assets',
    themes: ['example'],
    backgroundColor: "#000",
    disableWebGL: /canvas/.test(window.location.search),
    pauseOnBlur: false,
    canvasResX: 600,
    canvasResY: 400
  });
};



},{}]},{},[1]);
