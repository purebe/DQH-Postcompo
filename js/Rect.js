function Rect(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

function Intersects(rect1, rect2) {
	var normalRect1 = new Rect(rect1.x - (rect1.w/2), rect1.y - (rect1.h/2), rect1.w, rect1.h);
	var normalRect2 = new Rect(rect2.x - (rect2.w/2), rect2.y - (rect2.h/2), rect2.w, rect2.h);

	if (normalRect1.x + normalRect1.w < normalRect2.x
		|| normalRect2.x + normalRect2.w < normalRect1.x
		|| normalRect1.y + normalRect1.h < normalRect2.y
		|| normalRect2.y + normalRect2.h < normalRect1.y) {
		return false;
	}
	return true;
}