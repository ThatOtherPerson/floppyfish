var game = null;
window.onload = function() {
    game = new Game("game", 640, 480, 10, 10);
    game.start();
};
