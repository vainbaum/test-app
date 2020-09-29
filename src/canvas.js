import React, { Component } from 'react';
import { v4 } from 'uuid';

class Canvas extends Component {
	constructor(props) {
		super(props);
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchMove = this.onTouchMove.bind(this);
		this.endPaintEvent = this.endPaintEvent.bind(this);
		this.onContextMenu = this.onContextMenu.bind(this);
		this.clear = this.clear.bind(this);
	}

	isPainting = false;
	//Different stroke styles to be used for user and guest
	userStrokeStyle = '#EE92C2';
	guestStrokeStyle = '#F0C987';
	backgroundStyle = 'black';
	line = [];
	history = [];
	//v4 creates a unique id for each user. We used this since there's no auth to tell users apart
	userId = v4();
	prevPos = { offsetX: 0, offsetY: 0 };

	onMouseDown({ nativeEvent }) {
		if (nativeEvent.which == 3){ //mouse down on left click == 1; on right == 3 ><
			return;
		}
		console.log(nativeEvent);
		const { offsetX, offsetY } = nativeEvent;
		this.isPainting = true;
		this.history.push(this.line.length);
		this.prevPos = { offsetX, offsetY };
	}

	onMouseMove({ nativeEvent }) {
		if (this.isPainting) {
			const { offsetX, offsetY } = nativeEvent;
			const offSetData = { offsetX, offsetY };
			//Set the start and stop position of the paint event.
				const positionData = {
					start: { ...this.prevPos },
					stop: { ...offSetData },
				};
			//Add the position to the line array
			this.line = this.line.concat(positionData);
			this.paint(this.prevPos, offSetData, this.userStrokeStyle);
		}
	}

	onContextMenu({ nativeEvent }) {
		console.log("Hello");
		nativeEvent.preventDefault();
		this.ctx.lineWidth = 6;
		var currentLineLength = this.history.pop();
		for (var i = this.line.length; i > currentLineLength; i--){
			var lastLineIndex = i - 1;
			this.undo(this.line[lastLineIndex]['stop'], this.line[lastLineIndex]['start'], this.backgroundStyle);
		}
		this.ctx.lineWidth = 5.1;
	}

	onTouchStart ({ nativeEvent }) {
		var bcr = nativeEvent.target.getBoundingClientRect();
		const offsetX = nativeEvent.targetTouches[0].clientX - bcr.x;
		const offsetY = nativeEvent.targetTouches[0].clientY - bcr.y;
		this.isPainting = true;
		this.history.push(this.line.length);
		this.prevPos = { offsetX, offsetY };
	}

	onTouchMove ({ nativeEvent }) {
		if (this.isPainting) {
			var bcr = nativeEvent.target.getBoundingClientRect();
			const offsetX = nativeEvent.targetTouches[0].clientX - bcr.x;
			const offsetY = nativeEvent.targetTouches[0].clientY - bcr.y;
			const offSetData = { offsetX, offsetY };
			//Set the start and stop position of the paint event.
				const positionData = {
					start: { ...this.prevPos },
					stop: { ...offSetData },
				};
			//Add the position to the line array
			this.line = this.line.concat(positionData);
			this.paint(this.prevPos, offSetData, this.userStrokeStyle);
		}
	}
	endPaintEvent() {
		if (this.isPainting) {
			this.isPainting = false;
			//this.sendPaintData();
		}
	}
	paint(prevPos, currPos, strokeStyle) {
		const { offsetX, offsetY } = currPos;
		const { offsetX: x, offsetY: y } = prevPos;

		this.ctx.beginPath();
		this.ctx.strokeStyle = strokeStyle;
		//Move the the prevPosition of the mouse
		this.ctx.moveTo(x, y);
		//Draw a line to the current position of the mouse
		this.ctx.lineTo(offsetX, offsetY);
		//Visualize the line using the strokeStyle
		this.ctx.stroke();
		this.prevPos = { offsetX, offsetY };
	}
	
	undo(currentPosition, previousPosition, strokeStyle){
		const { offsetX, offsetY } = previousPosition;
		const { offsetX: x, offsetY: y } = currentPosition;
		this.ctx.beginPath();
		this.ctx.strokeStyle = strokeStyle;
		//Move the the prevPosition of the mouse
		this.ctx.moveTo(x, y);
		//Draw a line to the current position of the mouse
		this.ctx.lineTo(offsetX, offsetY);
		//Visualize the line using the strokeStyle
		this.ctx.stroke();
		this.prevPos = { offsetX, offsetY };
	}

	async sendPaintData() {
		const body = {
			line: this.line,
			userId: this.userId,
		};
		//We use the native fetch API to make requests to the server
		const req = await fetch('http:localhost:9000/paint', {
			method: 'post',
			body: JSON.stringify(body),
			headers: {
				'content-type': 'application/json',
			},
		});
		const res = await req.json();
		this.line = [];
	}

	componentDidMount() {
		//Here we set up the properties of the canvas element. 
		this.canvas.width = 900;
		this.canvas.height = 600;
		this.ctx = this.canvas.getContext('2d');
		this.ctx.lineJoin = 'round';
		this.ctx.lineCap = 'round';
		this.ctx.lineWidth = 5;
	}

	clear() {
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	render() {
		return (
			<div style={{position:'relative'}}>
				<canvas style={{right: 0}} className='paint-window'
				//We use the ref attribute to get direct access to the canvas element. 
				ref={(ref) => (this.canvas = ref)}
				style={{ background: 'black'}}
				onMouseDown={this.onMouseDown}
				onMouseLeave={this.endPaintEvent}
				onMouseUp={this.endPaintEvent}
				onMouseMove={this.onMouseMove}
				onContextMenu={this.onContextMenu}
				onTouchStart={this.onTouchStart}
				onTouchCancel={this.endPaintEvent}
				onTouchMove={this.onTouchMove}
				/>
				<button onClick={this.clear} className='clear-button'>Clear</button>
			</div>
		);
	}
}

export default Canvas;

