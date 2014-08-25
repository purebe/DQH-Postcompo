function DQH() {
	DQH.uid = 0;
	this.stage = new PIXI.Stage(0x000000, true);
	this.renderer = new PIXI.autoDetectRenderer(1011, 800);
	this.background = {};
	this.clickables = [];
	this.zombies = [];
	this.books = [];
	this.druids = [];
	this.fighters = [];
	this.sstIds = [];
	this.eds = null;

	this.prevMousedown = false;
	this.mousedown = false;
	this.clicking = false;

	this.spawnZone = new Rect(0, 0, 1011, 800);

	this.bookSpawnRate = 0.10;
	this.zombieSpawnRate = 0.25;
	msgQR.push("bookSpawn " + this.bookSpawnRate.toString());
	msgQR.push("zombieSpawn " + this.zombieSpawnRate.toString());

	this.bookYield = 5;
	msgQR.push("bookYield " + this.bookYield.toString());

	this.druidSpawnRate = 0;
	this.fighterSpawnRate = 0;
	this.druidSpeed = 0;
	this.fighterSpeed = 0;
	this.zomberSpeed = 0;

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

		this.eds = new this.eventDisplaySystem(this.stage, this.renderer);
		this.eds.setUp();

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
		this.background = this.createObject("/DQH/imgs/worlds_background.png");
		this.background.anchor(0, 0);
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

		msgQR.push("zombieCount " + this.zombies.length);
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
		// Roll the dice and see if we are spawning something this iteration
		if (Math.random() <= this.bookSpawnRate) {
			// Roll the dice for the position (the sprites are 64x64):
			var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x + 32;
			var randomY = Math.random() * (this.spawnZone.h - 96) + this.spawnZone.y + 64;

			randomX = Math.floor(randomX);
			randomY = Math.floor(randomY);

			var book = this.createHolyBook(randomX, randomY);
			this.clickables.push(book);
			this.books.push(book);
		}
		if (Math.random() <= this.zombieSpawnRate) {
			// Roll the dice for the position (the sprites are 64x64):
			var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x + 32;
			var randomY = Math.random() * (this.spawnZone.h - 96) + this.spawnZone.y + 64;

			randomX = Math.floor(randomX);
			randomY = Math.floor(randomY);

			var zombie = this.createZombie(randomX, randomY);
			this.clickables.push(zombie);
			this.zombies.push(zombie);
		}
		if (Math.random() <= this.druidSpawnRate) {
			// Roll the dice for the position (the sprites are 64x64):
			var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x + 32;
			var randomY = Math.random() * (this.spawnZone.h - 96) + this.spawnZone.y + 64;

			randomX = Math.floor(randomX);
			randomY = Math.floor(randomY);

			var druid = this.createDruid(randomX, randomY);
			this.clickables.push(druid);
			this.druids.push(druid);
		}
		if (Math.random() <= this.fighterSpawnRate) {
			// Roll the dice for the position (the sprites are 64x64):
			var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x + 32;
			var randomY = Math.random() * (this.spawnZone.h - 96) + this.spawnZone.y + 64;

			randomX = Math.floor(randomX);
			randomY = Math.floor(randomY);

			var fighter = this.createFighter(randomX, randomY);
			this.clickables.push(fighter);
			this.fighters.push(fighter);
		}

	}

	this.handlerSystem = function() {
		var mousePosition = this.stage.getMousePosition();
		var mouseRect = new Rect(mousePosition.x, mousePosition.y, 1, 1);

		// Preform mouse callbacks:
		for (var i = 0; i < this.clickables.length; ++i) {
			if (this.clickables[i].clickableType == DQHType.Zombie ||
				this.clickables[i].clickableType == DQHType.Book)
			if (Intersects(this.clickables[i].getPosition(), mouseRect)) {
				if (this.clickables[i].mouseover !== undefined) {
					this.clickables[i].mouseover(mouseRect, this.clickables[i]);
				}
				if (this.clickables[i].click !== undefined && this.clicking) {
					this.clickables[i].click(mouseRect, this.clickables[i]);
				}
			}
		}

		// Fighers acquire a target zombie
		for (var i = 0; i < this.fighters.length; ++i) {
			if (this.fighters[i].attackCooldown > 0) {
					this.fighters[i].attackCooldown += 1;
				}
			if (this.zombies.length > 0) {
				if (this.fighters[i].getTarget() == this.fighters[i].getId()) {
					// Randomly select a zombie target
					if (this.zombies.length != 0) {
						var zombieIndex = Math.floor(Math.random() * this.zombies.length);
						this.fighters[i].setTarget(this.zombies[zombieIndex].getId());
					}
				}
			}
			// Move them towards their target
			if (this.fighters[i].getTarget() != this.fighters[i].getId()) {
				var zombieIndex = -1;
				for (var j = 0; j < this.zombies.length; ++j) {
					if (this.zombies[j].getId() == this.fighters[i].getTarget()) {
						zombieIndex = j;
						break;
					}
				}
				if (zombieIndex < 0 || zombieIndex >= this.zombies.length) {
					break;
				}
				var targetPosition = this.zombies[zombieIndex].getPosition();
				var direction = Math.random();
				if (direction < 0.5) {
					if (targetPosition.x > this.fighters[i].getPosition().x) {
						this.fighters[i].move(this.fighters[i].getVelocity(), 0);
					}
					else {
						this.fighters[i].move(-this.fighters[i].getVelocity(), 0);
					}
				}
				else {
					if (targetPosition.y > this.fighters[i].getPosition().y) {
						this.fighters[i].move(0, this.fighters[i].getVelocity());
					}
					else{
						this.fighters[i].move(0, -this.fighters[i].getVelocity());
					}
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
					this.zombies[i].setTarget(this.books[bookIndex].getId());

				}
			}
			if (Math.random() < 0.1) {
				if (this.zombies[i].targetCooldown == 0) {
					this.zombies[i].setTarget(this.zombies[i].getId());
				}
				else if (this.zombies[i].targetCooldown >= this.zombies[i].targetCooldownMax) {
					this.zombies[i].targetCooldown = 0;
				}
			}
			this.zombies[i].targetCooldown += 1;
			if (this.zombies[i].attackCooldown > 0) {
				this.zombies[i].attackCooldown += 1;
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
			else {
				// Move in a random fashion towards the target
				var bookIndex = -1;
				for (var j = 0; j < this.books.length; ++j) {
					if (this.books[j].getId() == this.zombies[i].getTarget()) {
						bookIndex = j;
						break;
					}
				}
				// Determine if the zombie is in range for an attack
				if (Intersects(this.zombies[i].getPosition(),
							   this.books[bookIndex].getPosition())) {
					if (this.zombies[i].attackCooldown >= this.zombies[i].attackCooldownMax) {
						this.zombies[i].attackCooldown = 0;
					}
					if (this.zombies[i].attackCooldown == 0) {
						this.books[bookIndex].damage(10);
						this.zombies[i].animate("attack");
						this.books[bookIndex].animate("damage");
						this.zombies[i].attackCooldown += 1;
					}
					continue;
				}

				var targetPosition = this.books[bookIndex].getPosition();
				var direction = Math.random();
				if (direction < 0.5) {
					var randomX = Math.random() * this.zombies[i].getVelocity();
					if (targetPosition.x > this.zombies[i].getPosition().x) {
						this.zombies[i].move(randomX, 0);
					}
					else {
						this.zombies[i].move(-randomX, 0);
					}
				}
				else {
					var randomY = Math.random() * this.zombies[i].getVelocity();
					if (targetPosition.y > this.zombies[i].getPosition().y) {
						this.zombies[i].move(0, randomY);
					}
					else {
						this.zombies[i].move(0, -randomY);
					}
				}
			}
		}

		// Druid AI - tries to collect the nearest book:
		for (var i = 0; i < this.druids.length; ++i) {
			// Set the book target for the druid:
			if (this.druids[i].getTarget() == this.druids[i].getId()) {
				if (this.books.length > 0) {
					var bookIndex = Math.floor(Math.random() * this.books.length);
					this.druids[i].setTarget(this.books[bookIndex].getId());
				}
			}

			var bookIndex = -1;
			// Move the druid towards their target:
			for (var j = 0; j < this.books.length; ++j) {
				if (this.druids[i].getTarget() == this.books[j].getId()) {
					bookIndex = j;
				}

				if (Intersects(this.druids[i].getPosition(), this.books[j].getPosition())) {
					this.books[j].bonus = this.bookYield;
					messageQueue.push("kill " + this.books[j].getId());
				}
			}

			if (bookIndex >= 0) {
				if (this.druids[i].getTarget() != this.druids[i].getId()) {
					var targetPosition = this.books[bookIndex].getPosition();

					if (Intersects(this.druids[i].getPosition(), targetPosition)) {
						// Collect the book:
						messageQueue.push("kill " + this.books[bookIndex].getId());
					}

					var direction = Math.random();
					if (direction < 0.5) {
						if (targetPosition.x > this.druids[i].getPosition().x) {
							this.druids[i].move(this.druids[i].getVelocity(), 0);
						}
						else {
							this.druids[i].move(-this.druids[i].getVelocity(), 0);
						}
					}
					else {
						if (targetPosition.y > this.druids[i].getPosition().y) {
							this.druids[i].move(0, this.druids[i].getVelocity());
						}
						else{
							this.druids[i].move(0, -this.druids[i].getVelocity());
						}
					}
				}
			}
		}

		// Check if the zombies/fighters are in range of anything for an attack:
		loop1:
		for (var j = 0; j < this.zombies.length; ++j) {
			for (var i = 0; i < this.fighters.length; ++i) {
				if (Intersects(this.fighters[i].getPosition(), this.zombies[j].getPosition())) {
					// Try to fight each other:
					if (this.zombies[j].attackCooldown >= this.zombies[j].attackCooldownMax) {
						this.zombies[j].attackCooldown = 0;
					}
					if (this.zombies[j].attackCooldown == 0) {
						this.fighters[i].damage(10);
						if (this.fighters[i].life <= 0) {
							break loop1;
						}
						this.zombies[j].animate("attack");
						this.fighters[i].animate("damage");
						this.zombies[j].attackCooldown += 1;
					}

					if (this.fighters[i].attackCooldown >= this.fighters[i].attackCooldownMax) {
						this.fighters[i].attackCooldown = 0;
					}
					if (this.fighters[i].attackCooldown == 0) {
						this.zombies[j].damage(10);
						if (this.zombies[j].life <= 0) {
							this.zombies[j].bonus = this.bookYield;
							break loop1;
						}
						this.fighters[i].animate("attack");
						this.zombies[j].animate("damage");
						this.fighters[i].attackCooldown += 1;
					}
				}
			}
		}
		loop2:
		for (var j = 0; j < this.zombies.length; ++j) {
			for (var i = 0; i < this.druids.length; ++i) {
				var druidPosition = this.druids[i].getPosition();
				var zombiePosition = this.zombies[j].getPosition();
				if (Intersects(druidPosition, zombiePosition)) {
					// Try to kill the druid
					if (this.zombies[j].attackCooldown >= this.zombies[j].attackCooldownMax) {
						this.zombies[j].attackCooldown = 0;
					}
					if (this.zombies[j].attackCooldown == 0) {
						this.druids[i].damage(10);
						if (this.druids[i].life <= 0) {
							break loop2;
						}
						this.zombies[j].animate("attack");
						this.druids[i].animate("damage");
						this.zombies[j].attackCooldown += 1;
					}
				}
			}
		}
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
		var results = msg.split(" ");
		switch (results[0]) {
			case "kill":
				this.killObject(results[1]);
			break;
			case "bookSpawnRate":
				this.bookSpawnRate += parseFloat(results[1]);
				msgQR.push("bookSpawn " + this.bookSpawnRate.toString());
			break;
			case "bookYieldRate":
				this.bookYield *= parseFloat(results[1]);
				this.bookYield = Math.floor(this.bookYield);
				msgQR.push("bookYield " + this.bookYield.toString());
			break;
			case "druidSpawnRate":
				this.druidSpawnRate += parseFloat(results[1]);
				msgQR.push("druidSpawn " + this.druidSpawnRate.toString());
			break;
			case "fighterSpawnRate":
				this.fighterSpawnRate += parseFloat(results[1]);
				msgQR.push("fighterSpawn " + this.fighterSpawnRate.toString());
			break;
			case "druidSpeed":
				this.druidSpeed += parseInt(results[1]);
				msgQR.push("druidSpeed " + this.druidSpeed.toString());
				for (var i = 0; i < this.druids.length; ++i) {
					this.druids[i].addVelocity(this.druidSpeed);
				}
			break;
			case "fighterSpeed":
				this.fighterSpeed += parseInt(results[1]);
				msgQR.push("fighterSpeed " + this.fighterSpeed.toString());
				for (var i = 0; i < this.fighters.length; ++i) {
					this.fighters[i].addVelocity(this.fighterSpeed);
				}
			break;
			case "zombieSpeed":
				this.zombieSpeed += parseInt(results[1]);
				msgQR.push("zombieSpeed " + this.zombieSpeed.toString());
				for (var i = 0; i < this.zombies.length; ++i) {
					this.zombies[i].addVelocity(this.zombieSpeed);
				}
			break;
			case "spawnDruid":
				// Roll the dice for the position (the sprites are 64x64):
				var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x + 32;
				var randomY = Math.random() * (this.spawnZone.h - 96) + this.spawnZone.y + 64;

				randomX = Math.floor(randomX);
				randomY = Math.floor(randomY);

				var druid = this.createDruid(randomX, randomY);
				this.clickables.push(druid);
				this.druids.push(druid);
			break;
			case "spawnFighter":
				// Roll the dice for the position (the sprites are 64x64):
				var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x + 32;
				var randomY = Math.random() * (this.spawnZone.h - 96) + this.spawnZone.y + 64;

				randomX = Math.floor(randomX);
				randomY = Math.floor(randomY);

				var fighter = this.createFighter(randomX, randomY);
				this.clickables.push(fighter);
				this.fighters.push(fighter);
			break;
			case "spawnZombie":
				// Roll the dice for the position (the sprites are 64x64):
				var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x + 32;
				var randomY = Math.random() * (this.spawnZone.h - 96) + this.spawnZone.y + 64;

				randomX = Math.floor(randomX);
				randomY = Math.floor(randomY);

				var zombie = this.createZombie(randomX, randomY);
				this.clickables.push(zombie);
				this.zombies.push(zombie);
			break;
			case "spawnBook":
				// Roll the dice for the position (the sprites are 64x64):
				var randomX = Math.random() * (this.spawnZone.w - 64) + this.spawnZone.x + 32;
				var randomY = Math.random() * (this.spawnZone.h - 96) + this.spawnZone.y + 64;

				randomX = Math.floor(randomX);
				randomY = Math.floor(randomY);

				var book = this.createHolyBook(randomX, randomY);
				this.clickables.push(book);
				this.books.push(book);
			break;
			default:
				console.log("WARNING: Default message processed: " + msg);
		}
	}

	this.killObject = function(id) {
		var objType;
		for (var i = 0; i < this.clickables.length; ++i) {
			if (this.clickables[i].getId() == id) {
				objType = this.clickables[i].clickableType;
				this.clickables.splice(i, 1);
				break;
			}
		}
		switch (objType) {
			case DQHType.Zombie:
				// Reset any references fighters have to this id
				for (var i = 0; i < this.fighters.length; ++i) {
					if (this.fighters[i].getTarget() == id) {
						this.fighters[i].setTarget(this.fighters[i].getId());
					}
				}
				for (var i = 0; i < this.zombies.length; ++i) {
					if (this.zombies[i].getId() == id) {
						var sstPos = this.zombies[i].getPosition();
						sstPos.y -= (sstPos.h/2);
						sstPos.x -= (sstPos.w/2);
						if (this.zombies[i].bonus > 0){
							this.createSST("BONUS: +" + this.zombies[i].bonus.toString(), sstPos, "red");
							msgQR.push("addCash " + this.zombies[i].bonus.toString());
						}
						else {
							this.createSST("+5", sstPos, "red");
							msgQR.push("addCash 5");
						}
						msgQR.push("addKill 1");
						this.stage.removeChild(this.zombies[i].sprite);
						this.zombies.splice(i, 1);
						break;
					}
				}
				break;
			case DQHType.Book:
				// Reset any references zombies have to this id
				for (var i = 0; i < this.zombies.length; ++i) {
					if (this.zombies[i].getTarget() == id) {
						this.zombies[i].setTarget(this.zombies[i].getId());
					}
				}
				// Reset any references druids have to this id
				for (var i = 0; i < this.druids.length; ++i) {
					if (this.druids[i].getTarget() == id) {
						this.druids[i].setTarget(this.druids[i].getId());
					}
				}

				for (var i = 0; i < this.books.length; ++i) {
					if (this.books[i].getId() == id) {
						if (this.books[i].life > 0) {
							var sstPos = this.books[i].getPosition();
							sstPos.y -= (sstPos.h/2);
							sstPos.x -= (sstPos.w/2);
							msgQR.push("addBook 1");
							msgQR.push("addCash " + this.bookYield.toString());
							if (this.books[i].bonus > 0) {
								// Druids get bonus cash
								this.createSST("BONUS $" + (this.books[i].bonus + this.bookYield).toString(), sstPos,
									"white");
								msgQR.push("addCash " + this.books[i].bonus);
							}
							else {
								this.createSST("$" + this.bookYield.toString(), sstPos,
								"white");
							}
						}
						this.stage.removeChild(this.books[i].sprite);
						this.books.splice(i, 1);
						break;
					}
				}
				break;
			case DQHType.Druid:
				for (var i = 0; i < this.druids.length; ++i) {
					if (this.druids[i].getId() == id) {
						var sstPos = this.druids[i].getPosition();
							sstPos.y -= (sstPos.h/2);
							sstPos.x -= (sstPos.w/2);
							this.createSST(":(" + this.bookYield.toString(), sstPos,
								"green");
						this.stage.removeChild(this.druids[i].sprite);
						this.druids.splice(i, 1);
						break;
					}
				}
			break;
			case DQHType.Fighter:
				for (var i = 0; i < this.fighters.length; ++i) {
					if (this.fighters[i].getId() == id) {
						var sstPos = this.fighters[i].getPosition();
							sstPos.y -= (sstPos.h/2);
							sstPos.x -= (sstPos.w/2);
							this.createSST(":(" + this.bookYield.toString(), sstPos,
								"brown");
						this.stage.removeChild(this.fighters[i].sprite);
						this.fighters.splice(i, 1);
						break;
					}
				}
			break;
		}
	}

	this.createZombie = function(x, y) {
		var zombie = this.createObject("/DQH/imgs/zombie.png", DQHType.Zombie);
		zombie.position(x, y);
		zombie.setClickCallback(zombie.zombieCallback);
		zombie.life = 10;
		return zombie;
	}

	this.createHolyBook = function(x, y) {
		var holyBook = this.createObject("/DQH/imgs/book.png", DQHType.Book);
		holyBook.position(x, y);
		holyBook.setClickCallback(holyBook.holyBookCallback);
		holyBook.scoreWorth = 5;
		return holyBook;
	}

	this.createDruid = function(x, y) {
		var druid = this.createObject("/DQH/imgs/druid.png", DQHType.Druid);
		druid.position(x, y);
		druid.addVelocity(this.druidSpeed);
		return druid;
	}

	this.createFighter = function(x, y) {
		var fighter = this.createObject("/DQH/imgs/fighter.png", DQHType.Fighter);
		fighter.position(x, y);
		return fighter;
	}

	// Create scrolling status text
	this.createSST = function(text, position, color) {
		text = "        \n" + text;
		position.y -= 16;
		var txtObj = new PIXI.Text(text, {font:"14px Arial", fill:color, align:"center"});
		txtObj.position.x = position.x;
		txtObj.position.y = position.y;
		this.stage.addChild(txtObj);
		var sstId = this.getUID();
		var that = this;
		this.sstIds.push([setInterval(function() {
				that.sstCallback(txtObj, sstId);
			}, 16), sstId]);
	}

	this.sstCallback = function(item, id) {
		item.position.y -= 1;
		item.alpha = item.alpha - 0.02;
		if (item.alpha <= 0) {
			for (var i = 0; i < this.sstIds.length; ++i) {
				if (this.sstIds[i][1] == id) {
					clearInterval(this.sstIds[i][0]);
					this.stage.removeChild(item);
					this.sstIds.splice(i, 1);
				}
			}
		}
	}

	this.eventDisplaySystem = function(stage, renderer) {
		this.eventText = "Welcome player!  Click zombies to defeat them.  Click books to collect phat loot monies.  Spawn druids to collect bonus monies from books.  Spawn fighters to collect bonus cashz from zombies.";
		this.updateText = false;
		this.updateText1 = false;
		this.updateText2 = false;
		this.bounds = new Rect(0, 0, 1010, 32);
		this.pixiText1 = null;
		this.pixiText2 = null;

		this.scrollSpeed = 2;
		this.spacer = 400;
		this.stage = stage;
		this.renderer = renderer;

		this.eventCount = 0;
		this.eventMaxTicker = 900;
		this.eventTicker = 0;
		this.canEvent = false;

		this.setUp = function() {
			this.pixiText1 = new PIXI.Text(this.eventText, {font:"14px Arial", fill:"white"});
			this.pixiText1.position.x = 500;
			this.pixiText1.position.y = 4;
			this.stage.addChild(this.pixiText1);

			this.pixiText2 = new PIXI.Text(this.eventText, {font:"14px Arial", fill:"white"});
			this.pixiText2.position.x = this.pixiText1.position.x + this.pixiText1.width + this.spacer;
			this.pixiText2.position.y = 4;
			this.stage.addChild(this.pixiText2);


			var that = this;
			setInterval(function() { that.eventLogic(); }, 33);

			this.renderEventText();
		}

		this.renderEventText = function() {
			var that = this;
			requestAnimFrame(function() { that.renderEventText(); });

			this.renderer.render(this.stage);
		}

		this.eventLogic = function() {
			this.eventTicker += 1;
			if (this.eventTicker >= this.eventMaxTicker) {
				this.eventTicker = 0;
				this.canEvent = true;
			}
			this.handleEvent();

			this.pixiText1.position.x -= this.scrollSpeed;
			this.pixiText2.position.x -= this.scrollSpeed;

			// Make it jump:
			if (this.pixiText1.position.x + this.pixiText1.width <= 0) {
				if (this.pixiText2.position.x + this.pixiText2.width > this.stage.width) {
					this.pixiText1.position.x = this.pixiText2.position.x + this.pixiText2.width + this.spacer;
				}
				else {
					this.pixiText1.position.x = this.stage.width;
				}
			}
			if (this.pixiText2.position.x + this.pixiText2.width <= 0) {
				if (this.pixiText1.position.x + this.pixiText1.width > this.stage.width) {
					this.pixiText2.position.x = this.pixiText1.position.x + this.pixiText1.width + this.spacer;
				}
				else {
					this.pixiText2.position.x = this.stage.width;
				}
			}

			if (this.canEvent) {
				if (this.eventMaxTicker == 3600) {
					this.eventMaxTicker = 450;
				}
				this.canEvent = false;
				this.eventTicker = 0;
				if (Math.random() <= .85) {
					// There will be an event!
					this.eventCount += 1;
					var rng = Math.random();
					if (rng <= 0.75) {
						// Zombie horde event!
						this.eventText = "There have been sightings of zombies.  Zombies are everywhere!  Zombies are eating druids and fighters, run for your lives, something about lions and bears, oh my!";	
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
						spawnCount += (this.eventCount+1) * 5;
						spawnCount = Math.round(spawnCount);
						for (var i = 0; i < spawnCount; ++i) {
							messageQueue.push("spawnZombie");
						}
					}
					else if (rng <= 0.80) {
						// Major zombie attack event!
						this.eventText = "Reports indicate that the zombies are even stronger!  Also, there are a whole looooot of them on the way!  RUN FOR YOUR LIVES!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
						var spawnCount = 10 * (this.eventCount + 2);
						for (var i = 0; i < spawnCount; ++i) {
							messageQueue.push("spawnZombie");
						}
					}
					else if (rng <= 0.85) {
						// Spawn a group of druids
						this.eventText = "Druids mysteriously appear out of nowhere, town is shocked!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
						var spawnCount = this.eventCount;
						if (spawnCount > 5) {
							for (var i = 0; i < spawnCount; ++i) {
								messageQueue.push("spawnDruid");
							}
						}
					}
					else if (rng <= 0.90) {
						// Spawn a group of fighters
						this.eventText = "It's a guard!  No, it's a plane!  No, it's a warrior!  No, it's a warrior DOG!  No, it's a potato?  That Ludum Dare 28 reference is lost on the entire town!!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
						var spawnCount = this.eventCount;
						if (spawnCount > 5) {
							for (var i = 0; i < spawnCount; ++i) {
								messageQueue.push("spawnFighter");
							}
						}
					}
					else {
						this.eventText = "A tornado ripped through the local library!  Zombies rejoice, free food they say.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					
						var spawnCount = Math.floor(Math.random() * 100) + Math.floor((this.eventCount / 3));
						for (var i = 0; i < spawnCount; ++i) {
							messageQueue.push("spawnBook");
						}
					}
				}
				else {
					// give it some random flavor text for a non-event:
					var rng = Math.random();
					if (rng <= 0.05) {
						this.eventText = "The town seems to be completely normal today.  No one is complaining about anything except the weather, boy it sure is cold!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.10) {
						this.eventText = "These zombies are pests says Mayor Major Callyhoffenstein.  Townfolk agree, pitch fork for the zombies.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.15) {
						this.eventText = "Zombies need loving too, campaign started by young teenage girls who have been posting messages all day long on to zumblr!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.20) {
						this.eventText = "Zombies getting into trashcans in the middle of the night, making a rucus.  Scaring townfolk trying to sleep cowardly in their own locked bedrooms.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.25) {
						this.eventText = "Ambundance of dog feces on the sidewalks after fighters guild moves to town.  More on Unsolved Mysteries at 11'o clock!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.30) {
						this.eventText = "The townsfolk are pretty happy today, no body has been burned at the stake recently.  Boy it sure is hot though!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.35) {
						this.eventText = "This town is very dull, totally out of news.  There is no more news left in this town.  This town is not newsworthy.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.40) {
						this.eventText = "Curious case of zombie dogs spreading throughout abandoned buildings, more at 11' when we send Tom the reporter to check it out.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.45) {
						this.eventText = "Tom is dead.  Our news reporter Tom has passed away from several vicious lacerations to the legs and stomach regions.  No idea why!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.50) {
						this.eventText = "Tom is still dead.  We still don't know what to report on that issue.  Boy this town is dull.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.55) {
						this.eventText = "Running out of time to make more newsprompter things because of um timelimits and stuff not at all due to the ludum dare time limit though, nope..not at all..";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.60) {
						this.eventText = "Time machines invented!  In the year 2015, we will see the fisrt time machine invented.  Reporting newsworthy news to you early, more at 11'oclock.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.65) {
						this.eventText = "Landlords seen installing cameras on property to find out who keeps not cleaning up after their dogs.  The mess on the sidewalks is unacceptable, says Mayor Major Callyhoffenstein";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.70) {
						this.eventText = "Fred the editor for the newsline is actually a cat it turns out!  lolcat cheezeburger has plz?  I can't read this teleprompter!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.75) {
						this.eventText = "The 11'oclock news station has been overrun by hordes of zombies, we would have more at 11'oclock but you see...well...obviously.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.80) {
						this.eventText = "Zombies!  Cats!  Dogs!  It's all you can stand to watch in the local theatre, the world famous show 'Cats!  Dogs!  Also some Zombies!'  More at 11'oclock";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.85) {
						this.eventText = "Irish people in fact turn out to have souls, who knew?  Says Mayor Major Callyhoffenstein.  More at 11'oclock!";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.90) {
						this.eventText = "The ice bucket challenge has raised awareness for Loo Gerigs.  Lou Gerighs?  Gaaarrriiiiggsss?  I don't know.  ALS.  More at 11'oclock.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else if (rng <= 0.95) {
						this.eventText = "THIS ICE SURE IS COLD.  TOWN FOLK ARE HAPPY, SAYS Mayor Major Callyhoffenstein.  More at 11'oclock.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
					else {
						this.eventText = "We have run out of time for news, please do not leave your house tonight as there have been forecasts of zombies.";
						this.pixiText1.setText(this.eventText);
						this.pixiText2.setText(this.eventText);
					}
				}
			}
		}

		this.handleEvent = function() {
			// Handle the message queue
			var evt = eventQueue.pop();
			while (evt !== undefined) {
				this.parseEvent(evt);

				evt = eventQueue.pop();
			}
		}

		this.parseEvent = function(evt) {
			var results = evt.split(" ");
			switch (results[0]) {
				case "won":
					this.eventText = "Holy shit you have killed 10,000 zombies.  You are the man!  You win the game!  Thanks for playing!  Ludum Dare #30!  john_conder9 !  Wooo!  You won!  Wooo!  That is awesome!  By the way, there are still zombies spawning and stuff!  You can keep playing if you want!  That's cool.  Thanks for playing.  I don't really care though.  I wish you hadn't played actually.  You kind of suck.  Yeah.  Take that player.  Take it.  Gangster sounds.  And signs.  Boom.  Congrats!";
					this.pixiText1.setText(this.eventText);
					this.pixiText2.setText(this.eventText);
					this.eventMaxTicker = 3600;
				break;
				default:
					console.log("WARNING: Default event processed!  " + evt);
			}
		}
	}
}
