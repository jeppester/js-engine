(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Benchmark, Main, startEngine,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Benchmark = require('./shared/benchmark');

startEngine = require('./shared/startEngine');

Main = (function(superClass) {
  extend(Main, superClass);

  function Main() {
    engine.defaultActivityLoop.attachOperation('rotation-transform', function(objects) {
      var i, len, object, results;
      results = [];
      for (i = 0, len = objects.length; i < len; i++) {
        object = objects[i];
        results.push(object.direction += engine.perFrameSpeed(object.rotationSpeed));
      }
      return results;
    });
    Main.__super__.constructor.apply(this, arguments);
  }

  Main.prototype.getObjectsCount = function() {
    return this.count;
  };

  Main.prototype.addObjects = function(count) {
    var arm, arms, container, direction, dist, i, nextContainer, object, outerContainer, ref, results, sprite, subCount;
    if (count == null) {
      count = 10;
    }
    arms = 20;
    subCount = Math.floor(count / arms);
    outerContainer = new Engine.Views.Container();
    outerContainer.x = engine.canvasResX / 2;
    outerContainer.y = engine.canvasResY / 2;
    outerContainer.rotationSpeed = Math.PI / 4;
    outerContainer.widthScale = .85;
    engine.defaultActivityLoop.subscribeToOperation('rotation-transform', outerContainer);
    engine.currentRoom.addChildren(outerContainer);
    sprite = new Engine.Views.Sprite('rock', 0, 0);
    outerContainer.addChildren(sprite);
    this.count = 1;
    results = [];
    for (arm = i = 0, ref = arms; 0 <= ref ? i < ref : i > ref; arm = 0 <= ref ? ++i : --i) {
      dist = 150;
      direction = Math.PI * 2 / arms * arm;
      nextContainer = outerContainer;
      results.push((function() {
        var j, ref1, results1;
        results1 = [];
        for (object = j = 0, ref1 = subCount; 0 <= ref1 ? j < ref1 : j > ref1; object = 0 <= ref1 ? ++j : --j) {
          container = new Engine.Views.Container();
          container.x = Math.cos(direction) * dist;
          container.y = Math.sin(direction) * dist;
          container.widthScale = nextContainer.widthScale;
          container.rotationSpeed = nextContainer.rotationSpeed;
          engine.defaultActivityLoop.subscribeToOperation('rotation-transform', container);
          nextContainer.addChildren(container);
          sprite = new Engine.Views.Sprite('rock', 0, 0);
          this.count++;
          container.addChildren(sprite);
          dist *= .9;
          results1.push(nextContainer = container);
        }
        return results1;
      }).call(this));
    }
    return results;
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
