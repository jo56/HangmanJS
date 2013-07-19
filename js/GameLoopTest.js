
// Create the canvas
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

var numEnemies = 50;

var Game = { };
var Keys = {
	w: 87,
	a: 65,
	s: 83,
	d: 68,
	space: 32
}

Game.context = context;
Game.fps = 50;
Game.initialized = false;

var imageLoadedCount = 0;
var imageCount = 3;
function onImageLoad()
{
	imageLoadedCount += 1; 
}

//Images
var playerShipImage = new Image("js/images/ship.png");
	playerShipImage.src="js/images/ship.png"
	playerShipImage.onload = onImageLoad
var enemyImage = new Image();
	enemyImage.src="js/images/enemy.png"
	enemyImage.onload = onImageLoad
var bulletImage = new Image();
	bulletImage.src="js/images/bullet.png"
	bulletImage.onload = onImageLoad

//Screen Dimensions
var screenHeight = canvas.width;
var screenWidth = canvas.Height;

//Time variables
var deltaTime = 0.0;
var currentGameTime = time();
var lastGameTime = currentGameTime;  

//Time functions
function time()
{
    return (new Date).getTime();
}

function updateDeltaTime()
{
    currentGameTime = time();
    
    //log
    console.log("Current : " + currentGameTime + "\n Last: " + lastGameTime);
    console.log("  UpdateDelta: " + deltaTime);
    
    deltaTime = (currentGameTime - lastGameTime)/1000;
    lastGameTime = currentGameTime;
}


//Input - setup keyboard
var keysDown = {};

addEventListener("keydown", function (e) 
{
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) 
{
	delete keysDown[e.keyCode];
}, false);

// Game objects
function PlayerShip()
{
	this.speed = 256; // movement in pixels per second
	this.x = canvas.width/2;
	this.y = canvas.height - 100 ;
}

function Enemy()
{
	this.x = 50;
	this.y = 50;
	this.vx = 20;
	this.vy = 40;
}

function Bullet()
{
	this.x = 0;
	this.y = 0;
	this.vx = 0;
	this.vy = -250;
}


var playerShip = new PlayerShip();

var enemyList = [];
for(var i = 0; i < numEnemies; i++)
{
	var e = new Enemy();
	e.x = Math.random() * canvas.width;
	e.y = Math.random() * canvas.height-100;
	enemyList.push( e );
}

var bulletList = []


function collission(a, b)
{
	var b1 = a.Max.x > b.Min.x;
	var b2 = a.Min.x < b.Max.x;
	var b3 = a.Max.y > b.Min.y;
	var b4 = a.Min.y < b.Max.y;
	return b1 && b2 && b3 && b4;
}


function removeFromList(list, index)
{
	if(index!=-1) 
		list.splice(index, 1); // Remove it if really found!
}


Game.init = function()
{
	
	PlayerShip.prototype.width = playerShipImage.naturalWidth;
	PlayerShip.prototype.height = playerShipImage.naturalHeight;

	Enemy.prototype.width = enemyImage.naturalWidth;
	Enemy.prototype.height = enemyImage.naturalHeight;

	Bullet.prototype.width = bulletImage.naturalWidth;
	Bullet.prototype.height = bulletImage.naturalHeight;

	Game.initialized  = true;
	
}

Game.update = function() 
{ 
	//Check Player Input
    if (Keys.w in keysDown) { // Player holding up
		playerShip.y -= playerShip.speed * deltaTime;
	}
	if (Keys.s in keysDown) { // Player holding down
		playerShip.y += playerShip.speed * deltaTime;
	}
	if (Keys.a in keysDown) { // Player holding left
		playerShip.x -= playerShip.speed * deltaTime;
	}
	if (Keys.d in keysDown) { // Player holding right
		playerShip.x += playerShip.speed * deltaTime;
	}
	if (Keys.space in keysDown) { // Player press space
		var b = new Bullet();
		b.x = playerShip.x + (playerShip.width/2);
		b.y = playerShip.y;
		bulletList.push(b)
	}

	// Are they touching?
	for (var i = 0; i < enemyList.length; i++) 			//all enemies
	{
		for (var k = 0; k < bulletList.length; k++) 	//all bullets
		{
			var e = enemyList[i];
			var b = bulletList[k];

			var a = 
			{
				Min: {x:e.x, y: e.y}, 
			 	Max: {x:(e.x+e.width), y: (e.y+e.height)}
			};

			var bp = 
			{
				Min: {x:b.x, y: b.y}, 
			 	Max: {x:(b.x+b.width), y: (b.y+b.height)}
			};

			if(collission(a,bp))
			{
				removeFromList(bulletList, k);
				removeFromList(enemyList, i);
			}

		}
	}


	//update bullet positions
	for (var i = 0; i < bulletList.length; i++) 
	{
		var b = bulletList[i];
		b.x += b.vx * deltaTime;
		b.y += b.vy * deltaTime;

		if(b.y < 0)
			removeFromList(bulletList, k);
	}

	for (var i = 0; i < enemyList.length; i++) 
	{
		var e = enemyList[i];
		e.x += e.vx * deltaTime;
		e.y += e.vy * deltaTime;

		if(e.y < 0)
			removeFromList(enemyList, e);
	}
    
};

Game.draw = function(interpolation) 
{
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "rgb(0,0,0)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	//draw player
	context.drawImage(playerShipImage, playerShip.x, playerShip.y);

	//draw bullets
	for (var i = 0; i < bulletList.length; i++) 
	{
		var b = bulletList[i];
		context.drawImage(bulletImage, b.x, b.y);
	}

	//draw enemies
	for (var i = 0; i < enemyList.length; i++) 
	{
		var e = enemyList[i];
		context.drawImage(enemyImage, e.x, e.y);
	}
};

Game.run = (function() 
{
    //making several variables
    var loops = 0;
    var skipTicks = 1000 / Game.fps;    //how many milliseconds to wait before drawing          
    var nextGameTick = (new Date).getTime();
    
    return function() 
    {
        loops = 0;
        
        if(!Game.initialized)
        {
        	if(imageLoadedCount == imageCount)
			{
        		Game.init();
        	}
        	return;
        }

        while ((new Date).getTime() > nextGameTick) 
        {
            updateDeltaTime();
            Game.update();
            nextGameTick += skipTicks;
            loops++;
        }

        if (!loops) 
        {
            Game.draw((nextGameTick - (new Date).getTime()) / skipTicks);
        } 
        else 
        {
            Game.draw(0);
        }
    };
})();


function start()
{
    window.setInterval(Game.run, 0);
};

start();


/*
Notes:

Date.getTime() - number of milliseconds since unix epoch

*/