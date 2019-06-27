class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = 4;
        this.dy = -4;
        this.maxDx = 4;
        this.touchedBottom = false;
    }
    drawBall = () => {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.closePath(); 
    }
    moveBall = () => {
        this.x += this.dx;
        this.y += this.dy;
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
            gameStats.lives--;
            this.touchedBottom = true;
            gameStats.loseLife.pause()
            gameStats.loseLife.currentTime = 0;
            gameStats.loseLife.play();
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
        this.marginTop = 50;
        this.numBricks = 0;
        //brick properties
        this.bricks = [];
        this.offSetLeft = 10;
        this.offSetTop = 10;
        this.brickWidth = (canvas.width - (this.offSetLeft*this.columns)-this.offSetLeft)/ this.columns;
        this.brickHeight = 20;
        this.indent = 0;
        //audio
        this.brickBreak = new Audio('/sound/brickBreak.mp3');
    }
    //creates the array of bricks
    buildWall = (bricks) => {
        for (var r = 0; r < this.rows; r++) {
            bricks[r] = [];

            for (var c = 0; c < this.columns; c++) {
                bricks[r][c] = new Brick(getRandomColor());
                this.numBricks++;
                
                //set indent for alternate rows
                r%2 == 0 ? this.indent = 0 : this.indent = (this.brickWidth + this.offSetLeft)/2; 
                    
                //Set coordinates of bricks.
                bricks[r][c].x = c * (this.offSetLeft + this.brickWidth) + this.offSetLeft + this.indent;
                bricks[r][c].y = r * (this.offSetTop + this.brickHeight) + this.offSetTop + this.marginTop;
                
                //break the right end brick of every indented row to complete pattern
                if (this.indent != 0 && c == this.columns-1) {
                    bricks[r][c].broken = true;
                    this.numBricks--;
                } else {
                    bricks[r][c].broken = false;
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
    brickCollision = (ball, gameStats) => {
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
                        this.numBricks--; 
                        gameStats.score++;
                        this.brickBreak.pause();
                        this.brickBreak.currentTime=0;
                        this.brickBreak.play();
                    } 
                }
            }
        }
    }
}
class Brick {
    constructor(fillColour) {
        this.fillColour = fillColour;
        this.strokeColour = '#fffff1';
        this.x = 0;
        this.y = 0;
        this.broken = false;
    }
}
class Paddle {
    constructor() {
        this.height = 10;
        this.width = 70;
        this.x = (canvas.width/2) - this.width/2;
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
        var interval = 50;
        this.x1 = this.x
        setTimeout(this.getXPosition, interval);
        this.speed = (this.x1-this.x2)/(interval/20); 
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
    constructor(lives, level, score) {
        this.newGame = true;
        this.score = score;
        this.lives = lives;
        this.level = level;
        this.gameOver = false;
        this.paused = false;
        this.playing = false;
        this.serving = true;
        this.SCORE_IMG = new Image();
        this.SCORE_IMG.src = "img/score.png";
        this.LIFE_IMG = new Image();
        this.LIFE_IMG.src = "img/life.png";
        this.LEVEL_IMG = new Image();
        this.LEVEL_IMG.src = "img/level.png";
        this.levelUp = new Audio('/sound/levelUp.mp3');
        this.loseLife = new Audio('/sound/loseLife.mp3')
        this.gameOverSound = new Audio('/sound/gameOver.mp3');
    }
    showStats = (text, imgY, x, y) => {
        ctx.fillStyle = "#FFF",
        ctx.font = "15px Orbitron",
        ctx.textAlign = "left"
        ctx.fillText(text, x, y);
        ctx.drawImage(imgY, x-30, y-20, 25, 25);
    }
}
class Breakout {
    constructor() {
        this.ball = new Ball(canvas.width/2,canvas.height-50, 12); 
        this.wall = new Wall(2, 8);
        this.paddle = new Paddle();
        this.gameStats = new GameStats(3,1,0);
        this.levelComplete = false;
        //background Image
        this.BG_IMG = new Image();
        this.BG_IMG.src ="img/BG_IMG.jpg";
        this.scrollSpeed = 1;
        this.sideScrollSpeed = 0.5;
        this.bgX = 0;
        this.bgY = 0;
    }
    startGame = () => {
        this.wall.rows = 2;
        this.gameStats.lives = 1;
        this.gameStats.level = 1;
        this.wall.numBricks = 0;
        this.gameStats.score = 0;
        this.levelComplete = false;
        this.gameStats.gameOver = false;
        this.wall.buildWall(this.wall.bricks);
        requestAnimationFrame(this.gameLoop);
    }
    checkGameStatus() {
        if (this.wall.numBricks <= 0) {
            this.gameStats.levelComplete = true;
        }
        if (this.gameStats.lives <= 0) {
            this.gameStats.gameOver = true;
        }
    }
    toggleMute(){
        this.gameStats.loseLife.muted = !this.gameStats.loseLife.muted;
        this.gameStats.levelUp.muted = !this.gameStats.levelUp.muted; 
        this.wall.brickBreak.muted = !this.wall.brickBreak.muted;
        this.gameStats.gameOverSound.muted = !this.gameStats.gameOverSound.muted;
    }
    togglePause() {
        game.gameStats.paused = !game.gameStats.paused;
    }
    resetGame() {
        this.gameStats.paused = true;
        this.resetBall();
        this.wall.numBricks = 0;
        this.wall.rows = 2;
        this.wall.buildWall(this.wall.bricks);
        this.gameStats.lives = 1;
        this.gameStats.level = 1;
        this.gameStats.score = 0;
        this.gameStats.gameOver = false;
        this.gameStats.paused =false;
        this.gameStats.serving = true;
        this.ball.touchedBottom = false;
    }
    createNewLevel() {
        this.resetBall();
        //this.gameStats.paused = true;
        this.gameStats.level++;
        this.wall.rows++;
        this.wall.buildWall(this.wall.bricks);
        this.gameStats.levelUp.play();
        this.gameStats.playing = false;
        this.gameStats.serving = true;
        this.gameStats.levelComplete = false;
        //this.gameStats.paused = false;
    }
    scrollBackground = () => {
        //background tiled images arranged in rows and columns as shown below
        //the left column is drawn only when the center column exits by the right edge of the canvas
        //the right column is drawn only when the center column exits by the left edge of the canvas

        // A1  A2  A3        (B2 starts centered on the canvas)
        // B1  B2  B3

        //Only one of the outer columns is drawn at a time.

        // ************* Vertical scrolling *****************
        ctx.drawImage(this.BG_IMG, this.bgX, this.bgY, canvas.width, canvas.height); // draw B2 
        ctx.drawImage(this.BG_IMG, this.bgX, this.bgY - canvas.height, canvas.width, canvas.height); // draw A2 
        this.bgY += this.scrollSpeed; 
        // reset coordinates
        if (this.bgY == canvas.height) {
                this.bgY = 0;
        }
        // **** when scrolling right to left ****
        if (this.bgX < 0) { 
            ctx.drawImage(this.BG_IMG, this.bgX + canvas.width, this.bgY - canvas.height, canvas.width, canvas.height); // draw A3
            ctx.drawImage(this.BG_IMG, this.bgX + canvas.width, this.bgY, canvas.width, canvas.height);  //draw B3
            //reset x coordinate
            if (this.bgX == -canvas.width) {
                this.bgX = 0;
            }
        // **** when scrolling left to right ****
        } else  {
            ctx.drawImage(this.BG_IMG, this.bgX - canvas.width, this.bgY-canvas.height, canvas.width, canvas.height); // draw A1
            ctx.drawImage(this.BG_IMG, this.bgX - canvas.width, this.bgY, canvas.width, canvas.height); // draw B1
            //reset x coordinate
            if (this.bgX == canvas.width) {
                this.bgX = 0;
            }
        }  
    }
    moveBackground = () => {
        if((this.paddle.x + this.paddle.width*1.5 < canvas.width/2) ) {
            this.bgX = this.bgX + this.sideScrollSpeed;
        }else if ((this.paddle.x  > canvas.width/2 + this.paddle.width*1.5)) {
             this.bgX = this.bgX - this.sideScrollSpeed;
        }
    }
    handleClick() {

        //restart after game over
        if (this.gameStats.gameOver) {
            this.gameStats.gameOver = false;
            this.gameStats.serving = true;
            this.resetGame();
        //start game after first load
        } else if (this.gameStats.newGame == true) {
            this.gameStats.newGame = false;
            this.gameStats.serving = true;
            this.gameStats.levelComplete = false;
        //serve the ball            
        } else if (this.gameStats.serving) {
            this.serveBall();
            this.gameStats.serving = false;
        }
    }
    resetBall() {
        this.ball.x = this.paddle.x + this.paddle.width/2;
        this.ball.y = canvas.height -45;
        this.ball.dx = 0;
        this.ball.dy = 0;
        this.gameStats.serving = true;
        //this.ball.touchedBottom = false;
       // alert("ball reset");
    }
    serveBall() {
        this.ball.dy = -4;
        this.gameStats.serving = false;
        this.gameStats.playing = true;
        
        if (this.paddle.speed/2 >= this.ball.maxDx){
            this.ball.dx = this.ball.maxDx;
        } else if (this.paddle.speed/2 <= -this.ball.maxDx) {
            this.ball.dx = -this.ball.maxDx
        } else {
            this.ball.dx = this.paddle.speed;
        }
    }
    gameLoop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        //controls the game for when the ball is loose

