// Connection.js
// for connecting to Moneybird

import React, { Component } from 'react';
import { connect } from "react-redux";
import { setAccess, getRequestToken, testAccess } from "../../actions/apiActions";
import { logout } from "../../actions/actions";
import { paramToObj } from "../../constants/helpers";
import ConnectCard from './ConnectCard';
import { deleteCookie } from '../../store/cookies';


const mapStateToProps = state => {
    return {
        accessToken: state.accessToken,
        accessVerified: state.accessVerified,
        accessTime: state.accessTime,
        testOutput: state.testOutput
    };
};

function mapDispatchToProps(dispatch) {
    return {
        setAccess: (reqToken) => dispatch(setAccess(reqToken)),
        testAccess: () => dispatch(testAccess()),
        logout: () => dispatch(logout())
    };
}

class ConnectionInt extends Component {
    constructor(props) {
        super(props);

        this.state = { requestToken: "" }

        this.onChange = this.onChange.bind(this);
        this.onLogout = this.onLogout.bind(this);
    }

    onChange(e) {
        this.setState({ requestToken: e.target.value });
    }

    onLogout(e) {
        deleteCookie();
		this.props.logout();
	}

    static getDerivedStateFromProps(props, state) {
        const code = paramToObj(props.location.search).code;
        if (state.requestToken === code) return { requestToken: "" };
        return { requestToken: code };
    }

    render() {
        const reqToken = this.state.requestToken;
        const hasAccess = (this.props.accessToken.hasData) ? true : false;
        const hasReqToken = (reqToken && reqToken.length > 0) ? true : false;
        const accessVerified = this.props.accessVerified;
        const buttonList = hasAccess ?
            [
                { key: 'verifyConnection', title: 'Verifeer connectie', action: this.props.testAccess },
                { key: 'login', title: 'Log opnieuw in', action: getRequestToken },
                { key: 'logout', title: 'Uitloggen', action: this.onLogout },
            ]
            : hasReqToken ?
                [
                    { key: 'verifyLogin', title: 'Verifieer', action: () => this.props.setAccess(reqToken) },
                    { key: 'login', title: 'Log opnieuw in', action: getRequestToken }
                ]
                : [{ key: 'login', title: 'Log in', action: getRequestToken }];

        return <ConnectCard
            hasAccess={hasAccess} hasReqToken={hasReqToken} accessVerified={accessVerified}
            buttonList={buttonList} />
    }
}

const Connection = connect(mapStateToProps, mapDispatchToProps)(ConnectionInt);

export default Connection;