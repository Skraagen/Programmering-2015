var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
  window.setTimeout(callback, 1000 / 60)
};

document.getElementById('pong').innerHTML += '<div id="endScreen"><div><h1>Well played! Your final score was <span id="score"></span></h1><a id="restart" onclick="restartGame();"><button>Restart</button></a></div></div>';

var canvas = document.createElement("canvas"),
    context = canvas.getContext("2d");

var finalScore;
var endScreen = true;

var options = {
  canvas: {
    width: 1000,
    height: 500
  },
  background: {
    redValue: 0,
    greenValue: 0,
    blueValue: 255,
    valueIncrement: 10
  },
  ball: {
    x: 0,
    y: 0,
    radius: 4,
    color: "white",
    speed: 8,
    speedIncrement: 2
  },
  paddle: {
    width: 15,
    height: 150,
    color: "rgba(0, 0, 0, 0.8)"
  },
  counter: {
    width: 100,
    height: 30,
    textWidth: 70
  }
}

//Definere objekter
var paddles = {
  paddle: new Paddle(0, options.paddle.width, options.paddle.height, options.paddle.color, false),
  computer: new Paddle(options.canvas.width - options.paddle.width, options.paddle.width, options.paddle.height, options.paddle.color, true)
}

var ball = new Ball(options.ball.radius, options.ball.color),
    counter = new Counter(options.counter.width, options.counter.height, options.counter.textWidth);

//Sette hÃƒÂ¸yden og bredden pÃƒÂ¥ canvas
canvas.width = options.canvas.width;
canvas.height = options.canvas.height;

options.ball.x = options.canvas.width / 2;
options.ball.y = options.canvas.height / 2;

function step(frameDelay) {
  //Oppdaterer frames
  endScreen ? prototype("update", ball, paddles.paddle, paddles.computer) : null;

  //Tegner spillet
  context.fillStyle = 'rgb(' + options.background.redValue + ',' + options.background.greenValue + ',' + options.background.blueValue + ')';
  context.fillRect(0, 0, options.canvas.width, options.canvas.height);
  endScreen ? prototype("render", ball, paddles.paddle, paddles.computer, counter) : null;

  canvas.style.marginLeft = window.innerWidth / 2 - canvas.width / 2 + "px";
  canvas.style.marginTop = window.innerHeight / 2 - canvas.height / 2 + "px";

  animate(step);
}

function openEndScreen() {
  document.getElementById('endScreen').style.display = "flex";

  finalScore ? document.getElementById('score').innerHTML = finalScore : document.getElementById('score').innerHTML = "0";

  endScreen = false;
}

function restartGame() {
  document.getElementById("endScreen").style.display = "none";
  prototype("reset", paddles.paddle, paddles.computer, ball, counter);

  options.background.redValue = 0;

  endScreen = true;
}

function mouseHandler() {
  document.onmousemove = handleMouseMove;
  function handleMouseMove(event) {
    paddles.paddle.y = event.clientY - paddles.paddle.height / 2 - parseInt(canvas.style.marginTop, 10);;
  }
}

function Paddle(x, width, height, color, computer) {
  this.x = x;
  this.y = options.canvas.height / 2 - options.paddle.height / 2;
  this.width = width;
  this.height = height;
  this.color = color;
  this.computer = computer;

  this.render = function() {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  this.update = function() {
    mouseHandler();

    computer ? this.y = ball.y - this.height / 2 : null;

    if (this.y >= options.canvas.height - this.height) {
      this.y = options.canvas.height - this.height;
    } else if (this.y <= 0) {
      this.y = 0;
    }
  }

  this.reset = function() {
    this.height = options.paddle.height;
  }
}

function Ball(radius, color) {
  this.radius = radius;
  this.color = color;
  this.x = options.canvas.width / 2;
  this.y = options.canvas.height / 2;

  var diameter = this.radius * 2;
  var xSpeed = options.ball.speed;
  var ySpeed = options.ball.speed + 1;

  this.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, diameter, 0,2 * Math.PI);
    context.fillStyle = this.color;
    context.fill();
  }

  this.update = function() {
    this.x += xSpeed;
    this.y += ySpeed;
    for (var prop in paddles) {
      if(paddles[prop].computer != true) {
        if (this.x < this.radius) {
          openEndScreen();
        }
        if (this.x > options.canvas.width - this.radius) {
          openEndScreen();
        }
        if (this.y < this.radius) {
          ySpeed = -ySpeed;
        }
        if (this.y > options.canvas.height - this.radius) {
          ySpeed = -ySpeed;
        }
        if (this.x - diameter < paddles[prop].width) {
          if (this.y < paddles[prop].y + paddles[prop].height + 10 && this.y > paddles[prop].y - 10) {
            paddles[prop].height > 50 ? paddles[prop].height -= 5 : null;

            counter.value += 1;
            options.background.redValue += options.background.valueIncrement;

            if (xSpeed < 16 && xSpeed > -16) {
              xSpeed = -xSpeed + options.ball.speedIncrement;
            } else {
              xSpeed = Math.floor((Math.random() * 16) + 6);;
            }
            finalScore = counter.value;

            console.log(xSpeed);
          }
        }
      } else {
        if (this.x + diameter > paddles[prop].x) {
          if (this.y < paddles[prop].y + paddles[prop].height + 10 && this.y > paddles[prop].y - 10) {
            xSpeed = -xSpeed;
          }
        }
      }
    }
  }

  this.reset = function() {
    this.x = options.ball.x;
    this.y = options.ball.y;
    xSpeed = options.ball.speed;
    ySpeed = options.ball.speed + 1;
  }
}

function Counter(width, height, textWidth) {
  this.value = 0;
  this.width = width;
  this.height = height;
  this.textWidth = textWidth;

  this.render = function() {
    context.clearRect(options.canvas.width / 2 - this.width / 2, 0, this.width, this.height);
    context.font = "bolder 20px Arial";
    context.fillStyle = "black";
    context.fillText("Score: " + this.value, options.canvas.width / 2 - this.textWidth / 2, 20, this.textWidth);
  }

  this.reset = function() {
    this.value = 0;
  }
}

function prototype(prototype) {
  for (var i = 1; i < arguments.length; i++) {
    switch (prototype) {
      case "render":
        arguments[i].render();
        break;
      case "update":
        arguments[i].update();
        break;
      case "reset":
        arguments[i].reset();
        break;
    }
  }
}

document.getElementById("pong").appendChild(canvas);

animate(step);
