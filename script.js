
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
// TODO Make request asynchonously and use some placeholder
// TODO make it work
const config = loadConfig();


function configAssert(statement, message) {
    if(!statement) {
        alert("Invalid config: " + message);
        document.location.reload();
    }
}


function checkConfig(config) {
// TODO start_pos too big, count colored chips, check if win is possible
    configAssert(Array.isArray(config.start_pos), "start_pos must be an Array");

    config.rows_n = config.start_pos.length;
    configAssert(config.rows_n != 0, "start_pos can't be empty");

    for(let i = 0; i < config.start_pos.length; i++) {
        configAssert(
            Array.isArray(config.start_pos[i]),
            "every row in start_pos must be an Array"
        );
    }

    for(let i = 0; i < config.start_pos.length - 1; i++) {
        configAssert(
            config.start_pos[i].length == config.start_pos[i + 1].length,
            "start_pos must be a rectangular array"
        );
    }

    config.columns_n = config.start_pos[0].length;
    configAssert(config.columns_n != 0, "start_pos can't be empty");

    let validSlotValues = new Set(["rnd_color", "blocked", "empty"]);
    for(let i = 0; i < config.start_pos.length; i++) {
        for(let j = 0; j < config.start_pos[i].length; j++) {
            configAssert(
                validSlotValues.has(config.start_pos[i][j]),
                "invalid object in start_pos"
            );
        }
    }

    configAssert(
        config.win_lines.length >= config.chip_colors.length,
        "to many colors for given win_lines"
    );
}


function loadConfig() {
    let ret = null;
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'config', false);
    xobj.onreadystatechange = function() {
        if(xobj.readyState == 4 && xobj.status == "200") {
            ret = JSON.parse(xobj.responseText);
        }
    };
    xobj.send(null);
    checkConfig(ret);
    return ret;
}


function shuffle(array) {
    for(let i = 0; i < array.length; i++) {
        let j = i + Math.floor(Math.random() * (array.length - i));
        let tmp = array[j];
        array[j] = array[i];
        array[i] = tmp;
    }
}


class Slot {
    constructor(c, r) {
        this.x = config.padding + c*(Slot.width + config.padding);
        this.y = config.padding + (r + 2)*(Slot.height + config.padding);

        this.color = null;
        this.blocked = false;
        this.focusedOn = false;
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, Slot.width, Slot.height);
        if(this.blocked) {
            ctx.fillStyle = config.blocked_slot_color;
        } else if (this.color) {
            ctx.fillStyle = this.color;
        } else {
            ctx.fillStyle = config.empty_slot_color;
        }
        ctx.fill();
        if(this.focusedOn) {
            ctx.lineWidth = config.cursor_width;
            ctx.strokeStyle = config.cursor_color;
            ctx.stroke();
        }
        ctx.closePath();
        if(this.chip) {
            this.chip.draw();
        }
    }
}

Slot.width = Math.floor((canvas.width - config.padding)/config.columns_n) - config.padding;
Slot.height = Math.floor((canvas.height - config.padding)/(config.rows_n + 2)) - config.padding;


class Game {
    constructor() {

        let controlColors = [...config.chip_colors];
        shuffle(controlColors);

        this.controlSlots = [];
        for(let i = 0; i < controlColors.length; i++) {
            this.controlSlots.push(new Slot(config.win_lines[i], -2));
            this.controlSlots[i].color = controlColors[i];
        }

        let randomColors = [];
        for(let i = 0; i < controlColors.length; i++) {
            for(let j = 0; j < config.rows_n; j++) {
                randomColors.push(controlColors[i]);
            }
        }
        shuffle(randomColors);

        this.slots = [];
        for(let y = 0; y < config.start_pos.length; y++) {
            this.slots.push([]);
            for(let x = 0; x < config.start_pos[y].length; x++) {
                this.slots[y].push(new Slot(x, y));
                if(config.start_pos[y][x] == 'rnd_color') {
                    this.slots[y][x].color = randomColors.pop();
                } else if (config.start_pos[y][x] == 'blocked') {
                    this.slots[y][x].blocked = true;
                }
            }
        }

        this.focus_y = Math.floor(this.slots.length/2);
        this.focus_x = Math.floor(this.slots[this.focus_y].length/2);
        this.slots[this.focus_y][this.focus_x].focusedOn = true;

        this.score = 0;

        document.addEventListener("keydown", this.keyDownHandler.bind(this), false);
    }

    drawScore() {
        ctx.font = String(Slot.height) + "px " + config.score_style;
        ctx.fillStyle = config.score_color;
        let x = config.padding;
        let y = 2 * (config.padding + Slot.height);
        ctx.fillText("Score: " + this.score, x, y);
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < this.controlSlots.length; i++) {
            this.controlSlots[i].draw();
        }

        for(let y = 0; y < this.slots.length; y++) {
            for(let x = 0; x < this.slots[y].length; x++) {
                this.slots[y][x].draw();
            }
        }

        this.drawScore();
    }

    checkWin() {
        for(let x in config.win_lines) {
            for(let y = 0; y < config.rows_n - 1; y++) {
                if(this.slots[y][x].color != this.slots[y + 1][x].color) {
                    return;
                }
            }
        }
        alert("YOU WON! score: " + this.score);
        document.location.reload();
    }

    moveIsBlocked(currentSlot, nextSlot, focusLocked) {
        return focusLocked && currentSlot.color && (nextSlot.blocked || nextSlot.color);
    }

    moveFocus(x, y, focusLocked) {
        let currentSlot = this.slots[this.focus_y][this.focus_x];
        let nextSlot = this.slots[y][x];

        currentSlot.focusedOn = false;
        nextSlot.focusedOn = true;

        this.focus_x = x;
        this.focus_y =y;

        if(focusLocked && currentSlot.color) {
            let tmp = nextSlot.color;
            nextSlot.color = currentSlot.color;
            currentSlot.color = tmp;

            this.score++;
        }
        this.draw();
    }

    keyDownHandler(event) {
        let x = this.focus_x;
        let y = this.focus_y;

        let currentSlot = this.slots[y][x];

        if(
            (event.key == "Right" || event.key == "ArrowRight") &&
            x < config.columns_n - 1 &&
            !this.moveIsBlocked(currentSlot, this.slots[y][x + 1], event.shiftKey)
        ) {
            x++;
        } else if(
            (event.key == "Left" || event.key == "ArrowLeft") &&
            x > 0 &&
            !this.moveIsBlocked(currentSlot, this.slots[y][x - 1], event.shiftKey)
        ) {
            x--;
        } else if(
            (event.key == 'Down' || event.key == "ArrowDown") &&
            y < config.rows_n - 1 &&
            !this.moveIsBlocked(currentSlot, this.slots[y + 1][x], event.shiftKey)
        ) {
            y++;
        } else if(
            (event.key == "Up" || event.key == "ArrowUp") &&
            y > 0 &&
            !this.moveIsBlocked(currentSlot, this.slots[y - 1][x], event.shiftKey)
        ) {
            y--;
        }

        if(x != this.focus_x || y != this.focus_y) {
            this.moveFocus(x, y, event.shiftKey);
            this.checkWin();
        }
    }
}

let game = new Game();
game.draw();
