
const root = document.querySelector(':root');
var rootStyle;
var tileSize;
var fontSize;
var tiles = {};
var tileCount = 0;
var flagging = false;
var gameOver = true;

var playsettingsdiv;
var popupdiv;
var actiondiv;


function StartUp() {
    ReadStyle();

    playsettingsdiv = document.getElementById('playsettings');
    popupdiv = document.getElementById('gamepopup');
    actiondiv = document.getElementById('actions');

    Toggle(false, actiondiv);
    Toggle(false, popupdiv);
    SetBoard();
}

function CheckValues(element, value) {
    const max = element.getAttribute('max');
    const min = element.getAttribute('min');

    if(value > max || value < min) {
        if(document.getElementById('btnPlay') !== null) {
            document.getElementById('btnPlay').remove();
        }
        element.classList.add("error");
    } else {
        if(document.getElementById('btnPlay') === null) {
            var newE = document.getElementById('play').appendChild(document.createElement('button'));
            newE.setAttribute('id','btnPlay');
            newE.setAttribute('onclick','StartGame()');
            newE.innerHTML = "Play";
            element.classList.remove("error");
        }
        
        SetBoard();
    }
}

function ChangeSize(width, height) {
    var newBoardWidth = width * tileSize;
    var newBoardHeight = height * tileSize;
    var sizes = CreateSize(newBoardWidth, newBoardHeight);

    root.style.setProperty('--gameWidth', sizes[0]);
    root.style.setProperty('--gameHeight', sizes[1]);
    ReadStyle();
}

function ZoomControl(control) {
    x = document.getElementById('txtWidth').value;
    y = document.getElementById('txtHeight').value;
    var newTileSize = tileSize;

    if(control === 'zoomin') {
        newTileSize = (tileSize + 10);
        if(newTileSize > 80) {
            return;
        }
    }
    if(control === 'zoomout') {
        newTileSize = (tileSize - 10);
        if(newTileSize < 30) {
            return;
        }
    }
    if(control === 'reset') {
        newTileSize = 50;
    }
    var newFontSize = (newTileSize / (72/96)) - 25;

    root.style.setProperty('--tileSize', newTileSize + "px");
    root.style.setProperty('--fontSize', newFontSize + "pt");
    ReadStyle();
    ChangeSize(x,y);
}

var keyDown = false;

addEventListener('keydown', function(e) {
    if(!gameOver) {
        if(e.code === "Space" && e.target === document.body) {
            e.preventDefault();
          }
        if(e.code === "Space" && !(keyDown)) {
            keyDown = true;
            SetFlagging();
        }
        if(e.code === "KeyR" && !(keyDown)) {
            keyDown = true;
            Loss();
        }
    }
})

addEventListener('keyup', function(e) {
    keyDown = false;
});

function SetFlagging() {
    element = document.getElementById('flag');  
    flagging = !flagging;
    element.classList.toggle('flagactive');
}

function CreateSize(width, height) {
    var newWidth = width + "px";
    var newHeight = height + "px";
    return [newWidth, newHeight];
}

function ReadStyle() {
    try {
        rootStyle = getComputedStyle(root);
        tileSize = parseInt(rootStyle.getPropertyValue('--tileSize').replace("px", ""));
        fontSize = parseInt(rootStyle.getPropertyValue('--fontSize').replace("px", ""));
    } catch (e) {
        console.log(e)
    }

}

function StartGame() {
    gameOver = false;
    if(flagging) {
        SetFlagging();
    }
    Toggle(false, playsettingsdiv);
    Toggle(false, popupdiv);
    Toggle(true, actiondiv);
    SetBoard();
}

function SetBoard() {
    var tileColumnCount = document.getElementById('txtWidth').value;
    var tileRowCount = document.getElementById('txtHeight').value;

    tileCount = tileColumnCount * tileRowCount;

    CreateTiles(tileColumnCount,tileRowCount);
    SetMines(tileColumnCount, tileRowCount);
}

function CreateTiles(x,y) {
    tiles = {};
    document.getElementById('gamearea').innerHTML = '';

    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            newTile = new Tile(j+1,i+1);
            newKey = (j+1) + "_" + (i+1);
            tiles[newKey] = newTile;
            DrawTile(newKey);
        }
    }

    ChangeSize(x,y);
}

function SetMines(width, height) {
    if (!gameOver) {
        const difficulty = document.getElementById('difficulty').value;
    
        const mineCount = Math.floor(((tileCount / 6) * (difficulty / 1.1)) - ((difficulty * difficulty) * 5));

        for (let i = 0; i < mineCount; i++) {
            var x = Math.floor(Math.random() * width) + 1;
            var y = Math.floor(Math.random() * height) + 1;

            var id = (x) + "_" + (y);
            if(tiles[id].mine) {
                i--;
            } else {
                tiles[id].mine = true;
            }
        }
    }
}

function DrawTile(key) {
    const gamearea = document.getElementById('gamearea');

    var newTile = gamearea.appendChild(document.createElement('div'));
    tiles[key].element = newTile;
    newTile.setAttribute('id',key);
    newTile.setAttribute('onclick','TileClicked(this.id)');
    newTile.classList.add('tile');
    newTile.classList.add('unrevealed');
    // newTile.innerHTML = key;
}

function TileClicked(id) {
    const tile = tiles[id];

    if(!gameOver) {
        if(!(flagging)) {
            //REVEAL TILE
            if(!(tile.revealed || tile.flagged)) { 
    
                //CHECK IF MINE
                if(tile.mine) {
                    tile.Reveal();
                    Loss();
                    return;
                }
    
                //FIND NEIGHBORS
                tiles[id].FindNeighbors(tiles);
    
                //SET TILE NUMBER -> NEIGHBORS W/ MINES
                tile.Reveal(tiles);
    
            }
        } else {
            if(!tile.flagged && !tile.revealed) {
                tile.ToggleFlagged();
                tile.element.classList.add('flagged');
            } else {
                tile.ToggleFlagged();
                tile.element.classList.remove('flagged');
            }
        }
        if(CheckWin()) {
            Win();
        }
    }

}

function Loss() {
    gameOver = true;
    Toggle(true, popupdiv);
    Toggle(false, actiondiv);
    PopulatePopup("You Lost");
    RevealAll();
}

function Win() {
    gameOver = true;
    Toggle(true, popupdiv);
    Toggle(false, actiondiv);
    PopulatePopup("You Win!");
    RevealAll();
}

function PlayAgain() {
    Toggle(true, playsettingsdiv);
    Toggle(false, popupdiv);
    PopulatePopup("");
    SetBoard();
}

function Toggle(show, element) {
    try {
        if(show) {
            element.style.display = 'block';
        } else if(!show) {
            element.style.display = 'none';
        } else {
            console.error('Unknown arg[0]: Toggle()');
        }
    } catch (error) {
        console.log(error);
    }
}

function PopulatePopup(message) {
    popuptext = document.getElementById('gamepopuptext');

    popuptext.innerHTML = message;
}

function CheckWin() {
    if(!gameOver) {
        for(var tile in tiles) {
            var currTile = tiles[tile];
            if((!currTile.revealed && currTile.mine)) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function RevealAll() {

    for(var tile in tiles){
        tiles[tile].FindNeighbors(tiles);
        tiles[tile].Reveal(tiles);
    }
    Toggle(false, actiondiv);
}

//DEBUG FUNCTIONS
function PrintTiles() {
    console.log(tiles);
}

function CheckCheckWin() {
    if(CheckWin()) {
        console.log("WIN");
    }
}