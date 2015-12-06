//HTML5 Canvas stuff based off a demo by Dan Gries, rectangleworld.com.
//The basic setup here, including the debugging code and window load listener, was copied from 'HTML5 Canvas' by Fulton & Fulton.

const $ = require('jquery');

window.addEventListener('load', init, false);
document.addEventListener('touchmove', function(e){e.preventDefault();}, false);

var name = '';
window.pEvent = 'single';
var cnt = 0; // move count
window.times = {};
var avgLengths = [5,12,100];
var bestAverages = [[],[],[]]; // best of 5, 12, 100
var nCurrent = 0;
var marathonData = 12; // for marathon and relay
var startTime;
var curTime;
var timerID;
var started = false;
var solving = false;
var dragging = false;
var relayData = '3,4,5', relayArr = [3,4,5];

var dragStartX, dragStartY;
var currentX, currentY;
var cwidth = 300, cheight = 300; // size of canvas
let canvas = document.getElementById('mainCanvas');
let context = canvas.getContext('2d');

var size = 3;
var squares;
var solved;
var colors = ['white','white','#FF6','white','#48C','white','#5F8','white','#222','white'];

var browser = getBrowser(); // only want to call this once

window.onkeydown = doKey;


/*******************************
 * CONTROLS AND MAIN FUNCTIONS *
 *******************************/

function init() {
	loadStuff();
	document.bgColor = 'black'
	document.fgColor = 'white';
	changedEvent();
	changedHideStats();
	loadAll();
}
 
function loadAll() {
	$('#pEvent option[value=' + pEvent + ']').prop('selected', true);
	$('#sizeText').val(size);
	$('#moves').val('');
	$('#relayText').val(relayData);
	$('#marathonText').val(marathonData);
	$('#zoomText').val(cwidth);
	showProgress();

	canvas.height = cheight;
	canvas.width = cwidth;
	$('#cube').height = cheight;
	$('#cube').width = cwidth;
 
	solved = solvedSquares();
	squares = solvedSquares();
 
	drawScreen();
	cnt = 0;
	saveStuff();
	displayTimes(true, 0);
	 
	canvas.addEventListener('touchstart', mouseDownListener, false);
	canvas.addEventListener('mousedown', mouseDownListener, false);
	canvas.addEventListener('mousemove', mouseMoveListener, false);

	window.addEventListener('touchcancel', mouseUpListener, false);
	window.addEventListener('touchend', mouseUpListener, false);
	window.addEventListener('touchleave', mouseUpListener, false);
	window.addEventListener('mouseup', mouseUpListener, false);
}

// listen for a mouse-down event
function mouseDownListener(evt) {
	//getting mouse position correctly, being mindful of resizing that may have occurred in the browser:
	var bRect = canvas.getBoundingClientRect();
	if (evt.changedTouches == null) {
		dragStartX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
		dragStartY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);
	} else {
		dragStartX = (evt.changedTouches[0].pageX - bRect.left)*(canvas.width/bRect.width);
		dragStartY = (evt.changedTouches[0].pageY - bRect.top)*(canvas.height/bRect.height);
	}
  
	dragging = true;

	//code below prevents the mouse down from having an effect on the main browser window:
	if (evt.preventDefault) {
		evt.preventDefault();
	} else if (evt.returnValue) { //standard
		evt.returnValue = false;
	} //older IE
	return false;
}

