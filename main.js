function DQH() {
	DQH.uid = 0;
	this.stage = new PIXI.Stage(0x000000, true);
	this.renderer = new PIXI.WebGLRenderer(1011, 800);
	this.background = {};
	this.clickables = [];
	this.zombies = [];
	this.books = [];

	this.prevMousedown = false;
	this.mousedown = false;
	this.clicking = false;

	this.spawnZone = new Rect(0, 0, 1011, 800);

	this.getUID = function() {
		return ++DQH.uid;
	}

	this.createObject = function(path, type) {
		if (type === undefined) {
			return new DQHObject(path, this.stage, this.getUID());
		}
		else {
			return new DQHObject(path, this.stage, this.getUID(), type);
		}
	}

	this.setUp = function() {
		$("#renderView").append(this.renderer.view);

		this.loadContent();

		this.renderScene();

		var that = this;
		setInterval(function() { that.logic(); }, 33);
		setInterval(function() { that.spawnSystem(); }, 500);

		this.stage.mousedown = function(data) {
			that.mousedown = true;
		}
		this.stage.mouseup = function(data) {
			that.mousedown = false;
		}
	}

	this.loadContent = function() {
		this.background = this.createObject("/imgs/worlds_background.png");
		this.background.position(0, 0);
	}

	this.renderScene = function() {
		var that = this;
		requestAnimFrame(function() { that.renderScene(); });

		this.renderer.render(this.stage);
	}

	this.logic = function() {
		this.clickSystem();

		this.handleMsg();

		this.handlerSystem();
	}

	this.clickSystem = function() {
		// Determine if we are clicking:
		if (this.prevMousedown && !this.mousedown) {
			this.clicking = true;
		}
		else if (this.prevMousedown && this.mousedown) {
			this.clicking = false;
		}
		else if (!this.prevMousedown && this.mousedown) {
			this.clicking = false;
		}
		else if (!this.prevMousedown && !this.mousedown) {
			this.clicking = false;
		}
		this.prevMousedown = this.mousedown;
	}

	this.spawnSystem = function() {
		// For now just spawn books and zombies randomly
		var spawnWeight = .25;
		var playerFavor = .5;

		// Roll the dice and see if we are spawning something this iteration
		if (Math.random() <= spawnWeight) {
			// Roll the dice for the position (the sprites are 64x64):
			var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x;
			var randomY = Math.random() * (this.spawnZone.h - 64) + this.spawnZone.y;

			randomX = Math.floor(randomX);
			randomY = Math.floor(randomY);

			// Roll the dice and determine whom we are spawning for
			if (Math.random() <= playerFavor) {
				var book = this.createHolyBook(randomX, randomY);
				this.clickables.push(book);
				this.books.push(book);
			}
			else {
				var zombie = this.createZombie(randomX, randomY);
				this.clickables.push(zombie);
				this.zombies.push(zombie);
			}
		}
	}

	this.handlerSystem = function() {
		var mousePosition = this.stage.getMousePosition();
		var mouseRect = new Rect(mousePosition.x, mousePosition.y, 1, 1);

		// Preform mouse callbacks:
		for (var i = 0; i < this.clickables.length; ++i) {
			if (Intersects(this.clickables[i].getPosition(), mouseRect)) {
				if (this.clickables[i].mouseover !== undefined) {
					this.clickables[i].mouseover(mouseRect, this.clickables[i]);
				}
				if (this.clickables[i].click !== undefined && this.clicking) {
					this.clickables[i].click(mouseRect, this.clickables[i]);
				}
			}
		}

		// Acquire zombie targets
		for (var i = 0; i < this.zombies.length; ++i) {
			if (this.zombies[i].getTarget() == this.zombies[i].getId()) {
				// Randomly select a book as a target
				if (this.books.length == 0) {
					this.zombies[i].setTarget(this.zombies[i].getId());
				}
				else {
					var bookIndex = Math.floor(Math.random() * this.books.length);
					this.zombies[i].setTarget(bookIndex);
				}
			}

			// Move zombies towards their target
			if (this.zombies[i].getTarget() == this.zombies[i].getId()) {
				// Move randomly a bit:
				var direction = Math.random();
				if (direction < 0.5) {
					var randomX = Math.random() * this.zombies[i].getVelocity() * 2;
					randomX -= this.zombies[i].getVelocity();
					this.zombies[i].move(randomX, 0);
				}
				else {
					var randomY = Math.random() * this.zombies[i].getVelocity() * 2;
					randomY -= this.zombies[i].getVelocity();
					this.zombies[i].move(0, randomY);
				}

			}
		}
	}

	this.removeClickable = function(id) {
		this.clickables.forEach(function(element, index, array) {
			if (element.getId() == id) {
				element.position(-1000, -1000);
				this.clickables.splice(index, 1);
			}
		});
	}

	this.handleMsg = function() {
		// Handle the message queue
		var msg = messageQueue.pop();
		while (msg !== undefined) {
			this.parseMessage(msg);

			msg = messageQueue.pop();
		}
	}

	this.parseMessage = function(msg) {
		console.log(msg);
		var results = msg.split(" ");
		switch (results[0]) {
			case "kill":
				this.killObject(results[1]);
			break;
			default:
				console.log("WARNING: Default message processed!");
		}
	}

	this.killObject = function(id) {
		var objType;
		for (var i = 0; i < this.clickables.length; ++i) {
			if (this.clickables[i].getId() == id) {
				objType = this.clickables[i].clickableType;
				this.clickables[i].position(-1000, -1000);
				this.clickables.splice(i, 1);
				break;
			}
		}
		switch (objType) {
			case DQHType.Zombie:
				for (var i = 0; i < this.zombies.length; ++i) {
					if (this.zombies[i].getId() == id) {
						this.zombies.splice(i, 1);
						break;
					}
				}
				break;
			case DQHType.Book:
				// Reset any references zombies have to this id
				for (var i = 0; i < this.zombies.length; ++i) {
					if (this.zombies[i].getTarget() == id) {
						console.log("resetting zombie target reference..");
						this.zombies[i].setTarget(this.zombies[i].getId());
					}
				}

				for (var i = 0; i < this.books.length; ++i) {
					if (this.books[i].getId() == id) {
						this.books.splice(i, 1);
						break;
					}
				}
				break;
		}
	}

	this.createZombie = function(x, y) {
		var zombie = this.createObject("/imgs/zombie.png", DQHType.Zombie);
		zombie.position(x, y);
		zombie.setClickCallback(zombie.zombieCallback);
		return zombie;
	}

	this.createHolyBook = function(x, y) {
		var holyBook = this.createObject("/imgs/book.png", DQHType.Book);
		holyBook.position(x, y);
		holyBook.setClickCallback(holyBook.holyBookCallback);
		return holyBook;
	}
}