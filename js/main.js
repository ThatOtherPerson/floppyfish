var game = null;
window.onload = function()
{
    game = new Game("game", 640, 480, 10, 10);
    game.start();

    var codez = [38, 38, 40, 40, 37, 39, 37, 39, 65, 66];
    var index = 0;

    document.addEventListener("keydown", function(e)
    {
        console.log(e);
        if (e.keyCode == codez[index])
        {
            index++;
        }
        else
        {
            index = 0;
        }

        if (index == codez.length)
        {
            index = 0;
            game.debug = !game.debug;
        }

    });
};
