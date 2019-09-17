
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const config = loadConfig();


// TODO Make request asynchonously and use some placeholder
function loadConfig() {
    let ret = null;
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'config.json', false);
    xobj.onreadystatechange = function() {
        if(xobj.readyState == 4 && xobj.status == "200") {
            ret = JSON.parse(xobj.responseText);
        }
    };
    xobj.send(null);
    return ret;
}


function checkConfig() {
// TODO implement
// TODO remove columns_n and rows_n from config
}


function shuffle(array) {
    for(let i = 0; i < array.length; i++) {
        let j = i + Math.floor(Math.random() * (array.length - i));
        let tmp = array[j];
        array[j] = array[i];
        array[i] = tmp;
    }
}


class Cursor {
    constructor() {

    }
    draw() {
        // TODO implement, animate
    }
}

class Chip {
    constructor(color) {
        this.color = color;
    }
    draw(){
        // TODO implement, animate
    }
}


class Slot {
    constructor(c, r) {

        // TODO Make static
        this.width = Math.floor((canvas.width - config.padding)/config.columns_n) - config.padding;
        this.height = Math.floor((canvas.height - config.padding)/(config.rows_n + 2)) - config.padding;

        this.x = config.padding + c*(this.width + config.padding);
        this.y = config.padding + (r + 2)*(this.height + config.padding);

        // TODO replace with chips
        this.color = null;
        this.blocked = false;
        this.focusedOn = false;
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        if(this.blocked) {
            ctx.fillStyle = config.blocked_slot_color;
        } else if (this.color) {
            ctx.fillStyle = this.color;
        } else {
            ctx.fillStyle = config.empty_slot_color;
        }
        ctx.fill();
        if(this.focusedOn) {
            ctx.lineWidth = "10";
            ctx.strokeStyle = config.cursor_color;
            ctx.stroke();
        }
        ctx.closePath();
    }
}


class Game {
    constructor() {

        let controlColors = [...config.chip_colors];
        shuffle(controlColors);

        // TODO use map?
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
        let field = config.starting_configuration;
        for(let y = 0; y < field.length; y++) {
            this.slots[y] = []
            for(let x = 0; x < field[y].length; x++) {
                this.slots[y][x] = new Slot(x, y);
                if(field[y][x] == 'rnd_color') {
                    this.slots[y][x].color = randomColors.pop()
                } else if (field[y][x] == 'blocked') {
                    this.slots[y][x].blocked = true;
                }
            }
        }

        this.focus_y = Math.floor(this.slots.length/2);
        this.focus_x = Math.floor(this.slots[this.focus_y].length/2);
        this.slots[this.focus_y][this.focus_x].focusedOn = true;

        document.addEventListener("keydown", this.keyDownHandler.bind(this), false);
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
    }

    keyDownHandler(event) {
        this.slots[this.focus_y][this.focus_x].focusedOn = false;
        if(
            (event.key == "Right" || event.key == "ArrowRight") &&
            this.focus_x < config.columns_n - 1 &&
            !this.slots[this.focus_y][this.focus_x + 1].blocked
        ) {
            this.focus_x++;
        } else if(
            (event.key == "Left" || event.key == "ArrowLeft") &&
            this.focus_x > 0 &&
            !this.slots[this.focus_y][this.focus_x - 1].blocked
        ) {
            this.focus_x--;
        } else if(
            (event.key == 'Down' || event.key == "ArrowDown") &&
            this.focus_y < config.rows_n - 1 &&
            !this.slots[this.focus_y + 1][this.focus_x].blocked
        ) {
            this.focus_y++;
        } else if(
            (event.key == "Up" || event.key == "ArrowUp") &&
            this.focus_y > 0 &&
            !this.slots[this.focus_y - 1][this.focus_x].blocked
        ) {
            this.focus_y--;
        }
        this.slots[this.focus_y][this.focus_x].focusedOn = true;
        this.draw(); // TODO optimize redarw
    }
}

let game = new Game();
game.draw();
