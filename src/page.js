var React = require('react');
var app = require('ampersand-app');
var Timer = require('./timer.js');
var Puzzle = require('./puzzle.js');
var util = require('./utils.js');

module.exports = React.createClass({
	getInitalState () {
		return {
			event: 'single'
		};
	},

	changedSize (event) {
		console.log(event);
	},

	render () {
		return (
		<div>
			<div id='options' style={{border: '1px solid blue'}}>
				<table style={{width: '100%'}}>
					<tr>
						<td>
							Event: <select id='pEvent' onchange='changedEvent(true);reset()'>
								<option value='single' selected>single</option>
								<option value='marathon'>marathon</option>
								<option value='relay'>relay</option>
							</select>
						</td>
						<td>
							<input type='checkbox' id='hideStats' onchange='changedHideStats()'> Hide stats</input>
						</td>
						<td>Size: <input id='sizeText' size='3' maxlength='3' onchange={this.changedSize}/></td>
					</tr>
					<tr>
						<td>
							<div id='relaydata'>Relay data: <input id='relayText' size='10' onchange='changedEvent(true)'/></div>
						</td>
						<td>
							<input type='button' onclick='pressSpacebar(false)' value='Scramble' />
							<input type='button' onclick='pressEscape()' value='Reset' />
						</td>
						<td width='30%'>
							Zoom: <input id='zoomText' size='4' maxlength='4' onchange='changedZoom()'/>
						</td>
					</tr>
				</table>
			</div>
			<Puzzle/>
			<Timer style={{color: 'red'}} timer={app.timer}/>
		</div>);
	}
});
