import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import { Provider } from "react-redux";
import { storeWithInit } from "./store/index";
import App from './components/App';
import * as serviceWorker from './serviceWorker';

import { getCookie } from "./store/cookies";
import { initialState } from './store/reducers';
import { apiActionManual, apiUpdate } from './helpers/apiData/apiData';

const initFromCookie = () => {
	const accessFromCookie = getCookie('MB_access');
	// const timeFromCookie = getCookie('MB_time');
	return accessFromCookie ?
		{
			...initialState,
			accessToken: apiUpdate(initialState.accessToken, apiActionManual({ data: accessFromCookie }))
		}
		: initialState;
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
