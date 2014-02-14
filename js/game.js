function Game(id, width, height) {
    var placeholder = document.getElementById(id);
    this.canvas = document.createElement("canvas");
    this.canvas.id = id;
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    placeholder.parentNode.replaceChild(this.canvas, placeholder);
    this.ctx = this.canvas.getContext("2d");

    this.debug = false;

    /// Images

    //this.startscreen = null;
    //this.gameover = null;

    this.fish_image = null;
    this.mine = null;
    this.chain = null;

    this.bestScore = 0;

    /// Audio

    this.theme = null;
    this.bubbles = null;
    this.explosion = null;

    this.load();

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
}

Game.prototype.reset = function()
{
    this.lastLoop = new Date;

    this.state = this.stateEnum.STARTSCREEN;

    this.player = {
        image: this.fish_image,
        acceleration: 0.0019,
        velocity: 0,
        width: 39,
        radius: 18,
        height: 32,
        rotation: 0,
        x: 0,
        y: 0,
        score: 0
    };

    this.background_velocity = -0.23;

    this.obstacle_width = 100;
    this.obstacle_radius = 50;
    this.obstacle_gap = 230;
    this.obstacle_x_gap = 200;

    this.obstacles = [];

    this.player.y = this.height / 2;
    this.player.x = this.width / 2;

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

Game.prototype.loadAudio = function(filename, loop) {
    var audio = new Audio(filename);
    if (loop)
        audio.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
        }, false);
    return audio;
}

Game.prototype.load = function() {
    //this.startscreen = this.loadImage("images/splash.png");
    this.fish_image = this.loadImage("images/fish.png");
    this.mine = this.loadImage("images/mine.png");
    this.chain = this.loadImage("images/chain.png");

    this.theme = this.loadAudio("audio/theme.mp3", true);
    this.bubbles = this.loadAudio("audio/bubbles.mp3");
    this.explosion = this.loadAudio("audio/explosion.mp3");
}

Game.prototype.die = function() {
    this.state = this.stateEnum.OVER;
    this.explosion.play();
};

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

            if (this.player.y + this.player.radius > this.height || this.player.y - this.player.radius < 0)
                this.die();
           
            for (var i = 0; i < this.obstacles.length; i++)
            {
                this.obstacles[i].x += this.background_velocity * elapsed;
                if (collides(this.player, this.obstacles[i], this.obstacle_width, this.obstacle_gap, this.obstacle_radius))
                {
                    this.die();
                }
                if (this.obstacles[i].x < this.player.x&& !this.obstacles[i].scored)
                {
                    this.obstacles[i].scored = true;
                    this.player.score++;
                    if (this.player.score > this.bestScore)
                    {
                        this.bestScore = this.player.score;
                        document.getElementById("bestScore").innerHTML = "Best: " + this.bestScore;
                    }
                    document.getElementById("score").innerHTML = "Score: " + this.player.score;
                    this.bubbles.play();
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
                this.obstacles.push({x: this.width + this.obstacle_width / 2, y: Math.floor(Math.random()*((this.height-this.obstacle_gap)-0+1)+0), scored: false});
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

    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);

    ctx.drawImage(player.image, -player.width / 2, -player.height / 2, player.width, player.height);

    /*
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    ctx.strokeRect((-player.width / 2) + 0.5, (-player.height / 2) + 0.5, player.width, player.height);
    */

    ctx.restore();
}

function renderChain(ctx, chain, obstacle, obstacle_width, obstacle_height, height, obstacle_gap)
{
    var chain_kern = 15; /* should be elsewhere */

    for (var y = obstacle.y - obstacle_height / 2 - chain.height + chain_kern; y > -chain.height; y -= chain.height - chain_kern)
    {
        ctx.drawImage(chain, obstacle.x - chain.width / 2, y);
    }

    for (var y = obstacle.y + obstacle_gap + obstacle_height / 2 - chain_kern; y < height; y += chain.height - chain_kern)
    {
        ctx.drawImage(chain, obstacle.x - chain.width / 2, y);
    }
}

function renderObstacle(ctx, obstacle, obstacle_width, obstacle_height, obstacle_gap, mine, chain, height)
{
    renderChain(ctx, chain, obstacle, obstacle_width, obstacle_height, height, obstacle_gap);

    ctx.drawImage(mine, obstacle.x - obstacle_width / 2, obstacle.y - obstacle_height / 2, obstacle_width, obstacle_height);
    ctx.drawImage(mine, obstacle.x - obstacle_width / 2, obstacle.y + obstacle_gap - obstacle_height / 2, obstacle_width, obstacle_height);

}

Game.prototype.render = function() {
    this.ctx.fillStyle = "rgb(40,70,90)";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = "rgb(50,120,110)";

    renderPlayer(this.ctx, this.player);

    this.ctx.fillStyle = "rgb(135, 115, 100)";

    var obstacle_height = this.obstacle_width / game.mine.width * game.mine.height;

    for (var i = 0; i < this.obstacles.length; i++)
    {
        renderObstacle(this.ctx, this.obstacles[i], this.obstacle_width, obstacle_height, this.obstacle_gap, this.mine, this.chain, this.height);
    }

    if (this.debug)
    {
        this.ctx.save();
        this.ctx.strokeStyle = "rgb(255, 0, 0)";
        this.ctx.fillStyle = "rgb(255,0,0)";

        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2, false);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, 4, 0, Math.PI * 2, false);
        this.ctx.fill();

        for (i = 0; i < this.obstacles.length; i++)
        {
            var o = this.obstacles[i];
            this.ctx.beginPath();
            this.ctx.arc(o.x, o.y, this.obstacle_radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(o.x, o.y + this.obstacle_gap, this.obstacle_radius, 0, Math.PI * 2, false);
            this.ctx.stroke();
 
            this.ctx.beginPath();
            this.ctx.arc(o.x, o.y, 4, 0, Math.PI * 2, false);
            this.ctx.arc(o.x, o.y + this.obstacle_gap, 4, 0, Math.PI * 2, false);
            this.ctx.fill();
       }

        this.ctx.restore();
    }

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

function collides(player, obstacle, obstacle_width, obstacle_gap, obstacle_radius)
{
    var distance_top = Math.sqrt(Math.pow(obstacle.x - player.x, 2) + Math.pow(obstacle.y - player.y, 2));
    var distance_bottom = Math.sqrt(Math.pow(obstacle.x - player.x, 2) + Math.pow(obstacle.y + obstacle_gap - player.y, 2));

    if (distance_top < player.radius + obstacle_radius || distance_bottom < player.radius + obstacle_radius)
    {
        //console.log("distance", distance, "player.radius", player.radius, "player.x", player.x, "player.y", player.y, "obstacle_radius", obstacle_radius, "obstacle.x", obstacle.x, "obstacle.y", obstacle.y);
        return true;
    }

    return false;
}

function rotate(x, y, theta)
{
    return {
        x: x * Math.cos(theta) - y * Math.sin(theta),
        y: x * Math.sin(theta) - y * Math.cos(theta)
    };
}
