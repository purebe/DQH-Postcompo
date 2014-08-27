function DQHResearhView() {
	//this.stage = new PIXI.Stage(0x000000, true);
	this.renderer = new PIXI.autoDetectRenderer(500, 800);
	this.background = null;
	this.clickables = [];

	this.slider = null;

	// Text
	this.score = 0;
	this.scoreText = null;
	this.kills = 0;
	this.killsText = null;
	this.books = 0;
	this.booksText = null;
	this.bookSpawnRateText = null;
	this.bookYieldText = null;
	this.druidSpawnRate = 0;
	this.druidSpawnRateText = null;
	this.fighterSpawnRate = 0;
	this.fighterSpawnRateText = null;
	this.druidSpeedText = null;
	this.fighterSpeedText = null;

	// Statistics
	this.bookSpawnRate = 0;
	this.zombieSpawnRate = 0;
	this.bookYield = 0;
	this.druidSpawnRate = 0;
	this.druidSpeed = 0;
	this.fighterSpeed = 0;

	this.zombieCount = 0;

	// Research upgrades
	this.bookSpawnRateCost = 25;
	this.bookSpawnLevel = 1;
	this.bookYieldRateCost = 50;
	this.bookYieldLevel = 1;
	this.druidSpawnRateCost = 250;
	this.druidSpawnLevel = 1;
	this.fighterSpawnRateCost = 500;
	this.fighterSpawnLevel = 1;
	this.druidSpeedCost = 2500;
	this.druidSpeedLevel = 1;
	this.fighterSpeedCost = 3500;
	this.figherSpeedLevel = 1;

	// Buttons
	this.treeButton = null;
	this.treeText = null;
	this.typingButton = null;
	this.typingText = null;
	this.druidButton = null;
	this.druidText = null;
	this.fighterButton = null;
	this.fighterText = null;
	this.druidSpeedButton = null;
	this.druidSpeedButtonText = null;
	this.fighterSpeedButton = null;
	this.fighterSpeedButtonText = null;

	this.maxZombiesKilled = 5000;
	this.sliderStep = 447 / this.maxZombiesKilled;

	// Highlights
	this.white = null;

	this.setUp = function() {
		$("#researchView").append(this.renderer.view);

		this.loadContent();

		this.renderScene();
	}

	this.loadContent = function() {
		var that = this;

		var currentTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/researchView.png");
		this.background = new PIXI.Sprite(currentTexture);
		this.background.position.x = 0;
		this.background.position.y = 0;
		this.stage.addChild(this.background);

		var whiteTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/white.png");
		this.white = new PIXI.Sprite(whiteTexture);
		this.white.position.x = -100;
		this.white.position.y = -100;
		this.white.alpha = 0.5;

		var sliderTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/slider.png");
		this.slider = new PIXI.Sprite(sliderTexture);
		this.slider.position.x = 20;
		this.slider.position.y = 719;
		this.stage.addChild(this.slider);

		var treeTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/tree_research.png");
		this.treeButton = new PIXI.Sprite(treeTexture);
		this.treeButton.position.x = 42;
		this.treeButton.position.y = 330;
		this.stage.addChild(this.treeButton);
		this.treeButton.setInteractive(true);

		this.treeText = new PIXI.Text("$" + this.bookSpawnRateCost.toString() + "\n(+Book Spawn Rate)", {font:"12px Arial", fill:"white", align:"center"});
		this.treeText.position.x = this.treeButton.position.x - 28;
		this.treeText.position.y = this.treeButton.position.y + 64;
		this.stage.addChild(this.treeText);
		this.treeButton.click = function(data) {
			if (that.bookSpawnRateCost <= that.score) {
				that.bookSpawnLevel += 1;
				that.score -= that.bookSpawnRateCost;
				that.updateScoreText();
				switch (that.bookSpawnLevel) {
					case 1:
					case 2:
						that.bookSpawnRateCost *= 2;
					break;
					case 3:
					case 4:
					case 5:
						that.bookSpawnRateCost *= 2.1;
					break;
					case 6:
						that.bookSpawnRateCost *= 2.2;
					break;
					default:
						that.bookSpawnRateCost *= 2.3;
					break;
				}
				that.bookSpawnRateCost = Math.floor(that.bookSpawnRateCost);
				that.treeText.setText("$" + that.bookSpawnRateCost.toString() + "\n(+Book Spawn Rate)");
				messageQueue.push("bookSpawnRate 0.01");
			}
			
		}
		this.treeButton.mouseover = function(data) {
			that.white.position.x = that.treeButton.position.x;
			that.white.position.y = that.treeButton.position.y;
		}
		this.treeButton.mouseout = function(data) {
			that.white.position.x = -100;
			that.white.position.y = -100;
		}

		var typingTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/typing_research.png");
		this.typingButton = new PIXI.Sprite(typingTexture);
		this.typingButton.position.x = 188;
		this.typingButton.position.y = 330;
		this.stage.addChild(this.typingButton);
		this.typingButton.setInteractive(true);

		this.typingText = new PIXI.Text("$" + this.bookYieldRateCost.toString() + "\n(+Book Yield Rate)", {font:"12px Arial", fill:"white", align:"center"});
		this.typingText.position.x = this.typingButton.position.x - 28;
		this.typingText.position.y = this.typingButton.position.y + 64;
		this.stage.addChild(this.typingText);
		this.typingButton.click = function(data) {
			if (that.bookYieldRateCost <= that.score) {
				that.bookYieldLevel += 1;
				that.score -= that.bookYieldRateCost;
				that.updateScoreText();
				switch (that.bookYieldLevel) {
					case 1:
						that.bookYieldRateCost *= 2.0;
					case 2:
						that.bookYieldRateCost *= 2.0;
					break;
					case 3:
						that.bookYieldRateCost *= 2.0;
					break;
					case 4:
						that.bookYieldRateCost *= 2.1;
					break;
					case 5:
						that.bookYieldRateCost *= 2.2;
					break;
					case 6:
						that.bookYieldRateCost *= 2.3;
					break;
					default:
						that.bookYieldRateCost *= 2.4;
					break;
				}
				that.bookYieldRateCost = Math.floor(that.bookYieldRateCost);
				that.typingText.setText("$" + that.bookYieldRateCost.toString() + "\n(+Book Yield Rate)");
				messageQueue.push("bookYieldRate 2.0");
			}
		}
		this.typingButton.mouseover = function(data) {
			that.white.position.x = that.typingButton.position.x;
			that.white.position.y = that.typingButton.position.y;
		}
		that.typingButton.mouseout = function(data) {
			that.white.position.x = -100;
			that.white.position.y = -100;
		}

		var druidTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/druid_button.png");
		this.druidButton = new PIXI.Sprite(druidTexture);
		this.druidButton.position.x = 42;
		this.druidButton.position.y = 435;
		this.stage.addChild(this.druidButton);
		this.druidButton.setInteractive(true);

		this.druidText = new PIXI.Text("$" + this.druidSpawnRateCost.toString() + "\n(+Druid Spawn Rate)", {font:"12px Arial", fill:"white", align:"center"});
		this.druidText.position.x = this.druidButton.position.x - 28;
		this.druidText.position.y = this.druidButton.position.y + 64;
		this.stage.addChild(this.druidText);
		this.druidButton.click = function(data) {
			if (that.druidSpawnRateCost <= that.score) {
				that.druidSpawnLevel += 1;
				that.score -= that.druidSpawnRateCost;
				that.updateScoreText();
				messageQueue.push("spawnDruid " + that.druidSpawnLevel);
				switch (that.druidSpawnLevel) {
					case 1:
						that.druidSpawnRateCost *= 2.5;
					case 2:
						that.druidSpawnRateCost *= 3.0;
					break;
					case 3:
						that.druidSpawnRateCost *= 2.0;
					break;
					case 4:
						that.druidSpawnRateCost *= 2.0;
					break;
					case 5:
						that.druidSpawnRateCost *= 2.0;
					break;
					case 6:
						that.druidSpawnRateCost *= 2.0;
					break;
					default:
						that.druidSpawnRateCost *= 2.2;
					break;
				}
				that.druidSpawnRateCost = Math.floor(that.druidSpawnRateCost);
				that.druidText.setText("$" + that.druidSpawnRateCost.toString() + "\n(+Druid Spawn Rate)");
				messageQueue.push("druidSpawnRate 0.01");
			}
		}
		this.druidButton.mouseover = function(data) {
			that.white.position.x = that.druidButton.position.x;
			that.white.position.y = that.druidButton.position.y;
		}
		that.druidButton.mouseout = function(data) {
			that.white.position.x = -100;
			that.white.position.y = -100;
		}

		var fighterTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/fighter_button.png");
		this.fighterButton = new PIXI.Sprite(fighterTexture);
		this.fighterButton.position.x = 42;
		this.fighterButton.position.y = 545;
		this.stage.addChild(this.fighterButton);
		this.fighterButton.setInteractive(true);

		this.fighterText = new PIXI.Text("$" + this.fighterSpawnRateCost.toString() + "\n(+Fighter Spawn Rate)", {font:"12px Arial", fill:"white", align:"center"});
		this.fighterText.position.x = this.fighterButton.position.x - 28;
		this.fighterText.position.y = this.fighterButton.position.y + 64;
		this.stage.addChild(this.fighterText);
		this.fighterButton.click = function(data) {
			if (that.fighterSpawnRateCost <= that.score) {
				that.fighterSpawnLevel += 1;
				that.score -= that.fighterSpawnRateCost;
				that.updateScoreText();
				messageQueue.push("spawnFighter " + that.fighterSpawnLevel);
				switch (that.fighterSpawnLevel) {
					case 1:
						that.fighterSpawnRateCost *= 1.5;
					case 2:
						that.fighterSpawnRateCost *= 1.6;
					break;
					case 3:
						that.fighterSpawnRateCost *= 1.7;
					break;
					case 4:
						that.fighterSpawnRateCost *= 1.8;
					break;
					case 5:
						that.fighterSpawnRateCost *= 1.9;
					break;
					case 6:
						that.fighterSpawnRateCost *= 2.0;
					break;
					default:
						that.fighterSpawnRateCost *= 2.1;
					break;
				}
				that.fighterSpawnRateCost = Math.floor(that.fighterSpawnRateCost);
				that.fighterText.setText("$" + that.fighterSpawnRateCost.toString() + "\n(+Fighter Spawn Rate)");
				messageQueue.push("fighterSpawnRate 0.01");
			}
		}
		this.fighterButton.mouseover = function(data) {
			that.white.position.x = that.fighterButton.position.x;
			that.white.position.y = that.fighterButton.position.y;
		}
		that.fighterButton.mouseout = function(data) {
			that.white.position.x = -100;
			that.white.position.y = -100;
		}

		var druidSpeedTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/speed_druid_button.png");
		this.druidSpeedButton = new PIXI.Sprite(druidSpeedTexture);
		this.druidSpeedButton.position.x = 188;
		this.druidSpeedButton.position.y = 435;
		this.stage.addChild(this.druidSpeedButton);
		this.druidSpeedButton.setInteractive(true);

		this.druidSpeedButtonText = new PIXI.Text("$" + this.druidSpeedCost.toString() + "\n(+Druid Move Speed)", {font:"12px Arial", fill:"white", align:"center"});
		this.druidSpeedButtonText.position.x = this.druidSpeedButton.position.x - 28;
		this.druidSpeedButtonText.position.y = this.druidSpeedButton.position.y + 64;
		this.stage.addChild(this.druidSpeedButtonText);
		this.druidSpeedButton.click = function(data) {
			console.log("wtf");
			if (that.druidSpeedCost <= that.score) {
				that.druidSpeedLevel += 1;
				that.score -= that.druidSpeedCost;
				that.updateScoreText();
				switch (that.druidSpeedLevel) {
					case 1:
						that.druidSpeedCost *= 2.0;
					break;
					case 2:
						that.druidSpeedCost *= 3.0;
					break;
					case 3:
						that.druidSpeedCost *= 4.0;
					break;
					case 4:
						that.druidSpeedCost *= 5.0;
					break;
					case 5:
						that.druidSpeedCost *= 6.0;
					break;
					case 6:
						that.druidSpeedCost *= 7.0;
					break;
					default:
						that.druidSpeedCost *= 8.0;
					break;
				}
				that.druidSpeedCost = Math.floor(that.druidSpeedCost);
				that.druidSpeedButtonText.setText("$" + that.druidSpeedCost.toString() + "\n(+Druid Move Speed)");
				messageQueue.push("druidSpeed 1");
			}
		}
		this.druidSpeedButton.mouseover = function(data) {
			that.white.position.x = that.druidSpeedButton.position.x;
			that.white.position.y = that.druidSpeedButton.position.y;
		}
		that.druidSpeedButton.mouseout = function(data) {
			that.white.position.x = -100;
			that.white.position.y = -100;
		}

		var fighterSpeedTexture = PIXI.Texture.fromImage("/DQH-Postcompo/imgs/fighterSpeedButton.png");
		this.fighterSpeedButton = new PIXI.Sprite(fighterSpeedTexture);
		this.fighterSpeedButton.position.x = 188;
		this.fighterSpeedButton.position.y = 545;
		this.stage.addChild(this.fighterSpeedButton);
		this.fighterSpeedButton.setInteractive(true);

		this.fighterSpeedButtonText = new PIXI.Text("$" + this.fighterSpeedCost.toString() + "\n(+Fighter Move Speed)", {font:"12px Arial", fill:"white", align:"center"});
		this.fighterSpeedButtonText.position.x = this.fighterSpeedButton.position.x - 28;
		this.fighterSpeedButtonText.position.y = this.fighterSpeedButton.position.y + 64;
		this.stage.addChild(this.fighterSpeedButtonText);
		this.fighterSpeedButton.click = function(data) {
			if (that.fighterSpeedCost <= that.score) {
				that.fighterSpeedLevel += 1;
				that.score -= that.fighterSpeedCost;
				that.updateScoreText();
				switch (that.fighterSpeedLevel) {
					case 1:
						that.fighterSpeedCost *= 2.0;
					break;
					case 2:
						that.fighterSpeedCost *= 3.0;
					break;
					case 3:
						that.fighterSpeedCost *= 4.0;
					break;
					case 4:
						that.fighterSpeedCost *= 5.0;
					break;
					case 5:
						that.fighterSpeedCost *= 6.0;
					break;
					case 6:
						that.fighterSpeedCost *= 7.0;
					break;
					default:
						that.fighterSpeedCost *= 8.0;
					break;
				}
				that.fighterSpeedCost = Math.floor(that.fighterSpeedCost);
				that.fighterSpeedButtonText.setText("$" + that.fighterSpeedCost.toString() + "\n(+Fighter Move Speed)");
				messageQueue.push("fighterSpeed 1");
			}
		}
		this.fighterSpeedButton.mouseover = function(data) {
			that.white.position.x = that.fighterSpeedButton.position.x;
			that.white.position.y = that.fighterSpeedButton.position.y;
		}
		that.fighterSpeedButton.mouseout = function(data) {
			that.white.position.x = -100;
			that.white.position.y = -100;
		}

		this.scoreText = new PIXI.Text(this.score.toString(), {font:"25px Arial", fill:"white"});
		this.scoreText.position.x = 285;
		this.scoreText.position.y = 37;
		this.stage.addChild(this.scoreText);

		this.killsText = new PIXI.Text("Kills: " + this.kills.toString(), {font:"25px Arial", fill:"white", align:"right"});
		this.killsText.position.x = 50;
		this.killsText.position.y = 119;
		this.stage.addChild(this.killsText);

		this.booksText = new PIXI.Text("Books: " + this.books.toString(), {font:"25px Arial", fill:"white", align:"right"});
		this.booksText.position.x = 50;
		this.booksText.position.y = 139;
		this.stage.addChild(this.booksText);

		this.bookSpawnRateText = new PIXI.Text("Book Spawn Rate: " + Math.floor(this.bookSpawnRate * 100).toString() + "%", {font:"20px Arial", fill:"white"});
		this.bookSpawnRateText.position.x = 50;
		this.bookSpawnRateText.position.y = 163;
		this.stage.addChild(this.bookSpawnRateText);

		this.bookYieldText = new PIXI.Text("Book Yield: $" + this.bookYield.toString(), {font:"20px Arial", fill:"white"});
		this.bookYieldText.position.x = 50;
		this.bookYieldText.position.y = 186;
		this.stage.addChild(this.bookYieldText);

		this.druidSpawnRateText = new PIXI.Text("Druid Spawn Rate: " + Math.floor(this.druidSpawnRate * 100).toString() + "%", {font:"20px Arial", fill:"white"});
		this.druidSpawnRateText.position.x = 50;
		this.druidSpawnRateText.position.y = 207;
		this.stage.addChild(this.druidSpawnRateText);

		this.fighterSpawnRateText = new PIXI.Text("Fighter Spawn Rate: " + Math.floor(this.fighterSpawnRate * 100).toString() + "%", {font:"20px Arial", fill:"white"});
		this.fighterSpawnRateText.position.x = 50;
		this.fighterSpawnRateText.position.y = 228;
		this.stage.addChild(this.fighterSpawnRateText);

		this.druidSpeedText = new PIXI.Text("Druid Move Speed: " + this.druidSpeed.toString(), {font:"20px Arial", fill:"white"});
		this.druidSpeedText.position.x = 50;
		this.druidSpeedText.position.y = 249;
		this.stage.addChild(this.druidSpeedText);

		this.fighterSpeedText = new PIXI.Text("Fighter Move Speed: " + this.fighterSpeed.toString(), {font:"20px Arial", fill:"white"});
		this.fighterSpeedText.position.x = 50;
		this.fighterSpeedText.position.y = 270;
		this.stage.addChild(this.fighterSpeedText);

		this.stage.addChild(this.white);
	}

	this.renderScene = function() {
		var that = this;
		requestAnimFrame(function() { that.renderScene(); });

		this.handleMsg();
		
		this.renderer.render(this.stage);
	}

	this.handleMsg = function() {
		// Handle the message queue
		var msg = msgQR.pop();
		while (msg !== undefined) {
			this.parseMessage(msg);

			msg = msgQR.pop();
		}
	}

	this.parseMessage = function(msg) {
		var results = msg.split(" ");
		switch (results[0]) {
			case "addCash":
				this.score += parseInt(results[1]);
				this.updateScoreText();
			break;
			case "addKill":
				this.kills += parseInt(results[1]);
				this.updateKillsText();
				this.slider.position.x += this.sliderStep;

				if (this.kills >= 10000) {
					eventQueue.push("won");
				}
			break;
			case "addBook":
				this.books += parseInt(results[1]);
				this.booksText.setText("Books: " + this.books.toString());
			break;
			case "zombieSpawn":
				this.zombieSpawnRate = parseFloat(results[1]);
			break;
			case "bookSpawn":
				this.bookSpawnRate = parseFloat(results[1]);
				this.bookSpawnRateText.setText("Book Spawn Rate: " + Math.floor(this.bookSpawnRate * 100).toString() + "%");
			break;
			case "bookYield":
				this.bookYield = parseInt(results[1]);
				this.bookYieldText.setText("Book Yield: $" + this.bookYield.toString());
			break;
			case "druidSpawn":
				this.druidSpawnRate = parseFloat(results[1]);
				this.druidSpawnRateText.setText("Druid Spawn Rate: " + Math.floor(this.druidSpawnRate * 100).toString() + "%");
			break;
			case "fighterSpawn":
				this.fighterSpawnRate = parseFloat(results[1]);
				this.fighterSpawnRateText.setText("Fighter Spawn Rate: " + Math.floor(this.fighterSpawnRate * 100).toString() + "%");
			break;
			case "druidSpeed":
				this.druidSpeed = parseInt(results[1]);
				this.druidSpeedText.setText("Druid Move Speed: " + this.druidSpeed.toString());
			break;
			case "fighterSpeed":
				this.fighterSpeed = parseInt(results[1]);
				this.fighterSpeedText.setText("Fighter Move Speed: " + this.fighterSpeed.toString());
			break;
			case "zombieCount":
				this.zombieCount = parseInt(results[1]);
			break;
			default:
				console.log("WARNING: Default message processed: " + msg);
		}
	}

	this.addScore = function(amt) {
		this.score += amt;
	}

	this.removeScore = function(amt) {
		if (this.score - amt > 0 ) {
			this.score -= amt;
		}
	}

	this.updateScoreText = function() {
		this.scoreText.setText(this.score.toString());
	}

	this.addKill = function(amt) {
		this.kills += amt;
	}

	this.updateKillsText = function() {
		this.killsText.setText("Kills: " + this.kills.toString());
	}
}
