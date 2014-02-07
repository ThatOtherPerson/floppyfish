function Game(id, width, height) {
    var placeholder = document.getElementById(id);
    this.canvas = document.createElement("canvas");
    this.canvas.id = id;
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    placeholder.parentNode.replaceChild(this.canvas, placeholder);
    this.ctx = this.canvas.getContext("2d");

    /// Images

    this.startscreen = null;
    this.gameover = null;

    /// Audio

    this.theme = null;

    this.reset();

    var that = this;

    document.onkeydown = function(e) {
        //console.log("Keydown: " + e.keyCode);
        if (e.keyCode == 32)
        {
            e.preventDefault();
            if (that.space_ready)
            {
                that.space = true;
                that.space_ready = false;
            }
        }
    };

    document.onkeyup = function(e) {
        //console.log("Keyup: " + e.keyCode);
        if (e.keyCode == 32)
        {
            e.preventDefault();
            that.space_ready = true;
        }
    };

    this.load();
}

Game.prototype.reset = function()
{
    this.lastLoop = new Date;

    this.state = this.stateEnum.STARTSCREEN;

    this.player = {
        acceleration: 0.0019,
        velocity: 0,
        width: 40,
        height: 28,
        rotation: 0,
        x: 0,
        y: 0,
        score: 0
    };

    this.background_velocity = -0.23;

    this.obstacle_width = 50;
    this.obstacle_gap = 170;
    this.obstacle_x_gap = 250;

    this.obstacles = [];

    this.player.y = this.height / 2 - this.player.height / 2;
    this.player.x = this.width / 2 - this.player.width / 2;

    this.space = false;
    this.space_ready = true;
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

Game.prototype.loadAudio = function(filename) {
    var audio = new Audio(filename);
    audio.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
    return audio;
}

Game.prototype.load = function() {
    this.startscreen = this.loadImage("images/splash.png");
    this.gameover = this.loadImage("images/gameover.png");
    this.theme = this.loadAudio("audio/theme.mp3");
}

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

Game.prototype.update = function() {
    var thisLoop = new Date;
    var elapsed = Math.floor(thisLoop - this.lastLoop);
    this.lastLoop = thisLoop;
    //document.getElementById("fps").innerHTML = "Elapsed: " + elapsed;

    switch (this.state)
    {
        case this.stateEnum.STARTSCREEN:
            if (this.space)
                this.state = this.stateEnum.PLAY;
            break;
        case this.stateEnum.PLAY:
            if (this.space)
            {
                this.player.velocity = -0.55;
                this.space = false;
            }

            this.player.velocity += this.player.acceleration * elapsed;
            this.player.y += this.player.velocity * elapsed;

            this.player.rotation = ((this.player.velocity) + this.player.rotation * 2) / 3;
            if (this.player.rotation > (Math.PI / 2))
                this.player.rotation = (Math.PI / 2);

            var last_x = 0;

            var bounds = boundingBox(this.player);

            if (bounds.y + bounds.height > this.height || bounds.y < 0)
                this.state = this.stateEnum.OVER;
           
            for (var i = 0; i < this.obstacles.length; i++)
            {
                this.obstacles[i].x += this.background_velocity * elapsed;
                if (collides(bounds, this.obstacles[i], this.obstacle_width, this.obstacle_gap))
                {
                    this.state = this.stateEnum.OVER;
                }
                if (this.obstacles[i].x + this.obstacle_width / 2 < this.player.x + this.player.width / 2 && !this.obstacles[i].scored)
                {
                    this.obstacles[i].scored = true;
                    this.player.score++;
                    document.getElementById("fps").innerHTML = "Score: " + this.player.score;
                }
                last_x = this.obstacles[i].x;
                if (this.obstacles[i].x < -this.obstacle_width)
                {
                    this.obstacles.splice(i, 1);
                    i--;
                }
            }

            if (this.obstacles.length == 0 || last_x < this.width - this.obstacle_x_gap)
            {
                this.obstacles.push({x: this.width, y: Math.floor(Math.random()*((this.height-this.obstacle_gap)-0+1)+0), scored: false});
            }
            break;
        case this.stateEnum.OVER:
            if (this.space)
            {
                this.reset();
                this.space = true;
                this.state = this.stateEnum.PLAY;
            }
            break;
    }


    this.render();

    var that = this;
    window.requestAnimationFrame(function() {
        that.update()
    });
}

function renderPlayer(ctx, player)
{
    // rotate and draw fish
    ctx.save();

    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.rotate(player.rotation);
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.strokeRect((-player.width / 2) + 0.5, (-player.height / 2) + 0.5, player.width, player.height);

    ctx.restore();
}

Game.prototype.render = function() {
    this.ctx.fillStyle = "rgb(10,10,60)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgb(50,120,110)";

    renderPlayer(this.ctx, this.player);

    this.ctx.fillStyle = "rgb(135, 115, 100)";

    for (var i = 0; i < this.obstacles.length; i++)
    {
        this.ctx.fillRect(this.obstacles[i].x, 0, this.obstacle_width, this.obstacles[i].y);
        this.ctx.strokeRect(this.obstacles[i].x + 0.5, 0.5, this.obstacle_width, this.obstacles[i].y);
        this.ctx.fillRect(this.obstacles[i].x, this.height, this.obstacle_width, -(this.height - this.obstacle_gap - this.obstacles[i].y));
        this.ctx.strokeRect(this.obstacles[i].x + 0.5, this.height + 0.5, this.obstacle_width, -(this.height - this.obstacle_gap - this.obstacles[i].y));
    }

    /* DISPLAY BOUNDING BOX
    bound = boundingBox(this.player);
    this.ctx.save();
    this.ctx.strokeStyle = "rgb(255, 0, 0)";
    this.ctx.strokeRect(bound.x, bound.y, bound.width, bound.height);
    this.ctx.restore();

    this.ctx.fillStyle = "rgb(255,0,0)";
    this.ctx.fillRect(this.player.x + this.player.width / 2 - 4, this.player.y + this.player.height / 2 - 4, 8, 8);
    */

    this.ctx.strokeRect(0.5, 0.5, this.width - 1, this.height - 1);
}

Game.prototype.start = function() {
   var that = this;
   window.requestAnimationFrame(function(){
        that.update();
    });

    this.theme.play();
}

Game.prototype.setSoundtrack = function(file) {}

function collides(pb, obstacle, obstacle_width, obstacle_gap)
{

    if (pb.x + pb.width > obstacle.x && pb.x < obstacle.x + obstacle_width)
    {
        if (pb.y < obstacle.y || pb.y + pb.height > obstacle.y + obstacle_gap)
            return true;
    }
    return false;
}

function boundingBox(player)
{
    var pv = [
        {x: -player.width / 2, y: -player.height / 2},
        {x: player.width / 2, y: -player.height / 2},
        {x: player.width / 2, y: player.height / 2},
        {x: -player.width / 2, y: player.height / 2}
    ];

    var max_x = false, max_y = false, min_x = false, min_y = false;

    for (var i = 0; i < pv.length; i++)
    {
        pv[i] = rotate(pv[i].x, pv[i].y, player.rotation);
        if (max_x === false || pv[i].x > max_x)
            max_x = pv[i].x;

        if (max_y === false || pv[i].y > max_y)
            max_y = pv[i].y;

        if (min_x === false || pv[i].x < min_x)
            min_x = pv[i].x;

        if (min_y === false || pv[i].y < min_y)
            min_y = pv[i].y;
    }

    var width = max_x - min_x;
    var height = max_y - min_y;

    return {x: player.x - (width - player.width) / 2, y: player.y - (height - player.height) / 2, width: width, height: height};
}

function rotate(x, y, theta)
{
    return {
        x: x * Math.cos(theta) - y * Math.sin(theta),
        y: x * Math.sin(theta) - y * Math.cos(theta)
    };
}
