(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Main;

Main = (function() {
  function Main() {
    console.log('yay!');
    window.text = engine.currentRoom.create.TextBlock('PRESS SPACE TO PLAY A SOUND EFFECT', 100, 140, 400, {
      color: '#4F4',
      alignment: 'center'
    });
    window.text = engine.currentRoom.create.TextBlock('PRESS ENTER TO PLAY/STOP A MUSIC TRACK', 100, 240, 400, {
      color: '#AAF',
      alignment: 'center'
    });
    engine.loader.hideOverlay();
    engine.currentRoom.loops.eachFrame.attachFunction(this, this.controls);
  }

  Main.prototype.controls = function() {
    if (engine.keyboard.isPressed(Engine.Globals.KEY_SPACE)) {
      this.playSound();
    }
    if (engine.keyboard.isPressed(Engine.Globals.KEY_ENTER)) {
      return this.toggleMusic();
    }
  };

  Main.prototype.playSound = function() {
    switch (Math.floor(Math.random() * 2)) {
      case 0:
        return engine.loader.getSound('donk').play();
      case 1:
        return engine.loader.getSound('donk2').play();
    }
  };

  Main.prototype.toggleMusic = function() {
    var m;
    m = engine.loader.getMusic('space-music');
    if (m.playing) {
      return m.stop();
    } else {
      return m.play();
    }
  };

  return Main;

})();

new Engine({
  gameClass: Main,
  themes: ['example'],
  backgroundColor: "#000",
  pauseOnBlur: false,
  canvasResX: 600,
  canvasResY: 400
});



},{}]},{},[1]);
