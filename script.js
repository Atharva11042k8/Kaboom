// Initialize Kaboom
kaboom();

// Load sprite
loadSprite("player", "https://kaboomjs.com/sprites/bean.png");

// Game Scene
scene("game", () => {
    // Define Gravity
    gravity(1600);

    // Player Character
    const player = add([
        sprite("player"),
        pos(80, 40),
        area(),
        body(),
        "player"
    ]);

    // Floor
    add([
        rect(width(), 40),
        pos(0, height() - 40),
        area(),
        body({ isStatic: true }),
        color(0, 200, 0),
    ]);

    // Controls
    onKeyDown("left", () => {
        player.move(-200, 0);
    });

    onKeyDown("right", () => {
        player.move(200, 0);
    });

    onKeyPress("space", () => {
        if (player.isGrounded()) {
            player.jump(600);
        }
    });
});

// Start the game
go("game");
