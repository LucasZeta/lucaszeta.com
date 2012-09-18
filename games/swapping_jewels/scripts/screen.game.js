jewel.screens['game-screen'] = (function() {
	var board = jewel.board,
		display = jewel.display,
		cursor,
		input = jewel.input,
		firstRun = true,
		gameState,
		dom = jewel.dom,
		$ = dom.$,
		settings = jewel.settings;

	function setup() {
		input.initialize();

		input.bind('selectJewel', selectJewel);
		input.bind('moveUp', moveUp);
		input.bind('moveDown', moveDown);
		input.bind('moveLeft', moveLeft);
		input.bind('moveRight', moveRight);
	}
	
	function run() {
		if(firstRun) {
			setup();
			
			firstRun = false;
		}

		startGame();
	}

	function startGame() {
		gameState = {
			level: 0,
			score: 0,
			timer: 0,
			startTime: 0, // Time at start of level.
			endTime: 0 // Time to game over.
		}

		cursor = {
			x: 0,
			y: 0,
			selected: false
		};

		advanceLevel();
		updateGameInfo();
		setLevelTimer(true);

		board.initialize(function() {
			display.initialize(function() {
				display.redraw(board.getBoard(), function() {});
			});
		});
	}

	function selectJewel(x, y) {
		if(arguments.length == 0) {
			selectJewel(cursor.x, cursor.y);
			return;
		}

		if(cursor.selected) {
			var dx = Math.abs(x - cursor.x),
				dy = Math.abs(y - cursor.y),
				dist = dx + dy;

			switch(dist) {
				case 0: // Mesma jóia.
					setCursor(x, y, false);
					break;
				case 1: // Jóia adjacente.
					board.swap(cursor.x, cursor.y, x, y, playBoardEvents);
					setCursor(x, y, false);
					break;
				default: // Uma jóia longe da previamente selecionada.
					setCursor(x, y, true);
					break;
			}
		}
		else {
			setCursor(x, y, true);
		}
	}

	function setCursor(x, y, selected) {
		cursor.x = x;
		cursor.y = y;
		cursor.selected = selected;

		display.setCursor(x, y, selected);
	}

	function moveCursor(x, y) {
		if(cursor.selected) {
			x += cursor.x;
			y += cursor.y;

			if((x>=0) && (x<settings.cols) && (y>=0) && (x<settings.rows)) {
				selectJewel(x, y);
			}
		}
		else {
			x = (cursor.x + x + settings.cols) % settings.cols;
			y = (cursor.y + y + settings.rows) % settings.rows;

			setCursor(x, y, false);
		}
	}

	function moveUp() {
		moveCursor(0, -1);
	}

	function moveDown() {
		moveCursor(0, 1);
	}

	function moveLeft() {
		moveCursor(-1, 0);
	}

	function moveRight() {
		moveCursor(1, 0);
	}

	function playBoardEvents(events) {
		if(events.length) {
			var boardEvent = events.shift(),
				next = function() {
					playBoardEvents(events);
				};

			switch(boardEvent.type) {
				case 'move':
					display.moveJewels(boardEvent.data, next);
					break;
				case 'remove':
					display.removeJewels(boardEvent.data, next);
					break;
				case 'refill':
					announce('No moves!');
					display.refill(boardEvent.data, next);
					break;
				case 'score':
					addScore(boardEvent.data);
					next();
					break;
				default:
					next();
					break;
			}
		}
		else {
			display.redraw(board.getBoard(), function() {});
		}
	}

	function addScore(points) {
		var nextLevelAt = Math.pow(settings.baseLevelScore, Math.pow(settings.baseLevelExp, gameState.level-1))
		gameState.score += points;

		if(gameState.score >= nextLevelAt) {
			advanceLevel();
		}

		updateGameInfo();
	}

	function updateGameInfo() {
		$('#game-screen .score span')[0].innerHTML = gameState.score;
		$('#game-screen .level span')[0].innerHTML = gameState.level;
	}
	
	function setLevelTimer(reset) {
		if(gameState.timer) {
			clearTimeout(gameState.timer);
			gameState.timer = 0;
		}

		if(reset) {
			gameState.startTime = Date.now();
			gameState.endTime = settings.baseLevelTimer * Math.pow(gameState.level, -0.05 * gameState.level);
		}

		var delta = gameState.startTime + gameState.endTime - Date.now(),
			percent = (delta / gameState.endTime) * 100,
			progress = $('#game-screen .time .indicator')[0];

		if(delta < 0)
			gameOver();
		else {
			progress.style.width = percent + '%';
			gameState.timer = setTimeout(setLevelTimer, 30);
		}
	}

	function advanceLevel() {
		gameState.level++;
		announce('Level: '+gameState.level);

		updateGameInfo();

		setLevelTimer(true);
		display.levelUp();
	}

	function announce(str) {
		var element = $('#game-screen .announcement')[0];
		element.innerHTML = str;

		if(Modernizr.cssanimations) {
			dom.removeClass(element, 'zoomfade');

			setTimeout(function() {
				dom.addClass(element, 'zoomfade');
			}, 1);
		}
		else {
			dom.addClass(element, 'active');
			setTimeout(function() {
				dom.removeClass(element, 'active');
			}, 1000);
		}
	}

	function gameOver() {
		display.gameOver(function() {
			announce('Game over');
		});
	}

	return {
		run: run
	};
})();
