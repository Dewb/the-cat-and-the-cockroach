var BasicPaperMode = function(container, options) {
	
	options = options || {};
	options.lineLength = options.lineLength || 56;
	options.top = options.top || 6;
	options.height = options.height || 17;
	options.marginTop = options.marginTop || 7;
	options.marginLeft = options.marginLeft || 5;
	options.width = options.width || 33;
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
  		"white-space": "pre",
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

	this.container = container;

	container.empty();
	container.append(page);
	container.append(currentLine);

	this.updateOptions(options);

	this.currentLineCharactersInked = 0;
	this.currentLineBackspaceCount = 0;
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
                "margin-top": "1em",
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

	if (data == '\n' || this.currentLineCharactersInked + 1 >= this.options.lineLength) {

		// If we hit the line limit, play the bell
    	if (data != '\n') {
        	soundPlayer.playSound(1, 1, 0, 0.03); // bell
        	$('#currentLine').append(data);
    	}

    	// Add the current line text to the page and scroll up
		$('#page').append($('#currentLine').html() + "\n");
		$('#page')[0].scrollTop = $('#page')[0].scrollHeight;

    	// Clear the line
    	$('#currentLine').empty();

    	// If the line was long enough, play the pullback sound	
    	if (this.currentLineCharactersInked > 6) {
      		soundPlayer.playSound(getRandomIndex(2, 6), 1, 0, 0.03, 0.12); // carriage pullback
    	}

    	this.currentLineCharactersInked = 0;
    	this.currentLineBackspaceCount = 0;

        $('#currentLine').css("left", -this.options.lineOffset + "em");

	} else if (data == "«") {
		
		if (this.currentLineBackspaceCount < this.currentLineCharactersInked) {
			$('#currentLine').css("left", "+=" + $(0.6).EmToPx());
			this.currentLineBackspaceCount++;
		}

	} else {

		if (this.currentLineBackspaceCount > 0) {
			var overType = $('<span>', { class: "overType" });
			overType.css({
				"position": "relative",
				"width": 0,
				"height": 0,
			});

			var overTypeInner = $('<span>');
			overTypeInner.css({
				"position": "absolute",
				"left": -0.6 * this.currentLineBackspaceCount + "em",
			});
			overTypeInner.append(data);
			overType.append(overTypeInner);

			$('#currentLine').append(overType);
			$('#currentLine').css("left", "-=" + $(0.6).EmToPx());

			this.currentLineBackspaceCount--;

		} else {
			$('#currentLine').append(data);
			this.currentLineCharactersInked++;
		}

		$('#currentLine').scrollLeft(9999); 

	}

};
