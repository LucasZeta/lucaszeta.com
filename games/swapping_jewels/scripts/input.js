jewel.input = (function() {
	var dom = jewel.dom,
		$ = dom.$,
		settings = jewel.settings,
		inputHandlers;

	var keys = {
		37: 'KEY_LEFT',
		38: 'KEY_UP',
		39: 'KEY_RIGHT',
		40: 'KEY_DOWN',
		13: 'KEY_ENTER',
		32: 'KEY_SPACE'
		/*
		65: 'KEY_A',
		66: 'KEY_B',
		67: 'KEY_C',
		89: 'KEY_Y',
		90: 'KEY_Z',
		*/
	};

	for(i=65; i<=90; ++i) {
		keys[i] = 'KEY_'+String.fromCharCode(i);
	}

	function initialize() {
		inputHandlers = {};

		var board = $('#game-screen .game-board')[0];

		dom.bind(board, 'mousedown', function(event) {
			handleClick(event, 'CLICK', event);
		});

		dom.bind(board, 'touchstart', function(event) {
			handleClick(event, 'TOUCH', event.targetTouches[0]);
		});

		dom.bind(document, 'keydown', function(event) {
			var keyName = keys[event.keyCode];

			if(keyName && settings.controls[keyName]) {
				event.preventDefault();

				trigger(settings.controls[keyName]);
			}
		})
	}

	function bind(action, handler) {
		if(! inputHandlers[action])
			inputHandlers[action] = [];

		inputHandlers[action].push(handler);
	}

	function trigger(action) {
		var handlers = inputHandlers[action],
			args = Array.prototype.slice.call(arguments, 1);

		if(handlers) {
			for(var i=0; i<handlers.length; ++i) {
				handlers[i].apply(null, args);
			}
		}
	}

	function handleClick(event, control, click) {
		console.log('handleclick');

		var action = settings.controls[control];

		if(! action)
			return;

		var board = $('#game-screen .game-board')[0],
			rect = board.getBoundingClientRect(),
			relX, relY, 
			jewelX, jewelY;

		relX = click.clientX - rect.left;
		relY = click.clientY - rect.top;

		jewelX = Math.floor(relX / rect.width * settings.cols);
		jewelY = Math.floor(relY / rect.height * settings.rows);

		trigger(action, jewelX, jewelY);

		event.preventDefault();
	}

	return {
		initialize: initialize,
		bind: bind
	}
})();