// Connection.js
// for connecting to Moneybird - new

import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { setAccess, getRequestToken, getAccounts } from "../../actions/apiActions-new";
import { LOGOUT } from "../../store/action-types";
import { paramToObj } from "../../constants/helpers";
import ConnectCard from './ConnectCard';
import { deleteCookie } from '../../store/cookies';
import { hasData } from '../../store/derived-storestate-helpers';

const Connection = props => {
    const [accessToken, accessVerified] = useSelector(store => (
        [store.accessToken.toJS(), hasData(store)]
    ));
    const dispatch = useDispatch();
    const onLogout = (e) => {
        deleteCookie();
        dispatch({ type: LOGOUT });
        // window.location.href = props.location.pathname;
        props.history.replace(props.location.pathname, {});
    }

    const doAction = action => e => {
        dispatch(action)
    }

    const tokenFromUrl = paramToObj(props.location.search).code;

    const hasAccess = (accessToken.hasData) ? true : false;
    const access_token = accessToken.data;
    const hasReqToken = (tokenFromUrl && tokenFromUrl.length > 0) ? true : false;
    const buttonList = hasAccess ?
        [
            {
                key: 'verifyConnection', title: 'Verifeer connectie',
                action: e => {
                    doAction(getAccounts(access_token))(e)
                }
            },
            { key: 'login', title: 'Log opnieuw in', action: getRequestToken },
            { key: 'logout', title: 'Uitloggen', action: onLogout },
        ]
        : hasReqToken ?
            [
                { key: 'verifyLogin', title: 'Verifieer', action: doAction(setAccess(tokenFromUrl)) },
                { key: 'login', title: 'Log opnieuw in', action: getRequestToken }
            ]
            : [{ key: 'login', title: 'Log in', action: getRequestToken }];

    return <ConnectCard
        hasAccess={hasAccess} hasReqToken={hasReqToken} accessVerified={accessVerified}
        buttonList={buttonList} />
}

export default Connection;