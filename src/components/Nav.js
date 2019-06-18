// Navigation Bar with Snackbar

import React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';


const mapStateToProps = state => {
  return { 
	  accessObject : state.accessObject,
	  accessVerified : state.accessVerified
  };
};

const ConnectedNav = (props) => {
	const iconLogin = (props.accessObject) ? (props.accessVerified) ? "done_all" : "done" : "close"; 
	const menuShow = (props.accessObject)? "" : " hide";
	const menu = [
		{ path: "/contacten", text: "Contacten" },
		{ path: "/inkomend", text: "Inkomend" },
		{ path: "/betalingen", text: "Betalingen" },
		{ path: "/taken", text: "Taken" }
	]
	return (
		<nav className="nav-extended" style={{marginBottom: "32px"}}>
		    <div className="nav-wrapper">
		      <ul className="right">
		        <li><Link to="/connection">
		          <i className="material-icons left small">{iconLogin}</i>
		          <span>Connectie</span>
		        </Link></li>
		      </ul>
		      <ul id="nav_mobile" className="left">
		      	<li><Link to = "/"><i className="material-icons">home</i></Link></li>
		      	{menu.map((link) => {
		      		return ActiveLink(link, menuShow, props.activePath)
		      	})}
		      </ul>
		    </div>
		</nav>
	);
};

/* SUBTABS
		    <div className="nav-content">
		      <ul className="tabs tabs-transparent">
		        <li className="tab"><a href="#test1">Test 1</a></li>
		        <li className="tab"><a className="active" href="#test2">Test 2</a></li>
		        <li className="tab disabled"><a href="#test3">Disabled Tab</a></li>
		        <li className="tab"><a href="#test4">Test 4</a></li>
		        <li className="indicator" style={{left: "0px", right: "75%"}}></li>
		      </ul>
		    </div>
*/

const ActiveLink = (link, className, activePath) => {
	var linkClass = (className)? (className) + " " : "";
	linkClass = (link.path === activePath)? linkClass+"active" : linkClass;
	return <li key={link.path} className={linkClass}><Link to ={link.path}>{link.text}</Link></li> 

}

const Nav = connect(mapStateToProps)(ConnectedNav);

export default Nav;