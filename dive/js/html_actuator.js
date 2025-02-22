function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.announcer        = document.querySelector(".announcer");
  this.currentlyUnlocked= document.querySelector(".currently-unlocked");

  this.score = 0;
  
  this.overlayPrimes = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 
    53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 
    131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197,
    199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277,
    281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367];
  
  this.overlayPrimes2 = [new Value(3, 1), new Value(5, 1), new Value(7, 3),
    new Value(7, 2), new Value(7, 1), new Value(11, 5), new Value(9, 2),
    new Value(9, 1), new Value(11, 4), new Value(13, 6), new Value(11, 3),
    new Value(11, 2), new Value(15, 7), new Value(13, 4), new Value(13, 3),
    new Value(13, 1), new Value(17, 7), new Value(15, 4), new Value(19, 9),
    new Value(15, 1), new Value(19, 8), new Value(17, 5), new Value(21, 10),
    new Value(17, 4), new Value(19, 7), new Value(17, 3), new Value(17, 2),
    new Value(19, 5), new Value(21, 8), new Value(25, 12), new Value(19, 2),
    new Value(19, 1), new Value(23, 9)];
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.over) self.message(metadata.over); // You lose.  There's no win condition.
  });
};

HTMLActuator.prototype.restart = function () {
  this.clearMessage();
  this.clearCurrentlyUnlocked();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.removeFirstChild = function (container) {
  container.removeChild(container.firstChild);
};

// yes, global function, naughty.  what should I have done?
gcd = function(a, b) {
  if (b === 0)
    return a;
  return self.gcd(b, a % b);
};

HTMLActuator.prototype.createTile = function (tile, animate) {
  var self = this;

  var element   = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  positionClass = this.positionClass(position);

  var tileValueWithout2 = tile.value;
  while (tileValueWithout2.mod(2) && !tileValueWithout2.equals(0)) {
    tileValueWithout2 = tileValueWithout2.divide(2);
  }

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + gcd(gcd(tile.value.value[0], tile.value.value[1]), 1296000) + (tileValueWithout2.mod(new Value(0,1)) ? "sq2" : "")];
  var animatedClasses = [];

  classes.push(positionClass);
  this.applyClasses(element, classes);

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(element, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    animatedClasses.push("tile-merged");
    this.applyClasses(element, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    if (animate) {
      classes.push("tile-new");
      animatedClasses.push("tile-new");
    }
    this.applyClasses(element, classes);
  }

  var tileNumber = document.createElement("div");
  var tileNumberClasses = animatedClasses.slice(0);
  tileNumberClasses.push("tilenumber");
  var contentLength = String(tile.value.toString()).length;
  if (contentLength > 2) {
    contentLength = contentLength + 1;
    if (contentLength > 6) {
      contentLength = 6;
    }
    tileNumberClasses.push("tile-small-" + contentLength);
  }
  this.applyClasses(tileNumber, tileNumberClasses);
  tileNumber.textContent = tile.value;
  element.appendChild(tileNumber);

  
  this.overlayPrimes2.forEach(function (p) {
    if (tile.value.mod(p)) {
      var tileOverlay = document.createElement("div");
      var tileOverlayClasses = animatedClasses.slice(0);
      tileOverlayClasses.push("tileoverlay");
      var psq = p.mul(p)
      if (tile.value.mod(psq))
        tileOverlayClasses.push("tileoverlay-" + psq.value[0] + "p" + psq.value[1] + "sq2");
      else
        tileOverlayClasses.push("tileoverlay-" + p.value[0] + "p" + p.value[1] + "sq2");
      self.applyClasses(tileOverlay, tileOverlayClasses);
      element.appendChild(tileOverlay);
    }
    p = new Value(p.value[0], -p.value[1]);
    if (tile.value.mod(p)) {
      var tileOverlay = document.createElement("div");
      var tileOverlayClasses = animatedClasses.slice(0);
      tileOverlayClasses.push("tileoverlay");
      var psq = p.mul(p)
      if (tile.value.mod(psq))
        tileOverlayClasses.push("tileoverlay-" + psq.value[0] + "m" + Math.abs(psq.value[1]) + "sq2");
      else
        tileOverlayClasses.push("tileoverlay-" + p.value[0] + "m" + Math.abs(p.value[1]) + "sq2");
      self.applyClasses(tileOverlay, tileOverlayClasses);
      element.appendChild(tileOverlay);
    }
  });
  this.overlayPrimes.forEach(function (p) {
    if (tile.value.mod(p)) {
      var tileOverlay = document.createElement("div");
      var tileOverlayClasses = animatedClasses.slice(0);
      tileOverlayClasses.push("tileoverlay");
      if (tile.value.mod(p*p))
        tileOverlayClasses.push("tileoverlay-" + (p*p));
      else
        tileOverlayClasses.push("tileoverlay-" + p);
      self.applyClasses(tileOverlay, tileOverlayClasses);
      element.appendChild(tileOverlay);
    }
  });

  return element;
}

HTMLActuator.prototype.createMiniTile = function (value) { 
  var tile = new Tile ({x: null, y: null}, value);
  var tileElement = this.createTile(tile, false);
  tileElement.classList.add("minitile");
  return tileElement;
};

HTMLActuator.prototype.addTile = function (tile) {
  var element = this.createTile(tile, true);

  // Put the tile on the board
  this.tileContainer.appendChild(element);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  if (position.x == null)
    return;
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  var tile = new Tile({x: null, y: null}, score);
  var tileElement = this.createTile(tile, false)
  this.scoreContainer.appendChild(tileElement);

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.clearContainer(this.bestContainer);
  var tile = new Tile({x: null, y: null}, bestScore);
  var tileElement = this.createTile(tile, false)
  this.bestContainer.appendChild(tileElement);
};

HTMLActuator.prototype.announce = function (message) {
  var announce = document.createElement("p");
  announce.classList.add("announcement");
  announce.textContent = message;
  this.announcer.appendChild(announce);
  setTimeout(this.removeFirstChild.bind(this,this.announcer),2500);
};

HTMLActuator.prototype.message = function (game_over_data) {
  var type    = false ? "game-won" : "game-over";
  var message = false ? "You win!" : "Game over!";

  this.clearContainer(this.announcer);
  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  
  if ("tilesSeen" in game_over_data) {
    var seen = game_over_data.tilesSeen;
    seen.sort(function (a,b){return a.number()-b.number()});
    for (var i = seen.length - 2; i >= 0; i--)
      if (seen[i].equals(seen[i+1]))
        seen.splice(i,1);

    this.clearContainer(this.currentlyUnlocked);

    for (var i = 0; i < seen.length; i++) {
        var seenElem = this.createMiniTile(seen[i]);
        if (game_over_data.tileTypes.findIndex(x => seen[i].equals(x)) == -1) {
            seenElem.classList.add('ghost');
        }
        this.currentlyUnlocked.appendChild(seenElem);
    }
    this.currentlyUnlocked.classList.add("all-seeds-seen");
  }
};

HTMLActuator.prototype.clearMessage = function () {
  this.messageContainer.classList.remove("game-won", "game-over");
};

HTMLActuator.prototype.updateCurrentlyUnlocked = function (list) {
  this.currentlyUnlocked.classList.remove("hidden");
  this.currentlyUnlocked.classList.remove("all-seeds-seen");

  this.currentlyUnlocked.textContent = "";
  this.clearContainer(this.currentlyUnlocked);

  var self = this;
  list.forEach(function (value) {
    self.currentlyUnlocked.appendChild(self.createMiniTile(value));
  });
}

HTMLActuator.prototype.clearCurrentlyUnlocked = function () {
  this.currentlyUnlocked.classList.add("hidden");

  this.currentlyUnlocked.textContent = "";
  this.clearContainer(this.currentlyUnlocked);
};
