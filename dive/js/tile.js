function Tile(position, value) {
  if (position.x && position.y && !value) { 
    console.log("missing value!", value); 
    value = 2;
  }

  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 0;
  if (typeof this.value == "number") {
    this.value = new Value(this.value, 0);
  }

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

function Value(integer, sqrt2) {
  this.value = [integer, sqrt2];
}


Value.prototype.toString = function () {
  if (this.value[1] == 0) {
    return this.value[0] + "";
  }
  if (this.value[0] == 0) {
    return  ((this.value[1] === 1) ? "" :  (this.value[1] === -1 ? "-" : this.value[1])) + "√2";
  }
  return this.value[0] + (this.value[1] > 0 ? "+" : "-") + ((this.value[1] === 1 || this.value[1] === -1 )? "" : Math.abs(this.value[1])) + "√2";
};

Value.prototype.score = function () {
  return Math.abs(this.value[0]) + Math.abs(this.value[1]);
};

Value.prototype.mod = function (other) {
  value = this.divide(other);
  if (value[0] === Infinity || value[1] === Infinity) {
    return false;
  }
  return (Math.round((value.value[0] % 1) * 10**5) / 10**5) % 1 === 0 && (Math.round((value.value[1] % 1) * 10**5) / 10**5) % 1 === 0; //floating point
};



Value.prototype.divide = function (other) {
  if (typeof other == "number") {
    other = new Value(other, 0);
  }
  array = [[other.value[0], other.value[1] * 2], [other.value[1], other.value[0]]];
  if (isNaN(math.det(array)) || (math.det(array) < 10 ** -5 && math.det(array) > -(10 ** -5))) {
    return new Value(Infinity, Infinity);
  }
  array = math.inv(array);
  value = math.multiply(array, this.value);
  return new Value(value[0], value[1]);
};


Value.prototype.divideHelp = function (other) {
  if (other.value[0] === 0) {
    return this.value[1] / other.value[1];
  }
  return this.value[0] / other.value[0];
};

Value.prototype.divideHelp2 = function (other) {
  if (other.value[0] === 0) {
    return new Value(this.value[0], 0);
  }
  if (other.value[1] === 0) {
    return new Value(0, this.value[1]);
  }
  return new Value(0, this.value[1] - this.value[0] / other.value[0] * other.value[1]);
};


Value.prototype.equals = function (other) {
  if (typeof other == "number") {
    other = new Value(other, 0);
  }
  return (this.value[0] === other.value[0]) && (this.value[1] === other.value[1]);
}

Value.prototype.add = function (other) {
  
  if (typeof other == "number") {
    other = new Value(other, 0);
  }
  return new Value(this.value[0] + other.value[0], this.value[1] + other.value[1]);
};

Value.prototype.mul = function (other) {
  return new Value(this.value[0]*other.value[0] + 2*this.value[1]*other.value[1], this.value[0]*other.value[1] + this.value[1]*other.value[0]);
};

Value.prototype.number = function () {
  return this.value[0] + this.value[1] * Math.SQRT2;
};