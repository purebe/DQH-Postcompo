function Rect(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

function Intersects(rect1, rect2) {
	if (rect1.x + rect1.w < rect2.x
		|| rect2.x + rect2.w < rect1.x
		|| rect1.y + rect1.h < rect2.y
		|| rect2.y + rect2.h < rect1.y) {
		return false;
	}
	return true;
}