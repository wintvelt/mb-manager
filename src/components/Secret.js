//Semi secret page, playground for new stuff
import React from 'react';
import { connect } from "react-redux";
import { login, logout, doSnack } from "../store/actions";
import { batchLedgerUpdate } from "../store/batchActions";
import { getContacts } from '../store/apiActions';
import { FileZone } from '../constants/file-helpers';

function mapDispatchToProps(dispatch) {
  return {
    login: () => dispatch(login()),
    logout: () => dispatch(logout()),
    doSnack: (newSnack) => dispatch(doSnack(newSnack)),
    batchLedgerUpdate: (list) => dispatch(batchLedgerUpdate(list)),
    getContacts: () => dispatch(getContacts())
  };
}

function mapStateToProps(state) {
  return { 
  	counter : state.counter,
  	contacts : state.contacts
  };
}

const buttons = ["Test2", "Test3", "Test4", ""];

const testBatch = [
	{ incomingId: "243603922888950994", newLedgerName: "Algemene kosten"},
	{ incomingId: "243603935219156242", newLedgerName: "Algemene kosten"},
	{ incomingId: "243687580448589544", newLedgerName: "Algemene kosten"}
];

const ConnectedHome = (props) => {
	return (
	    <div className="container">
			<div className="row">
				<h5>Inhoud enzo</h5>
			</div>
	      	<div className="row">
		    	<h5>Test snackbar</h5>
			    {buttons.map( (snack, index) => {
				    	return <span className="btn waves-effect waves-light" 
				    		style={{marginRight: "4px"}}
				    		key={snack} 
				    		onClick={() => props.doSnack(snack)}>{snack}</span>
				    })}
		  	</div>
		    <div className="row">
		    	<h5>Test Login</h5>
		    	<span className="btn" onClick={props.login} style={{marginRight: "4px"}}>Login</span>
		    	<span className="btn" onClick={props.logout}>Logout</span>
			</div>
			<div className="divider"></div>
			<div className="row">
				<h6>Voor testing..</h6>
				<span className="btn" onClick={() => props.batchLedgerUpdate(testBatch)}>Test Batch</span>
				<span className="btn" onClick={() => props.getContacts()}>Get contacts</span>
				<p>{(props.contacts)?props.contacts.length:0} contacten bekend</p>
			</div>
			<div className="divider"></div>
			<div className="row">
				<h6>File Load testing..</h6>
				<p><span className="btn" onClick={() => console.log('click!!')}>Get File</span></p>
				<FileZone />
			</div>

		</div>
	);
}

const Secret = connect(mapStateToProps,mapDispatchToProps)(ConnectedHome);


export default Secret;