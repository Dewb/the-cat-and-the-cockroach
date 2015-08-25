var BasicPaperMode = function(container, options) {
	
	options = options || {};
	options.lineLength = options.lineLength || 46;
	options.top = options.top || 6;
	options.height = options.height || 16;
	options.marginTop = options.marginTop || 6;
	options.marginLeft = options.marginLeft || 5;
	options.width = options.width || 32;
	options.fontSize = options.fontSize || 22;
	options.lineOffset = options.lineOffset || 12;

	var page = $('<div>', { id: "page"});
	page.css({
		"display": "block",
		"vertical-align": "bottom",
		"white-space": "pre",
    	"overflow": "hidden",
    });

    var currentLine = $('<div>', { id: "currentLine" });
    currentLine.css({
		"display": "block",
		"position": "absolute",
  		"overflow": "hidden",
  		"text-align": "right",
    });

	if (options.defaultText) {
		page.append(
			"expression is the need of my soul\n" + 
			"i was once a vers libre bard\n" + 
			"but i died and my soul went into the body of a cockroach\n" + 
			"it has given me a new outlook on life\n\n" + 
			"i see things from the under side now\n\n\n\n\n\n\n\n\n"
		);
	} else {
		page.append("\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
	}

	container.empty();
	container.append(page);
	container.append(currentLine);

	this.updateOptions(options);
};

BasicPaperMode.prototype.updateOptions = function(options) {
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
	var currentLine = $('#currentLine');
	currentLine.css({
		"top": (options.top + options.height) + "em",
		"height": (options.fontSize * 1.363) + "pt",
		"margin-left": 0,
		"left" : -options.lineOffset + "em",
		"width": options.width + "em",
		"font-size": options.fontSize + "pt",
	});
}

BasicPaperMode.prototype.getOptions = function() {
	return this.options;
}

BasicPaperMode.prototype.onKeyHit = function(data) {
	soundPlayer.playSound(0, 1, 0, 0.08, 0.15);

	if (data == '\n' || $('#currentLine').text().length > this.options.lineLength) {

    	if (data != '\n') {
        	soundPlayer.playSound(1, 1, 0, 0.03); // bell
        	$('#currentLine').append(data);
    	}

		$('#page').append($('#currentLine').text() + "\n");
		$('#page')[0].scrollTop = $('#page')[0].scrollHeight;
				
    	if ($('#currentLine').text().length > 6) {
      		soundPlayer.playSound(getRandomIndex(2, 6), 1, 0, 0.03, 0.12); // carriage pullback
    	}

    	$('#currentLine').empty();
	
	} else {
		
		$('#currentLine').append(data);
		$('#currentLine').scrollLeft(9999); //$('#page')[0].scrollWidth;
	
	}

};
