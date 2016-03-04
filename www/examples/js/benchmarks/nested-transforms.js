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
      var i, len, object, results;
      results = [];
      for (i = 0, len = objects.length; i < len; i++) {
        object = objects[i];
        results.push(object.direction += engine.perFrameSpeed(object.rotationSpeed));
      }
      return results;
    });
    setTimeout(((function(_this) {
      return function() {
        return _this.startTest();
      };
    })(this)), 2000);
  }

  Main.prototype.getSearch = function() {
    var i, len, name, part, parts, ref, s, search, value;
    s = window.location.search.replace(/^\?/, '');
    parts = s.split('&');
    search = {};
    for (i = 0, len = parts.length; i < len; i++) {
      part = parts[i];
      ref = part.split('='), name = ref[0], value = ref[1];
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
