import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import { Provider } from "react-redux";
import { storeWithInit } from "./store/index";
import App from './components/App';
import * as serviceWorker from './serviceWorker';

import { getCookie } from "./actions/cookies";
import { initialState } from './reducers/reducers';

const initFromCookie = () => {
	const cookie = getCookie();
	return Object.assign({}, initialState, { accessObject : cookie, isConnected : (cookie)? true : false })
}

ReactDOM.render(
	<Provider store={storeWithInit(initFromCookie())}>
		<App />
	</Provider>, 
	document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
