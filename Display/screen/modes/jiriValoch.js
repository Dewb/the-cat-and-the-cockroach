function TextCanvasBuffered(text, font, size, rotation) {
	this.text = text;
	this.font = font;
	this.fontsize = size;
	this.rotation = rotation;
	this.canvas = document.createElement("canvas");
	this.context = this.canvas.getContext("2d");
	this.context.textAlign = "center";
	this.dirty = true;
}

TextCanvasBuffered.prototype.draw = function(context, text, font, x, y) {
	if (text != this.text) {
		this.text = text;
		this.dirty = true;
	}
	if (font != this.font) {
		this.font = font;
		this.dirty = true;
	}
	if (this.dirty) {
		var margin = 8;
		this.canvas.width = (this.fontsize * this.text.length) + margin;
		this.canvas.height = (this.fontsize * this.text.length) + margin;
		this.context.font = this.font;
		drawTextRotated(this.context, this.text, this.canvas.width/2, this.canvas.height/2, this.rotation);
		this.dirty = false;
		//this.context.fillStyle = "red";
		//this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
	}
	context.drawImage(this.canvas, x, y);
	//drawTextRotated(context, window.word, x, y, this.rotation);
}

var buffer = {};

function drawTextRotatedUsingBuffer(context, str, x, y, theta) {
	if (buffer[theta] == undefined) {
		buffer[theta] = new TextCanvasBuffered(str, context.font, 24, theta);
	}
	buffer[theta].draw(context, x, y);
}

function drawTextRotated(context, str, x, y, theta) {
	// estimate line height
	var lineHeight = 1.2 * context.measureText('m').width;

	context.save();
	context.translate(x, y);
	context.rotate(theta);
	context.textAlign = "center";
	context.fillStyle = "black";
	context.fillText(str, 0, lineHeight / 2);
	context.restore();
}

function clear(context) {
	context.save();
	context.setTransform(1, 0, 0, 1, 0, 0);
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);
	context.restore();
}

function draw(context, time, options) {
	clear(context);

	if (options.pattern == "spiral") {
		for (var ring = 0; ring < 30; ring++) {
			var radius = (ring * 10 + 20) * 0.6;
			var N = 2 + 4 * ring;
			var offset = (Math.PI / 12 + time/120000) * ring % (2 * Math.PI);
			for (var i = 0; i < N; i++) {
				var theta = offset + 2 * Math.PI * i / N;
				var x = radius * Math.sin(theta);
				var y = radius * Math.cos(theta);
				drawTextRotated(context, options.word, x, y, -Math.round(theta * 200) / 200);
			}
		}
	} else if (options.pattern == "wave") {
		var N = 2;
		var w = 30;
		var h = 30;
		var spacing = 25;
		var offset = Math.sin(time / 20000) * (Math.PI / 24);
		for (var layer = 0; layer < N; layer++) {
			var theta = offset * layer;
			var c = Math.cos(theta);
			var s = Math.sin(theta);
			var theta_rounded = Math.round(theta * 200) / 200;
			for (var i = -w/2; i < w/2; i++) {
				for (var j = -h/2; j < h/2; j++) {
					var x = i * spacing * c - j * spacing * s;
					var y = i * spacing * s + j * spacing * c;
					drawTextRotated(context, options.word, x, y, theta_rounded);
				}
			}
		}
	}

	window.requestAnimationFrame(function(time) {
		draw(context, time, window.options);
	});
}

var JiriValochMode = function(container, options) {
	
	options = options || {};
	options.top = options.top || 6;
	options.height = options.height || 16;
	options.marginTop = options.marginTop || 6;
	options.marginLeft = options.marginLeft || 5;
	options.width = options.width || 32;
	options.fontSize = options.fontSize || 22;
	options.word = options.word || "$";
	options.pattern = options.pattern || "spiral";

	var canvas = $('<canvas>', { id: 'theCanvas', width: window.innerWidth, height: window.innerHeight});

	this.container = container;

	container.empty();
	container.append(canvas);

	var context = canvas[0].getContext('2d');
	context.font = window.font;
	context.translate(canvas.width / 2.7, canvas.height / 2.7 + 18);
	
	this.updateOptions(options);

	window.requestAnimationFrame(function(time) {
		draw(context, time, window.options);
	});

};

JiriValochMode.prototype.updateOptions = function(options) {
	this.options = options;

	var page = $('#page');
	page.css({ 
		"top": options.top + "em",
		"height": options.height + "em",
		"margin-top": options.marginTop + "em",
		"margin-left": options.marginLeft + "em",
		"width": options.width + "em",
		"font-size": options.fontSize + "pt",
	});

	window.options = options;
}

JiriValochMode.prototype.getOptions = function() {
	return this.options;
}

JiriValochMode.prototype.onKeyHit = function(data) {
	var options = this.getOptions();
	if (data != "\n" && data != "«" && data != " ") {
		options.word = data;
		this.updateOptions(options);
	}
};