        if (this.gameStats.playing) {

            if (this.gameStats.gameOver) {
                this.gameStats.gameOverSound.pause();
                this.gameStats.gameOverSound.currentTime = 0;
                this.gameStats.gameOverSound.play();
                this.gameStats.playing = false;
            }

            if (!this.gameStats.paused) {
                this.scrollBackground();
                this.moveBackground();
                this.ball.moveBall();
                this.paddle.movePaddle();
                this.ball.detectWallCollision(canvas, this.gameStats);
                this.ball.detectPaddleCollision(this.paddle);
                this.wall.brickCollision(this.ball, this.gameStats); 
                this.gameStats.showStats(this.gameStats.lives, this.gameStats.LIFE_IMG, 40, 25);
                this.gameStats.showStats(this.gameStats.level, this.gameStats.LEVEL_IMG, canvas.width/2 + 12.5, 25 );
                this.gameStats.showStats(this.gameStats.score, this.gameStats.SCORE_IMG, canvas.width-40, 25 );
                this.ball.drawBall(ctx);
                this.wall.drawWall();
                this.paddle.drawPaddle();
                this.paddle.getPaddleSpeed();
                this.checkGameStatus();
                
                //reset ball if ball touched bottom of screen
                if(this.ball.touchedBottom) {
                    this.gameStats.playing = false;
                }
                
                if (this.gameStats.levelComplete){
                    this.createNewLevel();
                }
            } else {
                     
                ctx.drawImage(this.BG_IMG, this.bgX + canvas.width, this.bgY - canvas.height, canvas.width, canvas.height); // draw A3
                ctx.drawImage(this.BG_IMG, this.bgX + canvas.width, this.bgY, canvas.width, canvas.height);  //draw B3
                ctx.drawImage(this.BG_IMG, this.bgX, this.bgY, canvas.width, canvas.height); // draw B2 
                ctx.drawImage(this.BG_IMG, this.bgX, this.bgY - canvas.height, canvas.width, canvas.height); // draw A2
                ctx.drawImage(this.BG_IMG, this.bgX - canvas.width, this.bgY-canvas.height, canvas.width, canvas.height); // draw A1
                ctx.drawImage(this.BG_IMG, this.bgX - canvas.width, this.bgY, canvas.width, canvas.height); // draw B1
                this.gameStats.showStats(this.gameStats.lives, this.gameStats.LIFE_IMG, 40, 25);
                this.gameStats.showStats(this.gameStats.level, this.gameStats.LEVEL_IMG, canvas.width/2 + 12.5, 25 );
                this.gameStats.showStats(this.gameStats.score, this.gameStats.SCORE_IMG, canvas.width-40, 25 );
                ctx.font = "30px Orbitron";
                ctx.textAlign = "center";
                ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
                this.wall.drawWall();
            } 
        } 