// listen for a mouse-up event (i.e. a completed drag)
function mouseUpListener(evt) {
	if (dragging) {
		dragging = false;
  
		// a drag is finished - get the ending position
		var bRect = canvas.getBoundingClientRect();
		var w = canvas.width, h = canvas.height;
		var dragEndX, dragEndY;
		if (evt.changedTouches == null) {
			dragEndX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
			dragEndY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);
		} else {
			dragEndX = (evt.changedTouches[0].pageX - bRect.left)*(canvas.width/bRect.width);
			dragEndY = (evt.changedTouches[0].pageY - bRect.top)*(canvas.height/bRect.height);
		}
  
		// get position of starting cell
		var s = Math.min(w,h);
		var wgap = (w - s)/2;
		var hgap = (h - s)/2;
		var startX = Math.floor((dragStartX - wgap) * (size/s));
		var startY = Math.floor((dragStartY - hgap) * (size/s));
		if (startX < 0 || startY < 0 || startX >= size || startY >= size) 
			return;

		// determined direction
		var diag1 = (dragEndX - dragStartX) + (dragEndY - dragStartY);
		var diag2 = (dragEndX - dragStartX) - (dragEndY - dragStartY);
		if (diag1 > 0 && diag2 > 0) {
			doMove(0, startY, true); // right
		} else if (diag1 > 0) {
			doMove(1, startX, true); // down
		} else if (diag2 > 0) {
			doMove(2, startX, true); // up
		} else {
			doMove(3, startY, true); // left
		}
	}
}

function mouseMoveListener(evt) {
	var bRect = canvas.getBoundingClientRect();
	var w = canvas.width, h = canvas.height;
	var s = Math.min(w,h);
	var wgap = (w - s)/2;
	var hgap = (h - s)/2;

	currentX = (evt.clientX - bRect.left)*(canvas.width/bRect.width);
	currentY = (evt.clientY - bRect.top)*(canvas.height/bRect.height);
	currentX = Math.floor((currentX - wgap) * (size/s));
	currentY = Math.floor((currentY - hgap) * (size/s));
}

function pressSpacebar(casual) {
	if (solving) {
		if (isSolved()) {
			finishSolve();
		}
	} else {
		if (pEvent == 'relay') {
			size = relayArr[0];
			loadAll();
		}
		nCurrent = 0;
		showProgress();
		scramble();
		cnt = 0;
		started = casual;
		solving = !casual;
	}
}

function pressEscape() {
	if(solving) {
		var agree = confirm('Are you SURE? This will stop the timer!');
		if (!agree) 
			return;
	}
	reset();
}

function changedZoom() {
	var newZoom = parseInt($('zoomText').val());
	changeDimensions(newZoom, newZoom);
	saveStuff();
}

const doKey = window.onkeydown = function (e) {
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
		if (shift) {
			doMove(0, currentY, true); // right
		}
	} else if (keyCode == 83) {
		doMove(1, currentX, true); // down
		if (shift) {
			doMove(1, currentX, true); 
		}
	} else if (keyCode == 87) {
		doMove(2, currentX, true); // up  
		if (shift) {
			doMove(2, currentX, true); // up  
		}
	} else if (keyCode == 65) {
		doMove(3, currentY, true); // left
		if (shift) {
			doMove(3, currentY, true); // left
		}
	}

	// space to scramble
	if (keyCode == 32) {
		pressSpacebar(shift);
	}

	//+ - for cube size
	else if (!shift && (keyCode == 107 || keyCode == 61 || ((browser == 'Chrome' || browser == 'IE') && keyCode == 187))) {
		changeN(size+1);
	} else if (!shift && size>2 && (keyCode == 109 || keyCode == 173 || ((browser == 'Chrome' || browser == 'IE') && keyCode == 189))) {
		changeN(size-1);
	}

	//shift + - for square size
	else if (shift && (keyCode == 107 || keyCode == 61 || ((browser == 'Chrome' || browser == 'IE') && keyCode == 187))) {
		changeDimensions(parseInt(cwidth) + 20, parseInt(cwidth) + 20);
	} else if (shift && (keyCode == 109 || keyCode == 173 || ((browser == 'Chrome' || browser == 'IE') && keyCode == 189))) {
		changeDimensions(parseInt(cwidth) - 20, parseInt(cwidth) - 20);
	}
 
	//< > for marathon length
	else if (keyCode == 188 && shift && marathonData > 1 && pEvent == 'marathon') {
		marathonData--; showProgress();
	} else if (keyCode == 190 && shift && pEvent == 'marathon') {
		marathonData++; showProgress();
	}

	//escape to reset
	else if (keyCode == 27) {
		pressEscape();
	}

}

