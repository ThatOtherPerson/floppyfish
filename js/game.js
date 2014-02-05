function Game(id, width, height) {
    var placeholder = document.getElementById(id);
    this.canvas = document.createElement("canvas");
    this.canvas.id = id;
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    placeholder.parentNode.replaceChild(this.canvas, placeholder);
    this.ctx = this.canvas.getContext("2d");

    this.state = this.stateEnum.STARTSCREEN;

    this.player = {
        acceleration: 0.15,
        velocity: -5,
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
        {
            e.preventDefault();
            that.space = true;
        }
    };

    document.onkeyup = function(e) {
        //console.log("Keyup: " + e.keyCode);
        if (e.keyCode == 32)
        {
            e.preventDefault();
            that.space = false;
        }
    };

    this.load();
}

Game.prototype.stateEnum = {
    STARTSCREEN: 0,
    PLAY: 1,
    OVER: 2
};

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
    switch (this.state)
    {
        case this.stateEnum.STARTSCREEN:
            if (this.space)
                this.state = this.stateEnum.PLAY;
            break;
        case this.stateEnum.PLAY:
            if (this.space)
                this.player.velocity = -4;

            this.player.velocity += this.player.acceleration;
            this.player.displacement += this.player.velocity;
            break;
        case this.stateEnum.OVER:
            break;
    }


    this.render();
}

Game.prototype.render = function() {
    this.ctx.save();

    this.ctx.fillStyle = "rgb(255,255,255)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgb(0,0,0)";

    this.ctx.fillRect(200, this.player.displacement, 30, 30);

    this.ctx.restore();
    this.ctx.strokeRect(0.5, 0.5, this.width - 1, this.height - 1);
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
