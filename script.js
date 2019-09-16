
const WHITE = '#ffffff';
const GRAY = "#808080";
const DARK_GRAY = "#c0c0c0";
const BLACK = "#000000";
const RED = "#ff0000";
const GREEN = "#00ff00";
const BLUE = "#0000ff";


const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const columnsN = 5;
const rowsN = 5;

function shuffle(array) {
    for(let i = 0; i < array.length; i++) {
        let j = i + Math.floor(Math.random() * (array.length - i));
        let tmp = array[j];
        array[j] = array[i];
        array[i] = tmp;
    }
}


class Block {
    constructor(c, r, color =GRAY) {
        let offsetLeft = 10;
        let offsetTop = 10;
        let padding = 10;

        this.width = 45;
        this.height = 45;
        
        this.x = offsetLeft + c*(this.width + padding);
        this.y = offsetTop + r*(this.height + padding);

        this.color = color;
        this.focusedOn = false;
        this.blocked = false;
    }

    draw(){
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        if(this.blocked) {
            ctx.fillStyle = BLACK;
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fill();
        if(this.focusedOn) {
            ctx.lineWidth = "10";
            ctx.strokeStyle = WHITE;
            ctx.stroke();
        }
        ctx.closePath();
    }
}


class Game {
    constructor() {
        this.canvas = document.getElementById("myCanvas");
        this.ctx = this.canvas.getContext("2d");

        let controlColors = [RED, GREEN, BLUE];
        shuffle(controlColors);

        this.controlBlocks = []
        for(let i = 0; i < Math.ceil(columnsN/2); i++) {
            this.controlBlocks[i] = new Block(i*2, 0, controlColors[i]);
        }

        let allBlocksColors = []
        for(let i = 0; i < Math.ceil(columnsN/2); i++) {
            for(let j = 0; j < rowsN; j++) {
                allBlocksColors[i * columnsN + j] = controlColors[i];
            }
        }
        shuffle(allBlocksColors);

        this.gameBlocks = [];
        for(let i = 0; i < columnsN; i++) {
            this.gameBlocks[i] = [];
            if(i%2 == 0) {
                for(let j = 0; j < rowsN; j++) {
                    this.gameBlocks[i][j] = new Block(i, 2 + j, allBlocksColors[Math.floor(i/2) * columnsN + j]);
                }
            } else {
                for(let j = 0; j < rowsN; j++) {
                    this.gameBlocks[i][j] = new Block(i, 2 + j);
                    if(j%2 == 0) {
                        this.gameBlocks[i][j].blocked = true;
                    }
                }
            }
        }

        this.gameBlocks[Math.floor(columnsN/2)][Math.floor(rowsN/2)].focusedOn = true;
    }

    draw() {
        for(let i = 0; i < Math.ceil(columnsN/2); i++) {
            this.controlBlocks[i].draw();
        }
        for(let i = 0; i < columnsN; i++) {
            for(let j = 0; j < rowsN; j++) {
                this.gameBlocks[i][j].draw();
            }
        }
    }
}

let game = new Game();
game.draw();