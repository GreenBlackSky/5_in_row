
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
}


function shuffle(array) {
    for(let i = 0; i < array.length; i++) {
        let j = i + Math.floor(Math.random() * (array.length - i));
        let tmp = array[j];
        array[j] = array[i];
        array[i] = tmp;
    }
}


class Chip {
    constructor(color) {
        this.color = color;
    }
}


class Slot {
    constructor(c, r, blocked=false) {

        // TODO Make static
        width = Math.floor((ctx.width - config.padding)/config.colums_n);
        height = Math.floor((ctx.height - config.padding)/config.rows_n);

        this.x = config.offsetLeft + c*(config.slot_width + config.padding);
        this.y = config.offsetTop + r*(config.slot_height + config.padding);

        this.chip = null;
        this.blocked = blocked;
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, config.slot_width, config.slot_height);
        if(this.blocked) {
            ctx.fillStyle = config.blocked_slot_color;
        } else if (this.chip) {
            ctx.fillStyle = this.chip.color;
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

        this.controlSlots = [];
        this.slots = [];

        let chips = []
        shuffle(chips);
        // TODO Fill field

    }

    draw() {
        for(let i = 0; i < this.controlSlots.length; i++) {
            this.controlSlots[i].draw();
        }
        for(let i = 0; i < this.slots.length; i++) {
            let row = this.slots[i]
            for(let j = 0; j < rowsN; j++) {
                row[j].draw();
            }
        }
    }
}

// let game = new Game();
// game.draw();