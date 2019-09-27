import React from 'react';
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import '../css/App.css';

import Nav from './Nav';
import NewNav from './Nav/Nav';
import Snackbar from './Snackbar';
import Connection from './Connection';
import Contacts from './Contacts';
import ContactKeywords from './Contacts-Keywords';
import Incoming from './Incoming';
import Payments from './Payments/Payments';
import Received from './Received';
import MatchBankTransactions from './Match';
import Export from './Export';
import Bankmutations from './Bankmutations';
import Secret from './Secret';
import Home from './Home';

import { ThemeProvider } from '@material-ui/styles';
import Fab from '@material-ui/core/Fab';
import Icon from '@material-ui/core/Icon';
import ScrollTop from './Nav/ScrollTop';
import { createMuiTheme } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import teal from '@material-ui/core/colors/teal';

function mapStateToProps(state) {
	return {
		newSnack: state.newSnack,
		isConnected: (state.accessToken) ? true : false
	}
}

const theme = createMuiTheme({
	palette: {
		primary: {
			main: teal[500]
		},
		secondary: {
			main: blueGrey[200]
		}
	},
	// overrides: {
	//     'MuiContainer': {
	//         root: {
	//             background: '#18202c',
	//         }
	//     }
	// },
});

const NavRoute = (props) => {
	return <Route render={(routeprops) => {
		return (routeprops.location.pathname === '/betalingen/lijst') ?
			<NewNav activePath={routeprops.location.pathname}>
				<Switch>
					<PrivateRoute exact path="/betalingen/lijst" component={Payments}
						isConnected={props.isConnected} />
				</Switch>
			</NewNav>
			: <Nav activePath={routeprops.location.pathname} />
	}} />

}

const Dummy= (props) => <></>

const ConnectedApp = (props) => {
	let snackFromStore = props.newSnack;
	// only goes to /secret path in non-production environments
	let secretPath = (process.env.NODE_ENV !== 'production') ? '/secret' : '/';
	return (
		<ThemeProvider theme={theme}>
			<Router>
				<NavRoute {...props} />
				<Switch>
					<Route exact path="/" component={Home} />
					<PrivateRoute exact path="/contacten/lijst" component={Contacts}
						isConnected={props.isConnected} />
					<PrivateRoute exact path="/contacten/keywords" component={ContactKeywords}
						isConnected={props.isConnected} />
					<PrivateRoute path="/inkomend" component={Incoming}
						isConnected={props.isConnected} />
					<PrivateRoute exact path="/betalingen/lijst" component={Dummy}
						isConnected={props.isConnected} />
					<PrivateRoute exact path="/betalingen/match" component={MatchBankTransactions}
						isConnected={props.isConnected} />
					<PrivateRoute path="/export" component={Export}
						isConnected={props.isConnected} />
					<Route exact path="/connection" component={Connection} />
					<Route exact path="/bankmutations" component={Bankmutations} />
					<Route exact path={secretPath} component={Secret} />
					<Route render={(routeprops) => {
						const newSnack = "De pagina \"" +
							routeprops.location.pathname +
							"\" bestaat helaas (nog) niet. Gelukkig is er al genoeg anders te doen.";
						return <Redirect to={{
							pathname: "/", state: {
								newSnack: newSnack
							}
						}} />
					}
					} />
				</Switch>
				<Route render={(propsFromRoute) => {
					const newSnackFromRoute =
						(propsFromRoute.location.state) ? propsFromRoute.location.state.newSnack : null;
					return <Snackbar newSnack={snackFromStore} newSnackFromRoute={newSnackFromRoute} />
				}
				} />
			</Router>
			<ScrollTop>
				<Fab color="secondary" size="small" aria-label="scroll back to top">
					<Icon>keyboard_arrow_up</Icon>
				</Fab>
			</ScrollTop>
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

const App = connect(mapStateToProps)(ConnectedApp);

export default App;

export { App };