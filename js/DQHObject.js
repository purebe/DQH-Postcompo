function DQHObject(path, stage, id, type) {
	this.currentTexture = PIXI.Texture.fromImage(path);
	this.sprite = new PIXI.Sprite(this.currentTexture);
	this.id = id;
	this.velocity = 1.1;
	if (type !== undefined) {
		this.clickableType = type;
	}
	this.aiTarget = id; // equals self by default

	this.create(stage);
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
	this.sprite.rotation += amt;
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
	var results = ($("#resourceView").html()).split(" ");
	var bookCount = parseInt(results[1]) + 1;
	$("#resourceView").html("Books: " + bookCount);;
}