const finishSolve = function () {
	if (pEvent == 'single') {
		stopTimer(true);
		started = false;
		solving = false;
	} else if (pEvent == 'marathon') {
		nCurrent++;
		showProgress();
		if (nCurrent >= marathonData) {
			stopTimer(true);
			started = false;
			solving = false;
		} else {
			scramble();
			started = true;
			solving = true;
		}
	} else if (pEvent == 'relay') {
		nCurrent++;
		showProgress();
		if (nCurrent < marathonData) {
			size = relayArr[nCurrent];
			loadAll();
			scramble();
			started = true;
			solving = true;
		} else {
			stopTimer(true);
			started = false;
			solving = false;
		}
	}
	saveStuff();
}

const reset = function () {
	if (pEvent == 'relay') {
		size = relayArr[relayArr.length - 1];
	}
	showProgress();
	nCurrent = 0;
	if (solving) {
		clearTimes();
	}
	stopTimer(false);
	solving = false;
	started = false;
	loadAll();
	saveStuff();
}

function changedEvent() {
	var obj = document.getElementById('pEvent');
	pEvent = obj.options[obj.selectedIndex].value;
	if (pEvent == 'marathon') {
		nCurrent = 0
		if (parseInt($('#marathonText').val())) {
			marathonData = parseInt($('#marathonText').val())
		}
		$('#marathonText').blur();
	} else if (pEvent == 'relay') {
		// parse relayData
		relayData = $('#relayText').val().split(/,| /);
		relayArr = [];
		for (let i = 0; i < relayData.length; i++) {
			var solv = parseInt(relayData[i]);
			if (solv >= 2 && solv <= 1000) {
				relayArr.push(solv);
			}
		}
		if (relayArr.length == 0) {
			relayArr = [3];
		}

		nCurrent = 0;
		marathonData = relayArr.length;
		size = relayArr[relayArr.length - 1];
		$('#relayText').blur();
	}

	if (!times[getEvent()]) {
		times[getEvent()] = [];
	}
	document.getElementById('relaydata').style.display = (pEvent == 'relay') ? '' : 'none';
	document.getElementById('marathondata').style.display = (pEvent == 'marathon') ? '' : 'none';

	stopTimer(false);
	solving = false;
	loadAll();
	saveStuff();
	// displayTimes(true);
}

function changedHideStats() {
	document.getElementById('stats').style.display = (document.getElementById('hideStats').checked) ? 'none' : ''; 
	saveStuff();
}

function changedSize() {
	var newSize = parseInt($('#sizeText').val());
	changeN(newSize);
	saveStuff();
	$('#sizeText').blur();
}

document.getElementById('sizeText').onchange = changedSize;

function changeN(newSize) {
	if(solving) {
		var agree = confirm('Are you SURE? This will stop the timer!');
		if (!agree) 
			return;
	}
	if (newSize < 2) {
		newn = 2;
	}
	if (newSize == size) {
		return;
	}
 
	stopTimer(false);
	solving = false;
	size = newSize;
	if (pEvent == 'relay') {
		marathonData = relayArr.length;
	}
	loadAll();
	saveStuff();
}

function changeDimensions(newWidth, newHeight) {
	cwidth = newWidth;
	cheight = newHeight;
	let c = document.getElementById('mainCanvas').getContext('2d');
	document.getElementById('mainCanvas').height = cheight;
	document.getElementById('mainCanvas').width = cwidth;
	document.getElementById('cube').height = cheight;
	document.getElementById('cube').width = cwidth;
	document.getElementById('zoomText').value = cwidth;
	drawScreen();
	saveStuff();
}

function showProgress() {
	if (pEvent == 'single') {
		document.getElementById('progress').innerHTML = '';
	} else if (pEvent == 'marathon') {
		document.getElementById('progress').innerHTML = nCurrent + '/' + marathonData + ' puzzle' + (marathonData==1?'':'s');
	} else if (pEvent == 'relay') {
		document.getElementById('progress').innerHTML = nCurrent + '/' + marathonData + ' puzzle' + (marathonData==1?'':'s');
	}
}

