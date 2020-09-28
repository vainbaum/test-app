import React, {Fragment, Component} from 'react';
import './App.css';
import Canvas from './canvas.js';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = { apiResponse: "" };
	}

	callAPI() {
		fetch("http://localhost:9000/testAPI")
			.then(res => res.text())
			.then(res => this.setState({ apiResponse: res }));
	}

	componentWillMount() {
		this.callAPI();
	}

	render(){
		return (
			<div className="App">
			<header>
				<h1>We now have Auth!</h1>
			</header>
			<AmplifySignOut />
			<p className="App-intro">{this.state.apiResponse}</p>
			<Fragment>
				<h3 style={{ textAlign: 'center' }}>Dos Paint</h3>
				<div className="main">
					<div className="color-guide">
						<h5>Color Guide</h5>
						<div className="user user">User</div>
					</div>
					<Canvas />
				</div>
			</Fragment>
			</div>
		);
	}
}

export default App;