        //ball is not in play
        if (this.gameStats.playing == false) {
            this.scrollBackground();
            this.moveBackground();
            this.gameStats.showStats(this.gameStats.lives, this.gameStats.LIFE_IMG, 40, 25);
            this.gameStats.showStats(this.gameStats.level, this.gameStats.LEVEL_IMG, canvas.width/2 + 12.5, 25 );
            this.gameStats.showStats(this.gameStats.score, this.gameStats.SCORE_IMG, canvas.width-40, 25 );
            ctx.font = "30px Orbitron";
            ctx.textAlign = "center";

            //all lives are lost
            if(this.gameStats.gameOver) {
                ctx.fillStyle = "white";
                ctx.fillText("game over", canvas.width/2, canvas.height/2-50);
                ctx.fillStyle = "white";
                ctx.fillText("click to play again", canvas.width/2, canvas.height/2);
                this.paddle.drawPaddle();

            //ball has touched bottom 
            } else if (this.gameStats.serving && !this.gameStats.newGame) {
                ctx.fillStyle = "white";
                ctx.fillText("click to serve", canvas.width/2, canvas.height/2);
                this.resetBall();
                this.ball.drawBall();
                this.paddle.drawPaddle();
                console.log("ball")
    
            //first load of game   
            } else if (this.gameStats.newGame) {
                 ctx.fillStyle = "white";
                 ctx.fillText("click to play", canvas.width/2, canvas.height/2);
                 this.resetBall();
                 //this.ball.drawBall();
                 this.paddle.movePaddle();
                 this.paddle.drawPaddle();
            }
            this.wall.drawWall();
        }
        this.paddle.getPaddleSpeed();
        
        //recursive call at the end of every frame
        requestAnimationFrame(this.gameLoop);
    }    
}
//*************************** Auxiliary functions ****************
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#0';
    for (var i = 0; i < 3; i++) {
      color += letters[Math.floor(Math.random() * 8)];
    }
    return color;
}
function getMousePos(e) {
    return {x:e.clientX,y:e.clientY};
}

//********************SET UP THE GAME ****************************
//setup the canvas and the context
document.body.style.backgroundColor = "#0f172e";
const canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

//create new game and start
const game = new Breakout();
game.startGame();

window.addEventListener('keydown', event => {
    if (event.keyCode == 80) {
        game.togglePause();
    } else if (event.keyCode == 77) {
        game.toggleMute();
    }
});

window.addEventListener('click', event => {

    game.handleClick();
});

