// Sidenavigation for filters and actions

import React, { Component } from 'react';

export class SideNavWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = { sideNavOpen : true };

        this.toggleSideNav = this.toggleSideNav.bind(this);
    }

    toggleSideNav() {
        this.setState({ sideNavOpen: !this.state.sideNavOpen })
    }

    render() {
        const { children } = this.props;
  
        const childrenWithProps = React.Children.map(children, child =>
          React.cloneElement(child, { sideNavOpen: this.state.sideNavOpen, toggleSideNav: this.toggleSideNav })
        );
    
        return <div style={{position: 'relative'}}>{childrenWithProps}</div>
    }
}

export const SideNav = (props) => {
    const icon = (props.sideNavOpen)? "chevron_left" : "menu";
    const sideStyle = (props.sideNavOpen)? "translateX(0%)" : "translateX(-100%)";
    return (
        <div className="sidenav" style={{transform: sideStyle}}>
            <ul>
                {props.children}
            </ul>
            <div className="btn-small waves-effect waves-light grey btn-sidenav" onClick={props.toggleSideNav}>
                <i className="material-icons">{icon}</i>
            </div>
        </div>
    );
}

export const MainWithSideNav = (props) => {
    const mainClass = (props.sideNavOpen)? "container main-with-sidenav move" : "container main-with-sidenav";
    return <div className={mainClass}>{props.children}</div>
}

export class SideNavDropDown extends Component {
	constructor(props) {
		super(props);
		this.state = { menuOpen : true };
		this.toggleMenu = this.toggleMenu.bind(this);
	}
	toggleMenu() {
		this.setState({ menuOpen : !this.state.menuOpen})
	}
	render() {
        const menuIcon = (this.state.menuOpen)? "keyboard_arrow_up" : "keyboard_arrow_down";
        const listClass = (this.state.menuOpen)? "sidenav-dropdown" : "sidenav-dropdown hidden";

        return (
            <li>
                <div className="clickable" onClick={this.toggleMenu}>
                    <i className="material-icons">{this.props.icon}</i>
                    <span>{this.props.title}</span>
                    <div className="chip">{this.props.chip}</div>
                    <i className="material-icons icon-right">{menuIcon}</i>
                </div>
                <ul className={listClass}>
                    {this.props.children}
                </ul>
            </li>
        );
    }    
};