/************
 * GRAPHICS *
 ************/

// redraw everything
function drawScreen() {
	var w = canvas.width, h = canvas.height;
	context.fillStyle = '#999';
	context.fillRect(0, 0, w, h);
 
	var s = Math.min(w,h);
	var wgap = (w - s)/2;
	var hgap = (h - s)/2;
 
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			drawTile(squares[i][j], wgap + s * j / size, hgap + s * i / size, 
				wgap + s * (j+1) / size, hgap + s * (i+1) / size);
		}
	}
}
 
// draw one tile on the screen
// color = what type of tile it is, x1/y1/x2/y2 = coordinates of square
function drawTile(type, x1, y1, x2, y2) {
	context.strokeStyle = '#999';
	context.lineWidth = Math.max(1, Math.min(cwidth, cheight)/(size*10));
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
}
 
// draw a triangle
// fillColor = color of triangle, x1/y1/x2/y2/x3/y3 = vertices
function drawTriangle(fillColor, x1, y1, x2, y2, x3, y3) {
	context.fillStyle = fillColor;
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.lineTo(x3, y3);
	context.closePath();
	context.fill();
}

/******************
 * PUZZLE DETAILS *
 ******************/
 
// do a move
// direction = 0/1/2/3 (right/down/up/left), layer = layer from top/left (0 to size-1)
function doMove(direction, layer, redraw) {
	if (direction == 0) { // right
		var tmp = squares[layer][size-1];
		for (let i=size-1; i>0; i--) {
			squares[layer][i] = squares[layer][i-1];
		}
		squares[layer][0] = tmp;
	} else if (direction == 1) { // down
		var tmp = squares[size-1][layer];
		for (let i=size-1; i>0; i--) {
			squares[i][layer] = squares[i-1][layer];
		}
		squares[0][layer] = tmp;
	} else if (direction == 2) { // up
		var tmp = squares[0][layer];
		for (let i=0; i<size-1; i++) {
			squares[i][layer] = squares[i+1][layer];
		}
		squares[size-1][layer] = tmp;
	} else { // left
		var tmp = squares[layer][0];
		for (let i=0; i<size-1; i++) {
			squares[layer][i] = squares[layer][i+1];
		}
		squares[layer][size-1] = tmp;
	}
 
	if (redraw) 
		drawScreen();
	if (redraw && solving) {
		cnt++;
		startTimer();
		if (isSolved()) {
			finishSolve();
		}
	}
}
 
// get a solved array
function solvedSquares() {
	let sqr = [];
	for (let i=0; i<size; i++) {
		sqr[i] = [];
		for (let j=0; j<size; j++) {
			// determine the 'color' of a square. imagine the numpad
			if (i>j && i+j+1==size) { 
				sqr[i][j] = 1;
			} else if (i>j && i+j+1>size) { 
				sqr[i][j] = 2;
			} else if (i==j && i+j+1>size) { 
				sqr[i][j] = 3;
			} else if (i>j && i+j+1<size) { 
				sqr[i][j] = 4;
			} else if (i==j && i+j+1==size) { 
				sqr[i][j] = 5;
			} else if (i<j && i+j+1>size) { 
				sqr[i][j] = 6;
			} else if (i==j && i+j+1<size) { 
				sqr[i][j] = 7;
			} else if (i<j && i+j+1<size) { 
				sqr[i][j] = 8;
			} else if (i<j && i+j+1==size) { 
				sqr[i][j] = 9;
			} else {
				sqr[i][j] = -1;
			}
		}
	}
	return sqr;
}

// check if our position is solved
function isSolved() {
	for (let i=0; i<size; i++) {
		for (let j=0; j<size; j++) {
			if (squares[i][j] != solved[i][j]) {
				return false;
			}
		}
	}
	return true;
}

