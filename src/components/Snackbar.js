// Navigation Bar with Snackbar

import React, { Component } from "react";

const addSnack = (snacks, newSnack, closeSnack) => {
	if ( newSnack && snacks.indexOf(newSnack) === -1) {
		setTimeout(() => {
			closeSnack(newSnack);
		},10000);
		return [...snacks, newSnack];
	} else {
		return snacks;
	}
}

class Snackbar extends Component {
	constructor(props) {
		super(props);

		this.closeSnack = this.closeSnack.bind(this);

		var snacks = addSnack([], props.newSnack, this.closeSnack);
		snacks = addSnack(snacks, props.newSnackFromRoute, this.closeSnack);
		this.state = { 
			snacks : snacks,
			snackbarOpen : (snacks.length > 0)? true : false 
		};

	}

	// if prop did change AND prop not yet in state, then add new snack
	componentDidUpdate(prevProps, prevState) {
		var snacks = prevState.snacks;
		if (this.props.newSnack !== prevProps.newSnack) { 
			snacks = addSnack(snacks, this.props.newSnack, this.closeSnack);
		}
		if (this.props.newSnackFromRoute !== prevProps.newSnackFromRoute) { 
			snacks = addSnack(snacks, this.props.newSnackFromRoute, this.closeSnack);
		}
		if (snacks !== prevState.snacks) {
			this.setState({ 
				snacks : snacks,
				snackbarOpen : true
			})
		}
	}

	closeSnack(snack) {
		const snacks = takeout(this.state.snacks,snack);
		this.setState({
			snacks : snacks,
			snackbarOpen : (snacks.length > 0)? true : false
		});
	}

	render() {
		const snackbarOpen = this.state.snackbarOpen? "container" : "container hide";
		return (
			<div className={snackbarOpen} 
				style={{position: "fixed", width: "100%", top: "64px", zIndex: "1000"}}>
			<div className="container">
				{this.state.snacks.map((snack, index) => Snack(snack, index, this.closeSnack))}
				</div>
			</div>
		);
	}
};

const Snack = (snack, index, closeSnack) => {
	return (
	    <div key={snack} className="card row s12">
	      <div className="card-content blue-grey darken-1 white-text" style={{padding: "16px"}}>
	          	<span className="btn-flat right" onClick={() => closeSnack(snack)} 
	          		style={{ padding: 0, lineHeight: '20px'}}>
	          		<i className="material-icons white-text">close</i>
	      		</span>
	          	<span>{snack}</span>
	      </div>
	    </div>
    );
}

const takeout = (arr, text) => {
	const index = arr.indexOf(text);
	const l = arr.length - 1;
	if (index === -1) { return arr }
	else if (l === -1) { return [] }
	else if (index === l) { return arr.slice(0,-1) }
	else if (index === 0) { return arr.slice(1) }
	else { return arr.slice(0,index).concat(arr.slice(index+1)) }
}

export default Snackbar;