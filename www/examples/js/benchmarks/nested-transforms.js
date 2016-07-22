(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Main;

Main = (function() {
  function Main() {
    engine.loader.hideOverlay((function(_this) {
      return function() {
        return _this.onLoaded();
      };
    })(this));
    this.lastFive = [];
    this.posX = 0;
    this.posY = 0;
    this.rotation = 0;
    engine.defaultActivityLoop.attachOperation('rotation-transform', function(objects) {
      var object, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = objects.length; _i < _len; _i++) {
        object = objects[_i];
        _results.push(object.direction += engine.perFrameSpeed(object.rotationSpeed));
      }
      return _results;
    });
    setTimeout(((function(_this) {
      return function() {
        return _this.startTest();
      };
    })(this)), 2000);
  }

  Main.prototype.getSearch = function() {
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

  Main.prototype.onLoaded = function() {
    return this.addObjects(this.getSearch()['objects'] || 8000);
  };

  Main.prototype.startTest = function() {
    this.startFrames = engine.frames;
    return setTimeout(((function(_this) {
      return function() {
        return _this.endTest();
      };
    })(this)), 10000);
  };

  Main.prototype.endTest = function() {
    var average, fps, frames, objects;
    objects = this.count;
    frames = engine.frames - this.startFrames;
    fps = (engine.frames - this.startFrames) / 10;
    this.lastFive.push(frames);
    if (this.lastFive.length > 5) {
      this.lastFive.shift();
    }
    average = this.lastFive.reduce(function(a, b) {
      return a + b;
    });
    average /= this.lastFive.length * 10;
    console.log("Objects: " + objects + " - Frames: " + frames + " - FPS: " + fps + " - Average: " + average);
    return this.startTest();
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

})();

new Engine({
  gameClass: Main,
  themesPath: '../assets',
  themes: ['example'],
  backgroundColor: "#000",
  disableWebGL: /canvas/.test(window.location.search),
  pauseOnBlur: false,
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