function scramble() {
	do {
		// random permutation of pieces
		var nswaps = 0;
		for (let i=0; i<(size*size)-2; i++) {
			var rand = i + Math.floor(Math.random() * (size*size - i));
			if (rand != i) {
				var i1 = i%size, rand1 = rand%size;
				var i2 = (i-i1)/size, rand2 = (rand-rand1)/size;
				var tmp = squares[i2][i1];
				squares[i2][i1] = squares[rand2][rand1];
				squares[rand2][rand1] = tmp;
				nswaps++;
			}
		}
  
		// if size==3, make sure to have proper parity
		if (size==3 && nswaps%2 == 1) {
			var tmp = squares[size-1][size-2];
			squares[size-1][size-2] = squares[size-1][size-1];
			squares[size-1][size-1] = tmp;
		}
	} while (isSolved());
	drawScreen();
}

/*******************
 * TIMER AND STATS *
 *******************/

function startTimer() {
	if (!started) {
		started = true;
		startTime = new Date();
		timerID = setInterval(updateTimer, 100);
	}
}

function pretty(time) {
	time = Math.round(time);
	var mins = Math.floor(time/60000);
	var secs = trim((time - 60000*mins)/1000, 3);
	if (mins == 0) {
		return secs;
	} else {
		return mins + (secs < 10 ? ':0' : ':') + secs;
	}
}

function updateTimer() {
	curTime = new Date();
	var time = curTime.getTime() - startTime.getTime();
	document.getElementById('time').innerHTML = pretty(time);
}

function stopTimer(good) {
	if (started) {
		started = false;
		curTime = new Date();
		var time = curTime.getTime() - startTime.getTime();
		document.getElementById('time').innerHTML = pretty(time) + (good ? '' : '*');
		clearInterval(timerID);

		if (good) { // store the time
			// times[size][times.length] = time;
			times[getEvent()].push(time);
			// figure out averages and display
			displayTimes(false, time);
		}
	}
}

function displayTimes(loadedPage, time) {
	var v = '';
	var min = 0;
	if (!times[getEvent()]) {
		times[getEvent()] = [];
	}
	for (let i = 1; i < times[getEvent()].length; i++) {
		if (times[getEvent()][i] < times[getEvent()][min]) {
			min = i;
		}
	}
	if (times[getEvent()].length >= 1) {
		v += 'Best time: ' + pretty(times[getEvent()][min]) + '<br>';
	}
   
	for (let i = 0; i < avgLengths.length; i++) {
		var len = avgLengths[i];
		if (times[getEvent()].length >= len) {
			var avgData = getAvg(len, times[getEvent()].slice(times[getEvent()].length - len));
			v += '<br>Current avg' + len + ': ' + (len<100?avgData[0]:pretty(avgData[1])) + '<br>';
			v += 'Best avg' + len + ': ';
			if (loadedPage) {
				// compute best average from scratch
				for (let j=0; j <= times[getEvent()].length-len; j++) {
						var thisAvg = getAvg(len, times[getEvent()].slice(j, len+j));
					if (j==0 || thisAvg[1] < bestAverages[i][1]) {
						bestAverages[i] = thisAvg;
					}
				}
				if (len < 100) {
					v += bestAverages[i][0] + '<br>';
				} else {
					v += pretty(bestAverages[i][1]) + '<br>';
				}
			} else {
				// just compare avgData to best averages
				if (times[getEvent()].length == len || avgData[1] < bestAverages[i][1]) {
					bestAverages[i] = avgData;
				}

				if (len<100) {
					v += bestAverages[i][0] + '<br>';
				} else {
					v += pretty(bestAverages[i][1]) + '<br>';
				}
			}
			v += ''
		}
	}
	document.getElementById('stats').innerHTML = v;
	if (!loadedPage) {
		document.getElementById('moves').innerHTML = cnt + ' moves at ' + Math.round(100000*cnt/time)/100 + ' moves/sec<br>' + 
		Math.round(1000*(cnt/(size*size)))/1000 + ' moves per piece';
	} else {
		document.getElementById('moves').innerHTML = '';
	}
}

