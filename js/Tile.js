class Tile {

    constructor(x,y) {
    this.revealed = false;
    this.mine = false;
    this.flagged = false;
    this.x = x;
    this.y = y;
    this.id = this.x + "_" + this.y;
    this.NEIGHBORS = [];
    this.neighborCount = null;
    this.neighborMines = 0;
    this.element = null;

    this.colors = {
        1:'blue',
        2:'green',
        3:'red',
        4:'purple',
        5:'maroon',
        6:'#fa11e7',
        7:'navy',
        8:'orange',
    };
    }

    ToggleFlagged() {
        this.flagged = !(this.flagged);
        if(this.mine && this.flagged) {
            this.revealed = true;
        }
        if(this.mine && !this.flagged) {
            this.revealed = false;
        }
    }

    FindNeighbors(tiles) {
        /*
            Top Left: x - 1, y + 1
            Mid Left: x - 1, y
            Bot Left: x - 1, y - 1
            Top Mid: x, y + 1
            Bot Mid: x, y - 1
            Top Right: x + 1, y + 1
            Mid Right: x + 1, y
            Bot Right: x + 1, y - 1
        */
        this.NEIGHBORS = [];
        this.neighborMines = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                var id = (this.x + i) + "_" + (this.y + j);

                if(id !== this.id && tiles[id] !== undefined) {
                    this.NEIGHBORS.push(tiles[id]);
                    if (tiles[id].mine) {
                        this.neighborMines += 1;
                    }
                }

            }    
        }
        this.neighborCount = this.NEIGHBORS.length;
    }

    GetNeighbors() {
        if(this.NEIGHBORS.length === 0) {
            return null;
        }
        return this.NEIGHBORS;
    }

    Reveal(tiles) {
        this.revealed = true;
        this.element.classList.remove('unrevealed');

        if(this.mine) {
            this.element.classList.add('mine');
            return true;
        }

        if(this.neighborMines !== 0) {
            this.element.innerHTML = "<p>" + this.neighborMines + "</p>";
            this.element.style.color = this.colors[this.neighborMines];
        } else {
            this.RevealZeros(tiles);
        }
        if(CheckWin()) {
            Win();
        }
    }

    RevealZeros(tiles) {
        this.NEIGHBORS.forEach(neighbor => {
            if(neighbor.NEIGHBORS.length === 0) {
                neighbor.FindNeighbors(tiles);
                if(!(neighbor.revealed)) {
                    setTimeout(function() {
                        neighbor.Reveal(tiles);
                    }, 50);
                }
            }
        });
    }

}