var React = require('react');
var util = require('./utils.js');

module.exports = React.createClass({
	displayName: 'Puzzle',
	getInitalState () {
		return {
			event: 'single',
			size: 3,
			moveCount: 0,
			squares: this.solvedSquares(),
			solved: this.solvedSquares(),
		};
	},

	componentDidMount () {
		console.log(this.refs);
		this.context = this.refs.canvas.getDOMNode().getContext('2d');
		this.drawScreen();
	},

	// do a move
	// direction = 0/1/2/3 (right/down/up/left), layer = layer from top/left (0 to n-1)
	doMove (direction, layer, redraw) {
		if (direction == 0) { // right
			var tmp = this.state.squares[layer][n-1];
			for (i=n-1; i>0; i--) {
				this.state.squares[layer][i] = this.state.squares[layer][i-1];
			}
			this.state.squares[layer][0] = tmp;
		} else if (direction == 1) { // down
			var tmp = this.state.squares[n-1][layer];
			for (i=n-1; i>0; i--) {
				this.state.squares[i][layer] = this.state.squares[i-1][layer];
			}
			this.state.squares[0][layer] = tmp;
		} else if (direction == 2) { // up
			var tmp = this.state.squares[0][layer];
			for (i=0; i<n-1; i++) {
				this.state.squares[i][layer] = this.state.squares[i+1][layer];
			}
			this.state.squares[n-1][layer] = tmp;
		} else { // left
			var tmp = this.state.squares[layer][0];
			for (i=0; i<n-1; i++) {
				this.state.squares[layer][i] = this.state.squares[layer][i+1];
			}
			this.state.squares[layer][n-1] = tmp;
		}
	 
	 	if (redraw) {
			this.drawScreen();
			if (solving) {
				this.moves++;
				app.trigger('startTimer');
				if (this.isSolved()) {
					this. finishSolve();
				}
			}
		}
	},
	 
	// get a solved array
	solvedSquares (size) {
		var sqr = [];
		for (let i = 0 ; i < size; i++) {
			sqr[i] = [];
			for (let j = 0 ; j < size; j++) {
				// determine the 'color' of a square. imagine the numpad
				if (i > j && i+j+1==size) { 
					sqr[i][j] = 1;
				} else if (i > j && i+j+1>size) { 
					sqr[i][j] = 2;
				} else if (i == j && i+j+1>size) { 
					sqr[i][j] = 3;
				} else if (i > j && i+j+1<size) { 
					sqr[i][j] = 4;
				} else if (i==j && i+j+1==size) { 
					sqr[i][j] = 5;
				} else if (i < j && i+j+1>size) { 
					sqr[i][j] = 6;
				} else if (i == j && i+j+1<size) { 
					sqr[i][j] = 7;
				} else if (i < j && i+j+1<size) { 
					sqr[i][j] = 8;
				} else if (i < j && i+j+1==size) { 
					sqr[i][j] = 9;
				} else {
					sqr[i][j] = -1;
				}
			}
		}
		return sqr;
	},

	finishSolve() {
		if (pEvent == "single") {
			app.trigger('stopTimer', true);
			started = false;
			solving = false;
		} else if (pEvent == "marathon") {
			nCurrent++;
			this.showProgress();
			if (nCurrent >= nTotal) {
				app.trigger('stopTimer', true);
				started = false;
				solving = false;
			} else {
				this.scramble();
				started = true;
				solving = true;
			}
		} else if (pEvent == "relay") {
			nCurrent++;
			this.showProgress();
			if (nCurrent < nTotal) {
				n = relayArr[nCurrent];
				this.loadAll();
				this.scramble();
				started = true;
				solving = true;
			} else {
				app.trigger('stopTimer', true);
				started = false;
				solving = false;
			}
		}
		app.trigger('save');
	},

	// check if our position is solved
	isSolved () {
		for (i=0; i<n; i++) {
			for (j=0; j<n; j++) {
				if (this.squares[i][j] != this.solved[i][j]) {
					return false;
				}
			}
		}
		return true;
	},

	scramble () {
		do {
			// random permutation of pieces
			var nswaps = 0;
			for (i=0; i < (n*n) - 2; i++) {
				var rand = i + Math.floor(Math.random() * (n*n - i));
				if (rand != i) {
					var i1 = i%n, rand1 = rand%n;
					var i2 = (i-i1)/n, rand2 = (rand-rand1)/n;
					var tmp = this.squares[i2][i1];
					this.squares[i2][i1] = this.squares[rand2][rand1];
					this.squares[rand2][rand1] = tmp;
					nswaps++;
				}
			}
	  
			// if n==3, make sure to have proper parity
			if (n == 3 && nswaps % 2 == 1) {
				var tmp = this.squares[n-1][n-2];
				this.squares[n-1][n-2] = this.squares[n-1][n-1];
				this.squares[n-1][n-1] = tmp;
			}
		} while (this.isSolved());
	},

	doKey(e) {
	    var keyCode = 0;
	    if (e.keyCode) {
	        keyCode = e.keyCode;
	    } else if (e.which) {
	        keyCode = e.which;
	    }
	    var shift = e.shiftKey;
	    var shmod = (shift ? 1 : 0); // shift modifier for layers
	    if (keyCode == 32) { // prevent normal handling of space key
	        if (e.stopPropagation) {
	            e.stopPropagation();
	        }
	        e.preventDefault();
	    }

	    // up: 87
	    // down: 83
	    // left: 65
	    // right: 68

	    if (keyCode == 68) {
	        doMove(0, currentY, true); // right
	        if (shift)
	            doMove(0, currentY, true); // right
	    } else if (keyCode == 83) {
	        doMove(1, currentX, true); // down
	        if (shift)
	            doMove(1, currentX, true); 
	    } else if (keyCode == 87) {
	        doMove(2, currentX, true); // up  
	        if (shift)
	            doMove(2, currentX, true); // up  
	    } else if (keyCode == 65) {
	        doMove(3, currentY, true); // left
	        if (shift)
	            doMove(3, currentY, true); // left
	    }

	    // space to scramble
	    if (keyCode == 32) {
	        pressSpacebar(shift);
	    }

	    //+ - for cube size
	    else if (!shift && (keyCode == 107 || keyCode == 61 || ((browser == "Chrome" || browser == "IE") && keyCode == 187)))
	        changeN(n+1);
	    else if (!shift && n>2 && (keyCode == 109 || keyCode == 173 || ((browser == "Chrome" || browser == "IE") && keyCode == 189)))
	        changeN(n-1);

	    //shift + - for square size
	    else if (shift && (keyCode == 107 || keyCode == 61 || ((browser == "Chrome" || browser == "IE") && keyCode == 187)))
	        changeDimensions(parseInt(cwidth) + 20, parseInt(cwidth) + 20);
	    else if (shift && (keyCode == 109 || keyCode == 173 || ((browser == "Chrome" || browser == "IE") && keyCode == 189)))
	        changeDimensions(parseInt(cwidth) - 20, parseInt(cwidth) - 20);
	 
	    //< > for marathon length
	    else if (keyCode == 188 && shift && nTotal>1 && pEvent=="marathon") {
	        nTotal--; showProgress();
	    } else if (keyCode == 190 && shift && pEvent=="marathon") {
	        nTotal++; showProgress();
	    } else if (keyCode == 27) { // escape to reset
	        this.pressEscape();
	    }
	},

	pressEscape() {
	    if(solving) {
	        var agree = confirm("Are you SURE? This will stop the timer!");
	        if (!agree) 
	            return;
	    }
	    this.reset();
	},

	// redraw everything
	drawScreen () {
		console.log('drawing');
		var w = this.refs.canvas.width, h = this.refs.canvas.height;
		this.context.fillStyle = '#999';
		this.context.fillRect(0, 0, w, h);
	 
		var s = Math.min(w,h);
		var wgap = (w - s)/2;
		var hgap = (h - s)/2;
	 
		for (let i = 0; i < this.state.size; i++) {
			for (let j = 0; j < this.state.size; j++) {
				this.drawTile(this.state.squares[i][j], wgap + s * j / this.state.size, hgap + s * i / this.state.size, 
					wgap + s * (j+1) / this.state.size, hgap + s * (i+1) / this.state.size);
			}
		}
	},
	 
	// draw one tile on the screen
	// color = what type of tile it is, x1/y1/x2/y2 = coordinates of square
	drawTile (type, x1, y1, x2, y2) {
		this.context.strokeStyle = '#999';
		this.context.lineWidth = Math.max(1, Math.min(cwidth, cheight)/(n*10));
		if (type == 2 || type == 4 || type == 6 || type == 8) {
			context.fillStyle = colors[type];
			context.fillRect(x1, y1, x2-x1, y2-y1);
		} else if (type == 1) {
			drawTriangle(colors[2], x2,y1, x2,y2, x1,y2);
			drawTriangle(colors[4], x2,y1, x1,y1, x1,y2);
		} else if (type == 3) {
			drawTriangle(colors[2], x1,y1, x1,y2, x2,y2);
			drawTriangle(colors[6], x1,y1, x2,y1, x2,y2);
		} else if (type == 5) {
			drawTriangle(colors[2], x2,y2, x1,y2, (x2+x1)/2,(y2+y1)/2);
			drawTriangle(colors[4], x1,y1, x1,y2, (x2+x1)/2,(y2+y1)/2);
			drawTriangle(colors[6], x2,y2, x2,y1, (x2+x1)/2,(y2+y1)/2);
			drawTriangle(colors[8], x1,y1, x2,y1, (x2+x1)/2,(y2+y1)/2);
		} else if (type == 7) {
			drawTriangle(colors[4], x1,y1, x1,y2, x2,y2);
			drawTriangle(colors[8], x1,y1, x2,y1, x2,y2);
		} else if (type == 9) {
			drawTriangle(colors[6], x2,y1, x2,y2, x1,y2);
			drawTriangle(colors[8], x2,y1, x1,y1, x1,y2);
		}
		context.strokeRect(x1, y1, x2-x1, y2-y1);
	},
	 
	// draw a triangle
	// fillColor = color of triangle, x1/y1/x2/y2/x3/y3 = vertices
	drawTriangle (fillColor, x1, y1, x2, y2, x3, y3) {
		this.context.fillStyle = fillColor;
		this.context.beginPath();
		this.context.moveTo(x1, y1);
		this.context.lineTo(x2, y2);
		this.context.lineTo(x3, y3);
		this.context.closePath();
		this.context.fill();
	},

	render () {
		return (
		<div height={this.props.height} width={this.props.width} id='cube'>
			<canvas ref='canvas'/>
		</div>)
	}
});
