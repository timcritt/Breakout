var canvas = document.getElementById("myCanvas");

//event handlers
var rightPressed;
var leftPressed;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

class breakout {
    constructor(canvas) 
    {
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
    }
    start(gameLoop) {
        requestAnimationFrame(gameLoop);
    }

    draw() {


    }
}

var columns = 10;
var offsetLeft = 10;

class Brick {
    constructor(wall, fillColour, x, y, broken) {
        this.width = (canvas.width - (wall.offsetLeft*wall.columns)-wall.offsetLeft)/ wall.columns;
        this.height = 20;
        this.fillColour = fillColour;
        this.strokeColour = 'black';
        this.x = x;
        this.y = y;
        this.broken = broken;
    } 
}

class Wall {
    constructor(rows, columns) 
    {
        this.rows = rows;
        this.columns = columns;
        this.offSetLeft = 10;
        this.offSetTop = 10;
        this.marginTop = 25;
        this.bricks = this.createBrickArray();
    }
    createBrickArray() {
        for (var r = 0; r < this.rows; r++) {
            bricks[r] = [];
            for (var c = 0; c < this.columns; c++) {
                var indent;
                //set indent for alternate rows
                if (r%2 == 0) 
                {
                    indent  = 0;
                } else {
                    indent = (bricks[r][c].width + bricksbrick.offSetLeft)/2;
                }
                var x = c * (this.offSetLeft + brick.width) + brick.offSetLeft + indent;
                var y = r * (brick.offSetTop + brick.height) + brick.offSetTop + brick.marginTop; 
                bricks[r][c] = new Brick(red,x, y);  
    
                //break one end brick of each (indented) rows
                if (indent != 0 && c == brick.column-1) {
                     bricks[r][c].broken = true;                 
                } else {
                    bricks[r][c].broken = false;
                    gameStats.numBricks ++;               
                }
            }  
        }
        return bricks;
    } 
    drawWall(bricks) {
        for (var r = 0; r < this.row; r++) {
            for (var c = 0; c < brick.column; c++) {
                if(bricks[r][c].unbroken) {
                    ctx.fillStyle = brick.fillColour;
                    ctx.fillRect(bricks[r][c].x, bricks[r][c].y, brick.width, brick.height);
                    ctx.strokeStyle = brick.strokeColour;
                    ctx.strokeRect(bricks[r][c].x, bricks[r][c].y, brick.width, brick.height);   
                }
            }   
        }
    }
}

wall = new Wall(10, 3);

console.log(wall);

//scroll bricks down the page
function moveBricks() {
    for (var r = 0; r < brick.row; r++) {
        for (var c = 0; c < brick.column; c++) {
            bricks[r][c].y += brick.fallingSpeed;                     
        }  
    }
}
    
function brickCollision() {
    for (var r = 0; r <brick.row; r++) {
        for (var c = 0; c < brick.column; c++) {
            var b = bricks[r][c];
            if (b.unbroken) {
                if (ball.x + ball.ballRadius > b.x
                && ball.x - ball.ballRadius < b.x + brick.width
                && ball.y + ball.ballRadius > b.y
                && ball.y - ball.ballRadius < b.y + brick.height) {
                    b.unbroken = false;
                    ball.dy = -ball.dy;
                    paddle.lastHit = false;
                    gameStats.numBricks--; 
                    updateScore();    
                } 
                //brick collides with bottom of screen
                if ((b.y >= (canvas.height)) 
                    && (gameStats.score > 0)
                    ) {
                    b.unbroken = false;
                    gameStats.numBricks--;
                    gameStats.score--;
                    updateScore();
                }
                //brick collides with paddle
                if (
                    //check left bound of brick is inside paddle bounds
                    (b.x  > paddle.x)
                    && (b.x < paddle.x + paddle.width)
                    && (b.y >=  canvas.height - (brick.height+paddle.height))
                    //check right bound of brick is inside paddle bounds
                    ||(b.x + brick.width  > paddle.x)
                    && (b.x + brick.width < paddle.x + paddle.width)
                    && (b.y >=  canvas.height - (brick.height+paddle.height)) 
                ){
                    if (gameStats.lives > 0) {
                        gameStats.lives--;
                        b.unbroken = false;  
                        gameStats.numBricks--; 
                    } 
                }
            }
        }
    }
}

function getMousePos(e) {
    return {x:e.clientX,y:e.clientY};
}


