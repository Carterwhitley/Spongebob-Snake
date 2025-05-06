import kaboom from "kaboom";

kaboom({background:[51,151,255]});

loadSprite("background", "sprites/background.png");
loadSprite("fence-top", "sprites/fence-top.png");
loadSprite("fence-bottom", "sprites/fence-bottom.png");
loadSprite("fence-left", "sprites/fence-left.png");
loadSprite("fence-right", "sprites/fence-right.png");
loadSprite("post-top-left", "sprites/post-top-left.png");
loadSprite("post-top-right", "sprites/post-top-right.png");
loadSprite("post-bottom-left", "sprites/post-bottom-left.png");
loadSprite("post-bottom-right", "sprites/post-bottom-right.png");
loadSprite("spongebob_left", "sprites/spongebob_left.png");
loadSprite("spongebob_right", "sprites/spongebob_right.png");
loadSprite("spongebob_up", "sprites/spongebob_up.png");
loadSprite("spongebob_down", "sprites/spongebob_down.png");
loadSprite("pizza", "sprites/pizza.png");
loadSprite("snake-skin", "sprites/snake-skin.png"); // Use existing snake skin sprite


layers([
    "background",
    "game"
], "game");

add([
    sprite("background"),
    layer("background")
]);

const directions = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right"
};

let current_direction = directions.RIGHT;
let run_action = false;
let snake_length = 3;
let snake_body = [];

const block_size = 20;

const map = addLevel([
     "1tttttttttttt2",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "l            r ",
     "3bbbbbbbbbbbb4",
], {
     width: block_size,
     height: block_size,
     pos: vec2(0, 0),
     "t": ()=> [
          sprite("fence-top"),
          area(),
          "wall"
     ],
     "b": ()=> [
          sprite("fence-bottom"),
          area(),
          "wall"
     ],
     "l": ()=> [
          sprite("fence-left"),
          area(),
          "wall"
     ],
     "r": ()=> [
          sprite("fence-right"),
          area(),
          "wall"
     ],
     "1": ()=> [
          sprite("post-top-left"),
          area(),
          "wall"
     ],
     "2": ()=> [
          sprite("post-top-right"),
          area(),
          "wall"
     ],
     "3": ()=> [
          sprite("post-bottom-left"),
          area(),
          "wall"
     ],
     "4": ()=> [
          sprite("post-bottom-right"),
          area(),
          "wall"
     ],
});

function respawn_snake(){
  snake_body.forEach(segment => {
      destroy(segment);
    });
  snake_body = [];
  snake_length = 1;

  snake_body.push(add([
      sprite('spongebob_right'),
      scale(0.05),
      pos(block_size, block_size),
      area({ width: block_size, height: block_size }),
      "snake"
  ]));
  current_direction = directions.RIGHT;
}
add([
		text("\nThe jellyfish stole Spongebob's square pants!\nHelp him by guiding him around the map\n to catch the jellyfish!", {size:20, font:"sinko"},),
    pos(24, 270),
		fixed(),
    ])

let food = null;

function respawn_food(){
    let new_pos = rand(vec2(1,1), vec2(13,13));
    new_pos.x = Math.floor(new_pos.x);
    new_pos.y = Math.floor(new_pos.y);
    new_pos = new_pos.scale(block_size);

    if (food){
        destroy(food);
    }
    food = add([
                sprite('pizza'),
                pos(new_pos),
                area(),
                "food"
            ]);
}

function respawn_all(){
  run_action = false;
    wait(0.5, function(){
        respawn_snake();
        respawn_food();
        run_action = true;
    });
}

respawn_all();

collides("snake", "food", (s, f) => {
    snake_length ++;
    respawn_food();
});

collides("snake", "wall", (s, w) => {
    run_action = false;
    shake(12);
    respawn_all();
});

collides("snake", "snake", (s, t) => {
    run_action = false;
    shake(12);
    respawn_all();
});

keyPress("up", () => {
    if (current_direction != directions.DOWN){
        current_direction = directions.UP;
    }
});

keyPress("down", () => {
    if (current_direction != directions.UP){
        current_direction = directions.DOWN;
    }
});

keyPress("left", () => {
    if (current_direction != directions.RIGHT){
        current_direction = directions.LEFT;
    }
});

keyPress("right", () => {
    if (current_direction != directions.LEFT){
        current_direction = directions.RIGHT;
    }
});


let move_delay = 0.2;
let timer = 0;
action(()=> {
    if (!run_action) return;
    timer += dt();
    if (timer < move_delay) return;
    timer = 0;

    let move_x = 0;
    let move_y = 0;

    switch (current_direction) {
        case directions.DOWN:
            move_x = 0;
            move_y = block_size;
            break;
        case directions.UP:
            move_x = 0;
            move_y = -1*block_size;
            break;
        case directions.LEFT:
            move_x = -1*block_size;
            move_y = 0;
            break;
        case directions.RIGHT:
            move_x = block_size;
            move_y = 0;
            break;
    }

    // Get the last element (the snake head)
    let snake_head = snake_body[snake_body.length - 1];

    let sprite_name = 'spongebob_right'; // Default to Spongebob
    switch (current_direction) {
        case directions.DOWN:
            sprite_name = 'spongebob_down';
            break;
        case directions.UP:
            sprite_name = 'spongebob_up';
            break;
        case directions.LEFT:
            sprite_name = 'spongebob_left';
            break;
        case directions.RIGHT:
            sprite_name = 'spongebob_right';
            break;
    }
    snake_body.push(add([
        sprite(sprite_name), // Always use Spongebob for the head
        scale(0.05),
        pos(snake_head.pos.x + move_x, snake_head.pos.y + move_y),
        area({ width: block_size * 0.05, height: block_size * 0.05 }),
        "snake"
    ]));

    // If there's more than one segment, change the previous head to snake-skin
    if (snake_body.length > 1) {
        const prevHead = snake_body[snake_body.length - 2];
        destroy(prevHead);
        snake_body[snake_body.length - 2] = add([
            sprite('snake-skin'),
            scale(0.05),
            pos(prevHead.pos.x, prevHead.pos.y),
            area({ width: block_size * 0.05, height: block_size * 0.05 }),
            "snake"
        ]);
    }

    if (snake_body.length > snake_length){
        let tail = snake_body.shift(); // Remove the last of the tail
        destroy(tail);
    }

});