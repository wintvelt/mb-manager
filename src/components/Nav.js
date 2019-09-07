// Navigation Bar with Snackbar

import React from "react";
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

const menu = [
	{ path: "/contacten", link: "/contacten/lijst", text: "Contacten" },
	{ path: "/inkomend", text: "Inkomend" },
	{ path: "/betalingen", link: "/betalingen/match", text: "Betalingen" },
	{ path: "/export", text: "Export" },
	{ path: "/bankmutations", text: "Transacties", badge: "NIEUW" }
];

const subMenusFor = (activePath) => {
	const pathMenu = activePath.slice(1).split('/')[0];
	switch (pathMenu) {
		case 'contacten':
			return [
				{ path: '/contacten/lijst', text: 'Lijst' },
				{ path: '/contacten/keywords', text: 'Keywords', badge: 'NIEUW' },
			]

		case 'betalingen':
			return [
				{ path: '/betalingen/lijst', text: 'Lijst' },
				{ path: '/betalingen/match', text: 'Matchen', badge: 'NIEUW' },
			]
		default:
			return [];
	}
}

const mapStateToProps = state => {
	return {
		accessToken: state.accessToken,
		accessVerified: state.accessVerified
	};
};

const ConnectedNav = (props) => {
	const iconLogin = (props.accessToken.hasData) ? (props.accessVerified) ? "done_all" : "done" : "do_not_disturb";
	const menuShow = (props.accessToken.hasData) ? "" : " hide";
	const subMenus = subMenusFor(props.activePath);
	return (
		<nav className="nav-extended" style={{ marginBottom: "32px" }}>
			<div className="nav-wrapper">
				<ul className="right">
					<li><Link to="/connection">
						<i className="material-icons left small">{iconLogin}</i>
						<span>Connectie</span>
					</Link></li>
				</ul>
				<ul id="nav_mobile" className="left">
					<li><Link to="/"><i className="material-icons">home</i></Link></li>
					{menu.map((menuItem) => {
						return ActiveLink(menuItem, menuShow, props.activePath)
					})}
				</ul>
			</div>
			{(subMenus.length > 0) ?
				<div className="nav-content">
					<ul className="tabs tabs-transparent">
						{subMenus.map((menuItem) => {
							return ActiveLink(menuItem, 'tab', props.activePath, 1);
						})}
					</ul>
				</div>
				: <></>
			}
		</nav>
	);
};

const ActiveLink = (menuItem, className, activePath, level = 0) => {
	let linkClass = (className) ? (className) + " " : "";
	const activeMenuItem = activePath.slice(1).split('/')[level];
	const linkTo = menuItem.link || menuItem.path;
	const curMenu = linkTo.slice(1).split('/')[level];
	linkClass = (curMenu === activeMenuItem) ? linkClass + "active" : linkClass;
	return (
		<li key={menuItem.path} className={linkClass}>
			{(menuItem.badge) ?
				<Link to={linkTo}>{menuItem.text}
					<span className="new badge" data-badge-caption={menuItem.badge}></span>
				</Link>
				:
				<Link to={linkTo}>{menuItem.text}</Link>
			}
		</li>
	);

}

const Nav = connect(mapStateToProps)(ConnectedNav);

export default Nav;