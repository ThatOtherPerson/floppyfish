function Game(id, width, height) {
    var placeholder = document.getElementById(id);
    this.canvas = document.createElement("canvas");
    this.canvas.id = id;
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    placeholder.parentNode.replaceChild(this.canvas, placeholder);
    this.ctx = this.canvas.getContext("2d");

    this.player = {
        acceleration: 0.05,
        velocity: 0,
        displacement: height / 2
    };

    /// Images

    this.startscreen = null;
    this.gameover = null;

    // variable to hold the "thread"
    this.interval = null;

    this.space = false;

    var that = this;

    document.onkeydown = function(e) {
        //console.log("Keydown: " + e.keyCode);
        if (e.keyCode == 32)
            e.preventDefault();
    };

    document.onkeyup = function(e) {
        //console.log("Keyup: " + e.keyCode);
        if (e.keyCode == 32)
        {
            e.preventDefault();
            that.space = true;
        }
    };

    this.load();
}

/*
Game.prototype.stateEnum = {
    STARTSCREEN: 0,
    PLAY: 1,
    OVER: 2
};
*/

Game.prototype.loadImage = function(filename) {
    var img = new Image();
    img.src = filename;
    return img;
}

Game.prototype.load = function() {
    this.startscreen = this.loadImage("images/splash.png");
    this.gameover = this.loadImage("images/gameover.png");
}

Game.prototype.update = function() {
    if (this.spaceTriggered())
    {
         console.log("space");
	 this.player.velocity -= 5;
    }

    this.player.velocity += this.player.acceleration;
    this.player.displacement += this.player.velocity;

    this.render();

    this.ticks++;
}

Game.prototype.render = function() {
    this.ctx.save();

    this.ctx.fillStyle = "rgb(255,255,255)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgb(0,0,0)";

    this.ctx.fillRect(0, this.player.displacement, this.width, 10);

    this.ctx.restore();
    this.ctx.strokeRect(0, 0, this.width, this.height);
}

Game.prototype.start = function() {
    var that = this;
    this.interval = setInterval(function() {
        return that.update();
    }, 10);
}

Game.prototype.stop = function() {
    clearInterval(this.interval);
}

Game.prototype.setSoundtrack = function(file) {}

Game.prototype.spaceTriggered = function () {
    var val = this.space;
    this.space = false;
    return val;
};
