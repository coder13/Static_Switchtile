require('./styles/main.styl');
var React = require('react');
var App = require('ampersand-app');
var Puzzle = require('./puzzle.js');
var util = require('./utils.js');
var Page = require('./page.js');

var app = window.app = App.extend({
	init: function () {
		this.puzzle = new Puzzle();
		this.timer = {};
		this.times = {};
		this.avgLengths = [5,12,100];
		this.bestAverages = [[],[],[]];
		this.browser = util.getBrowser();
	},

	changedSize(event) {
		console.log(event);
	}
});

app.init();

React.render(<Page/>, document.body);
