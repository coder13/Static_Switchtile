/* 
	Inspection time,
	inspection beep,
	hide time during solve,
	chime every 10 seconds,
	hold time (ranges from 0.2s to 2.0s default 0.4s),
	multiphase

	Wishfully generic multi-purpose timer
*/

var _ = require('lodash');
var React = require('react');
var utils = require('./utils.js');

var requestAnimationFrame =
	window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(fn) { return window.setTimeout(fn, 1000 / 60); };

var cancelAnimationFrame =
	window.cancelAnimationFrame || window.webkitCancelAnimationFrame ||
	window.mozCancelRequestAnimationFrame ||
	window.oCancelRequestAnimationFrame ||
	window.msCancelRequestAnimationFrame || window.clearTimeout;

var setInterval = function (fn, delay) {
	// Have to use an object here to store a reference
	// to the requestAnimationFrame ID.
	var handle = {};

	function interval() {
		fn.call();
		handle.value = requestAnimationFrame(interval);
	}

	handle.value = requestAnimationFrame(interval);
	return handle;
};

var clearInterval = function (interval) {
	cancelAnimationFrame(interval.value);
};

var now = function () {
	return (window.performance && window.performance.now
		? window.performance.now.bind(window.performance)
		: Date.now)().toFixed();
};

module.exports = React.createClass({
	displayName: 'Timer',
	_style: {fontSize: '80px', margin: '2px'},

	accuracy: 2,        // # of digits displayed after the decimal point
	input: 'timer',     // timer, manual, stackmat
	inspection: 15,     // Amount of inspection in seconds. 15s is WCA
	phase: 1,

	states: ['rest', 'inspection', 'timing'],

	getInitialState() {
		return {
			timing: false,
			down: false,
			time: 0,
			active: true,
			status: 0
		};
	},

	newTime (time) {
		console.log(time);
	},

	componentDidMount() {
		app.on('startTimer', function () {
			this.start();
		}, this);

		app.on('stopTimer', function () {
			this.stop();
		}, this);
	},

	componentWillUnmount: function() {
		if (this.timerObj) {
			clearInterval(this.timerObj);
		}
	},

	start (e) {
		if (this.state.timing) {
			clearInterval(this.timerObj);
			if (this.newTime) {
				this.newTime(this.state.time);
			}
		} else {
			this.setState({
				down: true
			});
		}
		this.forceUpdate();
	},

	stop (e) {
		if (this.state.timing) {
			this.setState({
				timing: false
			});
		} else {
			this.setState({
				started: now(),
				timing: true,
				down: false,
				time: 0
			});
			this.timerObj = setInterval(this.tick.bind(this), 10);
		}
		this.forceUpdate();
	},

	tick () {
		this.setState({time: (now() - this.state.started)});
		this.forceUpdate();
	},

	render() {
		var style = _.merge({}, this._style, this.props.style, {color: this.state.down ? 'green' : this.props.style.color});
		return (<p
			onKeyDown={this.keyDown}
			onKeyUp={this.keyUp}
			className={this.props.className || 'timer'}
			id={this.props.id || ''}
			style={style}>{utils.pretty(this.state.time)}</p>);
	}
});
