import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import '../css/App.css';

import NewNav from './Nav/Nav';
import Home from './Home/Home';
import Connection from './Connection/Connection';
import Contacts from './Contacts/Contacts';
import Incoming from './Incoming/Incoming';
import Payments from './Payments/Payments';
import Export from './Export/Export';
import BankUpload from './BankUpload/BankUpload';
import Match from './Match/Match';

import { DO_SNACK } from '../store/action-types';

import { ThemeProvider } from '@material-ui/styles';
import Fab from '@material-ui/core/Fab';
import Icon from '@material-ui/core/Icon';
import ScrollTop from './Nav/ScrollTop';
import { createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import teal from '@material-ui/core/colors/teal';
import blue from '@material-ui/core/colors/blue';
import { SnackbarProvider } from '../../node_modules/notistack/build/index';
import Notifier from '../helpers/snackbar/Notifier';
import Revenues from './Revenues/Revenues';

const theme = createMuiTheme({
	palette: {
		primary: {
			main: teal[500]
		},
		secondary: {
			main: blueGrey[500]
		},
		background: {
			default: blueGrey[50]
		}
	},
	overrides: {
		'MuiLink': {
			root: {
				color: blue.A400,
			}
		},
		'MuiDialog': {
			paper: {
				overflowY: 'visible',
			}
		},
		'MuiDialogContent': {
			root: {
				overflowY: 'visible',
			}
		},
		'MuiButton': {
			label: {
				whiteSpace: 'nowrap'
			}
		},
		'MuiChip': {
			sizeSmall: {
				height: '23px',
				marginLeft: '8px',
				marginBottom: '1px'
			}
		},
		'MuiTableCell': {
			sizeSmall: {
				padding: '16px 0px 16px 16px'
			}
		},
		'MuiTableSortLabel': {
			icon: {
				marginLeft: 0,
				marginRight: 0
			}
		},
		'MuiExpansionPanelSummary': {
			root: {
				minHeight: '64px'
			}
		}
	},
});

const NavRoute = (props) => {
	const { isConnected } = props;
	const dispatch = useDispatch();
	return <Route render={(routeprops) => {
		return <NewNav activePath={routeprops.location.pathname}>
			<Switch>
				<Route exact path="/" component={Home} />
				<PrivateRoute exact path="/betalingen/uitgaven" component={Payments}
					isConnected={isConnected} />
				<PrivateRoute exact path="/betalingen/match" component={Match}
					isConnected={isConnected} />
				<PrivateRoute exact path="/inkomend" component={Incoming}
					isConnected={isConnected} />
				<PrivateRoute exact path="/contacten" component={Contacts}
					isConnected={isConnected} />
				<PrivateRoute path="/export" component={Export}
					isConnected={isConnected} />
				<PrivateRoute path="/bankupload" component={BankUpload}
					isConnected={isConnected} />
				<PrivateRoute path="/revenues" component={Revenues}
					isConnected={isConnected} />
				<Route exact path="/connection" component={Connection} />
				<Route render={(routeprops) => {
					const newSnack = "De pagina \"" +
						routeprops.location.pathname +
						"\" bestaat helaas (nog) niet. Gelukkig is er al genoeg anders te doen.";
					dispatch({ type: DO_SNACK, payload: newSnack })
					return <Redirect to={{
						pathname: "/connection", state: {
							newSnack: newSnack
						}
					}} />
				}} />
			</Switch>
		</NewNav>
	}} />

}

const App = (props) => {
	const [isConnected] = useSelector(store => [
		store.accessToken.toJS().hasData
	])
	// only goes to /secret path in non-production environments
	return (
		<ThemeProvider theme={theme}>
			<SnackbarProvider maxSnack={4}>
				<Notifier />
				<Router>
					<NavRoute {...props} isConnected={isConnected} />
				</Router>
				<ScrollTop>
					<Fab color="secondary" size="small" aria-label="scroll back to top">
						<Icon>keyboard_arrow_up</Icon>
					</Fab>
				</ScrollTop>
			</SnackbarProvider>
		</ThemeProvider>
	);
}

function PrivateRoute({ isConnected, component: Component, ...rest }) {
	return (
		<Route
			{...rest}
			render={props =>
				isConnected ? (
					<Component {...props} />
				) : (
						<Redirect
							to={{
								pathname: "/connection",
								state: { newSnack: "Sorry, je moet eerst connectie maken." }
							}}
						/>
					)
			}
		/>
	);
}

export default App;

export { App };