var JiriValochMode = function(container, options) {
	
	options = options || {};
	options.top = options.top || 6;
	options.height = options.height || 16;
	options.marginTop = options.marginTop || 6;
	options.marginLeft = options.marginLeft || 5;
	options.width = options.width || 32;
	options.fontSize = options.fontSize || 22;

	var page = $('<div>', { id: "page"});
	page.css({
		"background-color": "red",
		"height": "100%",
		"width": "100%",
    });

	this.container = container;

	container.empty();
	container.append(page);

	this.updateOptions(options);

	this.currentLineCharactersInked = 0;
	this.currentLineBackspaceCount = 0;
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
}

JiriValochMode.prototype.getOptions = function() {
	return this.options;
}

JiriValochMode.prototype.onKeyHit = function(data) {

};
