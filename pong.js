var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

//ball variables
var x = canvas.width/2;
var y = canvas.height-30;
var ballRadius = 10;
//the variables that will control ball movement (down is positive, up is negative)
var dx = 2;
var dy = -2

//paddle variables
var paddleHeight = 10;
var paddleWidth = 75;
var paddleX = (canvas.width - paddleWidth)/2;
//paddle control variables
var paddleDx = 7;
var rightPressed;
var leftPressed;

//event handlers
function keyDownHandler(event) {

    if(event.keyCode == 39) {
        rightPressed = true;
    } else if (event.keyCode == 37){
        leftPressed = true;
    }
}

function keyUpHandler(event) {

    if(event.keyCode == 39) {
        rightPressed = false;
    } else if (event.keyCode == 37) {
        leftPressed = false;
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);



//draw functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}



//set up the game loop
function draw() {
    //clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBall();
    drawPaddle();

    //make ball move
    x += dx;
    y += dy

    //detect collision with top wall
    if ((x + dx > canvas.width - ballRadius) || (x + dx < ballRadius)) {
        dx = -dx;
    }
        
    //detect collision with top wall
    if (y + dy < ballRadius) {
        //reverse direction in y-axis
        dy = -dy;
    }

    //detect collision with paddle

    if( y + dy > canvas.height - paddleHeight - ballRadius &&
        (x + dx > paddleX) &&
        (x + dx < paddleX + paddleWidth)
        ) {

        dy = -dy;
    }

    //paddle movement
    if (rightPressed && ((paddleX + paddleWidth) < canvas.width)) {
        paddleX += paddleDx;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= paddleDx
    }
    
    //will call recursively at the end of every frame
    requestAnimationFrame(draw);
}

//detect collision with side walls



//initial call to start the game loop
requestAnimationFrame(draw);