(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Benchmark, Main, startEngine,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Benchmark = require('./shared/benchmark');

startEngine = require('./shared/startEngine');

Main = (function(_super) {
  __extends(Main, _super);

  function Main() {
    engine.defaultActivityLoop.attachOperation('rotation-transform', function(objects) {
      var object, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        _results.push(object.direction += engine.perFrameSpeed(object.rotationSpeed));
      }
      return _results;
    });
    Main.__super__.constructor.apply(this, arguments);
  }

  Main.prototype.getObjectsCount = function() {
    return this.count;
  };

  Main.prototype.addObjects = function(count) {
    var arm, arms, container, direction, dist, nextContainer, object, outerContainer, sprite, subCount, _i, _results;
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
    _results = [];
    for (arm = _i = 0; 0 <= arms ? _i < arms : _i > arms; arm = 0 <= arms ? ++_i : --_i) {
      dist = 150;
      direction = Math.PI * 2 / arms * arm;
      nextContainer = outerContainer;
      _results.push((function() {
        var _j, _results1;
        _results1 = [];
        for (object = _j = 0; 0 <= subCount ? _j < subCount : _j > subCount; object = 0 <= subCount ? ++_j : --_j) {
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
          _results1.push(nextContainer = container);
        }
        return _results1;
      }).call(this));
    }
    return _results;
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
    var name, part, parts, s, search, value, _i, _len, _ref;
    s = window.location.search.replace(/^\?/, '');
    parts = s.split('&');
    search = {};
    for (_i = 0, _len = parts.length; _i < _len; _i++) {
      part = parts[_i];
      _ref = part.split('='), name = _ref[0], value = _ref[1];
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
    var col, cols, direction, directionInt, i, row, rows, x, xInt, y, yInt, _i, _results;
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
    _results = [];
    for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
      x = col * xInt;
      y = row * yInt;
      engine.currentRoom.addChildren(this.getObject(x, y, direction));
      direction += directionInt;
      ++row;
      if (row > rows) {
        row = 0;
        _results.push(++col);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
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