function getAvg(n, list) {
	var max = 0;
	var min = 0;
	var sum = list[0];
	for (var i=1; i<n; i++) {
		if (list[i] > list[max]) {
			max = i;
		} if (list[i] < list[min]) {
			min = i;
		}
		sum += list[i];
	}
	sum = sum - list[min] - list[max];
	var v = '';
	for (let i = 0; i < n; i++) {
		if (i == min || i == max) {
			v += '(' + pretty(list[i]) + ') ';
		} else {
			v += pretty(list[i]) + ' ';
		}
	}
	var avg = sum/(n-2);
	v += '=> ' + pretty(avg);
	return [v, avg];
}

function clearTimes() {
	times = {};
	document.getElementById('stats').innerHTML = '';
}

window.getEvent = function () {
    switch (pEvent) {
        case 'single':
            return size;
        case 'marathon':
            return size + '*' + marathonData;
        case 'relay':
            return relayData;
    }
}

/********************
 * HELPER FUNCTIONS *
 ********************/
function saveStuff() {
	if (window.localStorage !== undefined) {
		window.localStorage.setItem('switchtile_pEvent', pEvent);
		window.localStorage.setItem('switchtile_times', JSON.stringify(times));
		window.localStorage.setItem('switchtile_relayData', relayData);
		window.localStorage.setItem('switchtile_size', size);
		window.localStorage.setItem('switchtile_zoom', cwidth);
	}
}

function loadStuff() {
	if (window.localStorage !== undefined) {
		pEvent = window.localStorage.getItem('switchtile_pEvent') || pEvent;

		size = window.localStorage.getItem('switchtile_size') || size;
		if (!size || size === null || typeof size != 'number' || size < 2 || size > 999) {
			size = 3;
		}

		times = JSON.parse(window.localStorage.getItem('switchtile_times'));
		if (!times) {
			times = {};
			times[getEvent()] = [];
		}

		relayData = window.localStorage.getItem('switchtile_relayData') || relayData;
		marathonData = window.localStorage.getItem('switchtile_marathonData') || marathonData;

		let zoom = window.localStorage.getItem('switchtile_zoom');
		if (zoom != null) {
			cwidth = parseInt(zoom); 
			cheight = parseInt(zoom);
		}
	}
}

// function document.getElementById(str) {
//     return document.getElementById(str);
// }

function sqrt(x){
	return Math.sqrt(x);
}

function trim(number, nDigits) {
	if (!number || number == Number.POSITIVE_INFINITY || number == Number.NEGATIVE_INFINITY) 
		number = 0;
	var power = Math.pow(10, nDigits);
	var trimmed = '' + Math.round(number * power);
	while (trimmed.length < nDigits + 1) {
		trimmed = '0' + trimmed;
	}
	var len = trimmed.length;
	return trimmed.substr(0,len - nDigits) + '.' + trimmed.substr(len - nDigits, nDigits);
}

function getBrowser() {
	// http://www.quirksmode.org/js/detect.html
	var versionSearchString;
	var dataBrowser = [
		{string:navigator.userAgent, subString:'Chrome', identity:'Chrome'},
		{string:navigator.userAgent, subString:'Safari', identity:'Chrome'},
		{string:navigator.userAgent, subString:'Firefox', identity:'Firefox'},
		{string:navigator.userAgent, subString:'MSIE', identity:'IE', versionSearch:'MSIE'}
	];

	function searchString(data) {
		for (let i = 0; i < data.length;i++) {
		var dataString = data[i].string;
		var dataProp = data[i].prop;
		if (dataString) {
			if (dataString.indexOf(data[i].subString) != -1)
				return data[i].identity;
			} else if (dataProp) {
				return data[i].identity;
			}
		}
	};
 
	return searchString(dataBrowser) || 'An unknown browser';
}

document.getElementById('pEvent').onchange = changedEvent

document.getElementById('hideStats').onchange = changedHideStats;
document.getElementById('zoomText').onchange = changedZoom;
document.getElementById('relayText').onchange = changedEvent;
document.getElementById('marathonText').onchange = changedEvent;

document.getElementById('scrambleButton').onclick = () => pressSpacebar(false);
document.getElementById('reset').onclick = () => pressEscape(false);