var ball = {
    //ball variables
    x: canvas.width/2,
    y: canvas.height-30,
    ballRadius: 10,
    //control ball movement (down is positive, up is negative)
    dx: 4,
    dy: -4,
    drawBall: function()  {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI*2);
        ctx.fillStyle = "#e2aa2f";
        ctx.fill();
        ctx.closePath();
    },
    moveBall: function() {
        this.x += this.dx;
        this.y += this.dy;
    },
    detectCollision: function() {
        //detect collision with top wall
        if ((this.x + this.dx > canvas.width - this.ballRadius) || (this.x + this.dx < this.ballRadius)) {
        this.dx = -this.dx;
        }
        //detect collision with top wall
        if (this.y + this.dy < this.ballRadius) {
            //reverse direction in y-axis
            this.dy = -this.dy;  
        }
        //detect collision with bottom wall
        //TODO

        //collisions with paddle
        if (this.y + this.dy > canvas.height - paddle.height - this.ballRadius &&
            (this.x + this.dx > paddle.x) &&
            (this.x + this.dx < paddle.x + paddle.width)
            ) {
            paddle.lastHit = true;
            calculateCombo()
            //reverses direction
            this.dy = -this.dy;
            //receives impulse from moving paddle
            //TODO
            
        }
        //collision with bottom
        if (this.y == canvas.height && gameStats) {
            gameStats.lives--;
        }
    } 
}

var paddle = {
    height: 10,
    width: 75,
    x: 0,
    isInstantiated: false,
    dx: 7,
    lastHit: true,
    //gets paddle starting position
    getPaddleX: function() {
        
        this.movePaddle();
    },
    //paddle control variables
    paddleDx: 7,
    drawPaddle: function() {
        
        ctx.beginPath();
        ctx.rect(this.x, canvas.height - this.height, this.width, this.height);
        ctx.fillStyle = "#c9c7c5";
        ctx.fill();
        ctx.closePath();
    },
    movePaddle: function() {
        // get left offset of canvas within DOM
        var p = document.getElementById("myCanvas");
        var style = p.currentStyle || window.getComputedStyle(p);
        //remove the "px" from the returned style properties
        var offset = parseInt(style.marginLeft, 10);
        //get the mouse position in the dom
        document.onmousemove = function(e) {
            var mousecoords = getMousePos(e);

            if (mousecoords.x - offset < canvas.width && mousecoords.x - offset > 0) {
                paddle.x = mousecoords.x - offset - paddle.width/2;
            } else if (mousecoords.x < offset) {
                paddle.x = -paddle.width/2 ;
            } else if (mousecoords.x > offset + canvas.width) {
                paddle.x = canvas.width-paddle.width/2;
            }
        }
    }
}

function calculateCombo() {
    if (paddle.lastHit) {
        gameStats.scoreCombo = 1;
    } else {
        gameStats.scoreCombo++;
    }
}

function updateScore() {
    gameStats.score  = gameStats.score + 1*gameStats.scoreCombo;
    calculateCombo();
}

//load stats icons
const SCORE_IMG = new Image();
SCORE_IMG.src = "img/score.png";
const LIFE_IMG = new Image();
LIFE_IMG.src = "img/life.png";
const LEVEL_IMG = new Image();
LEVEL_IMG.src = "img/level.png"

var gameStats = {
    score: 0,
    scoreCombo: 1,
    lives: 10,
    level: 1,
    gameOver: false,
    showStats(text, imgY, x, y) {
        ctx.fillStyle = "#FFF",
        ctx.font = "20px Germania One",
        ctx.fillText(text, x, y);
        ctx.drawImage(imgY, x-34, y-20, 25, 25);
    },
    numBricks: 0,
    
}

function monitorGameStatus() {
    if (gameStats.lives == 0) {
        gameStats.gameOver = true;
    }
    //calculate life bonus
    while (gameStats.score > 100) {
        gameStats.lives ++;
        gameStats.score -=100;
    }
    //move up a level
    if (gameStats.numBricks <= 0) {
        gameStats.numBricks = 0;
        brick.row++;
        ball.x = canvas.width/2;
        ball.y = canvas.height-30;
        
        ball.dx = 4;
        ball.dy = -4;
        paddle.lastHit = true;
        calculateCombo();
        createBrickArray();
    }
}

const BG_IMG = new Image();
BG_IMG.src ="img/BG_IMG.jpg";

//********** Start the game **************
var bricks = [];
createBrickArray();

//draw to screen
function draw() {
    //clear the canvas
    ctx.drawImage(BG_IMG, 0, 0);
    ball.drawBall();
    ball.moveBall();
    ball.detectCollision();  
    brickCollision();
    drawBricks();
    moveBricks();
    gameStats.showStats(gameStats.lives, LIFE_IMG, 40, 25);
    gameStats.showStats(gameStats.numBricks, LEVEL_IMG, canvas.width/2 + 12.5, 25 )
    gameStats.showStats(gameStats.score, SCORE_IMG, canvas.width-40, 25 )
    paddle.getPaddleX();
    paddle.drawPaddle();
    paddle.movePaddle();
   
} 
//control the flow of the game
function gameLoop() {
    if (!gameStats.gameOver) {
        draw();
        monitorGameStatus();
    }
    //recursive call at the end of every frame
    requestAnimationFrame(gameLoop);
}
//initial call to start the game loop on page load

breakout.start(gameLoop);

breakout(canvas);