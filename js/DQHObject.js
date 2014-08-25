function DQHObject(path, stage, id, type) {
	this.currentTexture = PIXI.Texture.fromImage(path);
	this.sprite = new PIXI.Sprite(this.currentTexture);
	this.id = id;
	this.velocity = 1.1;
	this.life = 30;
	this.targetCooldown = 0;
	this.targetCooldownMax = 110;
	this.attackCooldown = 0;
	this.attackCooldownMax = 110;
	this.damageTint = 0xFF0000;
	this.damageAnimationTime = 30;
	this.damageAnimationTimer = 0;
	this.damageAnimationStep = -1;
	this.attackRotation = 0.35;
	this.attackRotationStep = 0;
	this.attackAnimationTimer = 0;
	this.attackAnimationId = -1;
	this.damageAnimationId = -1;
	this.scoreWorth = 0;
	this.bonus = 0;

	this.anchor(0.5, 0.5);

	if (type !== undefined) {
		this.clickableType = type;
	}
	this.aiTarget = id; // equals self by default

	this.create(stage);
}

DQHObject.prototype.damage = function(amt) {
	this.life -= amt;
	if (this.life <= 0) {
		messageQueue.push("kill " + this.getId());
	}
}

DQHObject.prototype.move = function(deltaX, deltaY) {
	this.sprite.position.x = this.sprite.position.x + deltaX;
	this.sprite.position.y = this.sprite.position.y + deltaY;
}

DQHObject.prototype.getVelocity = function() {
	return this.velocity;
}

DQHObject.prototype.setVelocity = function(speed) {
	this.velocity = speed;
}

DQHObject.prototype.addVelocity = function(speed) {
	this.velocity += speed;
}

DQHObject.prototype.anchor = function(x, y) {
	this.sprite.anchor.x = x;
	this.sprite.anchor.y = y;
}

DQHObject.prototype.position = function(x, y) {
	if (x !== undefined && y !== undefined) {
		this.sprite.position.x = x;
		this.sprite.position.y = y;
	}
}

DQHObject.prototype.getTarget = function() { 
	return this.aiTarget;
}

DQHObject.prototype.setTarget = function(id) {
	this.aiTarget = id;
}

DQHObject.prototype.getPosition = function() {
	return new Rect(this.sprite.position.x, this.sprite.position.y,
					this.sprite.width, this.sprite.height);
}

DQHObject.prototype.create = function(stage) {
	stage.addChild(this.sprite);
}

DQHObject.prototype.rotate = function(amt) {
	if (amt !== undefined) {
		this.sprite.rotation += amt;
	}
	return this.sprite.rotation;
}

DQHObject.prototype.tint = function(value) {
	this.sprite.tint = value;
}

DQHObject.prototype.getId = function() {
	return this.id;
}

DQHObject.prototype.setClickCallback = function(callbackFunc) {
	this.click = callbackFunc;
}

DQHObject.prototype.zombieCallback = function(mouseRect, item) {
	messageQueue.push("kill " + item.getId());
}

DQHObject.prototype.holyBookCallback = function(mouseRect, item) {
	messageQueue.push("kill " + item.getId());
}

DQHObject.prototype.animate = function(id) {
	var that = this;
	switch (id) {
		case "attack":
			if (this.attackAnimationId == -1) {
				// Set the step value
				this.attackRotationStep = this.attackRotation / (30 / 2);
				this.attackAnimationId = setInterval(function() { that.attackAnimation(that); }, 16);
			}
		break;
		case "damage":
			this.damageAnimationStep = 0xFFFFFF / this.damageTint;
			this.damageAnimationId = setInterval(function() { that.damageAnimation(that); }, 16);
		break;
	}
}

DQHObject.prototype.attackAnimation = function(item, plus) {
	if (plus === undefined) {
		plus = false;
	}
	item.attackAnimationTimer += 1;

	if (!plus) {
		if (item.rotate() >= item.attackRotation) {
			item.attackRotationStep = -item.attackRotationStep;
		}
		item.rotate(item.attackRotationStep);
	}
	else {
		if (item.rotate() <= item.attackRotation) {
			item.attackRotationStep = -item.attackRotationStep;
		}
		item.rotate(item.attackRotationStep);
	}
	if (item.attackAnimationTimer >= 30) {
		clearInterval(item.attackAnimationId);
		item.attackAnimationId = -1;
		item.attackAnimationTimer = 0;
	}
}

DQHObject.prototype.damageAnimation = function(item) {
	item.damageAnimationTimer += 1;

	item.damageTint += this.damageAnimationStep;
	item.tint(item.damageTint);

	if (item.damageAnimationTimer >= item.damageAnimationTime) {
		item.tint(0xFFFFFF);
		clearInterval(item.damageAnimationId);
		item.damageAnimationId = -1;
		item.damageTint = 0xFF0000;
		item.damageAnimationTimer = 0;
	}
}