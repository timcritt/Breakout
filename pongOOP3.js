class Vector {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.length = this.getLength();
    } 
    getLength = () => {
        this.length = Math.sqrt(Math.pow(this.y,2) + Math.pow(this.x,2));
    }
}
class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = 3;
        this.dy = -4;
        this.maxDx = 3;
    }
    drawBall = () => {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "#dd6a40";
        ctx.fill();
        ctx.closePath(); 
    }
    moveBall = () => {
        this.x += this.dx;
        this.y += this.dy;
    }
    resetBall(){
        this.x = canvas.width/2;
        this.y = 20;
    }
    detectWallCollision = (canvas, gameStats) => {
        //detect collision with top wall
        if ((this.x + this.dx > canvas.width - this.radius) || (this.x + this.dx < this.radius)) {
        this.dx = -this.dx;
        }
        //detect collision with top wall
        if (this.y + this.dy < this.radius) {
            //reverse direction in y-axis
            this.dy = -this.dy;  
        }
        //detect collision with bottom wall
        if (this.y + this.radius > canvas.height ) {
            this.dy = -this.dy;
            gameStats.lives--;
        }
    }
    detectPaddleCollision = (paddle) => {
        //collisions with paddle
        if ((this.y + this.dy > canvas.height - paddle.height - this.radius - paddle.y) &&
            (this.x + this.dx > paddle.x) &&
            (this.x + this.dx < paddle.x + paddle.width)
            ) {
            //paddle.lastHit = true;
            //calculateCombo()
            //reverses direction
            this.dy = -this.dy;
            ///receives impulse from moving paddle

            if (this.dx + paddle.speed/2 >= this.maxDx) {
                this.dx = this.maxDx;
            } else if (this.dx + paddle.speed/2 <= - this.maxDx) {
                this.dx = -this.maxDx
            } else {
                this.dx += paddle.speed/2;
            }
        }
    }
}
class Wall {
    constructor(rows, columns) {
        //wall properties
        this.rows = rows;
        this.columns = columns;
        this.marginTop = 30;
        this.numBricks = 0;
        //brick properties
        this.bricks = [];
        this.offSetLeft = 10;
        this.offSetTop = 10;
        this.brickWidth = (canvas.width - (this.offSetLeft*this.columns)-this.offSetLeft)/ this.columns;
        this.brickHeight = 20;
        this.indent = 0;
    }
    //creates the array of bricks
    buildWall = () => {
        for (var r = 0; r < this.rows; r++) {
            this.bricks[r] = [];

            for (var c = 0; c < this.columns; c++) {
                this.bricks[r][c] = new Brick(getRandomColor());
                this.numBricks++;
                
                //set indent for alternate rows
                r%2 == 0 ? this.indent = 0 : this.indent = (this.brickWidth + this.offSetLeft)/2; 
                    
                //Set coordinates of bricks.
                this.bricks[r][c].x = c * (this.offSetLeft + this.brickWidth) + this.offSetLeft + this.indent;
                this.bricks[r][c].y = r * (this.offSetTop + this.brickHeight) + this.offSetTop + this.marginTop;
                
                //break the right end brick of every indented row to complete pattern
                if (this.indent != 0 && c == this.columns-1) {
                    this.bricks[r][c].broken = true;
                    this.numBricks--;
                } else {
                    this.bricks[r][c].broken = false;
                }                    
            }  
        }
    }
    //draw the wall to the canvas
    drawWall = () => {
        for (var r = 0; r < this.rows; r++) {
            for (var c = 0; c < this.columns; c++) {
                var brick = this.bricks[r][c];
                if(!brick.broken) {
                    ctx.fillStyle = brick.fillColour;
                    ctx.fillRect(brick.x, brick.y, this.brickWidth, this.brickHeight);
                    ctx.strokeStyle = brick.strokeColour;
                    ctx.strokeRect(brick.x, brick.y, this.brickWidth, this.brickHeight);   
                }
            }   
        }
    }
    brickCollision = (ball, paddle, gameStats) => {
        for (var r = 0; r <this.rows; r++) {
            for (var c = 0; c < this.columns; c++) {
                var b = this.bricks[r][c];
                if (!b.broken) {
                    if (ball.x + ball.radius > b.x
                    && ball.x - ball.radius < b.x + this.brickWidth
                    && ball.y + ball.radius > b.y
                    && ball.y - ball.radius < b.y + this.brickHeight) {
                        b.broken = true;
                        ball.dy = -ball.dy;
                        //paddle.lastHit = false;
                        this.numBricks--; 
                        
                        //updateScore();
                    } 
                    //brick collides with bottom of screen
                    if ((b.y >= (canvas.height)) 
                        //&& (gameStats.score > 0)
                        ) {
                        b.broken = true;
                        //gameStats.score--;
                        //updateScore();
                    }
                    //brick collides with paddle
                    if (
                        //check left bound of brick is inside paddle bounds
                        (b.x  > paddle.x)
                        && (b.x < paddle.x + paddle.width)
                        && (b.y >=  canvas.height - (this.brickHeight + paddle.height))
                        //check right bound of brick is inside paddle bounds
                        ||(b.x + this.brickWidth  > paddle.x)
                        && (b.x + this.brickwidth < paddle.x + paddle.width)
                        && (b.y >=  canvas.height - (this.brickHeight + paddle.height)) 
                    ){
                        if (gameStats.lives > 0) {
                            gameStats.lives--;
                            b.broken = true;  
                            this.numBricks--; 
                        } 
                    }
                }
            }
        }
    }
}
class Brick {
    constructor(fillColour) {
        this.fillColour = fillColour;
        this.strokeColour = 'black';
        this.x = 0;
        this.y = 0;
        this.broken = false;
    }
}
class Paddle {
    constructor() {
        this.height = 10;
        this.width = 70;
        this.x;
        this.x1;
        this.x2;
        this.dx;
        this.y = 20;
        this.speed = 0;
    }
    getXPosition = () => {
        this.x2 = this.x;
    }
    getPaddleSpeed = () => {
        var interval = 1000;
        this.x1 = this.x
        setTimeout(this.getXPosition, interval);
        this.speed = (this.x1-this.x2)/(interval/600);
        console.log(this.speed);   
    }
    drawPaddle = () => {
        ctx.beginPath();
        ctx.rect(this.x, canvas.height - this.height - this.y, this.width, this.height);
        ctx.fillStyle = "#c9c7c5";
        ctx.fill();
        ctx.closePath();
    }
    movePaddle = () => {
        // get left offset of canvas within DOM
        var p = document.getElementById("myCanvas");
        var style = p.currentStyle || window.getComputedStyle(p);
        //remove the "px" from the returned style properties
        var offset = parseInt(style.marginLeft, 10);
        //get the mouse position in the dom
        document.onmousemove = (e) =>  {
            var mousecoords = getMousePos(e);
            var paddle = this;
            
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
class GameStats {
    constructor(score, lives, level) {
        this.score = score;
        this.lives = lives;
        this.level = level;
        this.gameOver = false;
        this.paused = false;
        this.SCORE_IMG = new Image();
        this.SCORE_IMG.src = "img/score.png";
        this.LIFE_IMG = new Image();
        this.LIFE_IMG.src = "img/life.png";
        this.LEVEL_IMG = new Image();
        this.LEVEL_IMG.src = "img/level.png";
    }
    showStats = (text, imgY, x, y) => {
        ctx.fillStyle = "#FFF",
        ctx.font = "20px Germania One",
        ctx.fillText(text, x, y);
        ctx.drawImage(imgY, x-34, y-20, 25, 25);
    }
}
class Breakout {
    constructor() {
        this.ball = new Ball(canvas.width/2,canvas.height-50, 12); 
        this.wall = new Wall(1, 1);
        this.paddle = new Paddle();
        this.gameStats = new GameStats(0,1,0);
        this.BG_IMG = new Image();
        this.BG_IMG.src ="img/BG_IMG.jpg";
    }
    startGame = () => {
        this.wall.buildWall();
        requestAnimationFrame(this.gameLoop);
    }
    draw = () => {
        
    }
    checkGameStatus() {
        if (this.wall.numBricks <= 0) {
            this.gameStats.gameOver = true;
        }
    }
    togglePause() {
        console.log('paused');
        game.gameStats.paused = !game.gameStats.paused;
    }
    resetGame() {
        this.wall.buildWall();
        this.ball.resetBall();
        this.gameStats.gameOver = false;
    }

    //The only place where not using an arrow function interferes with the binding of "this" ASK LLUIS WHY!
    gameLoop = () => {
        if (!this.gameStats.gameOver) {
            ctx.drawImage(this.BG_IMG, 0, 0);
        this.ball.drawBall(ctx);
        this.wall.drawWall();
        this.paddle.drawPaddle();
        this.gameStats.showStats(this.gameStats.lives, this.gameStats.LIFE_IMG, 40, 25);
        this.gameStats.showStats(this.gameStats.level, this.gameStats.LEVEL_IMG, canvas.width/2 + 12.5, 25 );
        this.gameStats.showStats(this.gameStats.score, this.gameStats.SCORE_IMG, canvas.width-40, 25 ); 

            if(!this.gameStats.paused) {
                this.ball.moveBall();
                this.paddle.movePaddle();
                this.ball.detectWallCollision(canvas, this.gameStats);
                this.ball.detectPaddleCollision(this.paddle);
                this.wall.brickCollision(this.ball, this.paddle, this.gameStats); 
                this.paddle.getPaddleSpeed();
            }
        }
        if (this.gameStats.gameOver) {
            this.togglePause();
            this.resetGame();
            this.togglePause();
        }
        this.checkGameStatus();
        
        //recursive call at the end of every frame
        requestAnimationFrame(this.gameLoop);
    }    
}
//*************************** Auxiliary functions ****************
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#96FF';
    for (var i = 0; i < 2; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function getMousePos(e) {
    return {x:e.clientX,y:e.clientY};
}

//********************SETUP THE GAME ****************************
//setup the canvas and the context
const canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext('2d');

//create new game and start
const game = new Breakout();
game.startGame();
var vector = new Vector(game.ball.x, game.ball.y);

window.addEventListener("keydown", event => {
    if (event.keyCode == 80) {
        console.log('pausekeypressed')
        game.togglePause();
    }
});
