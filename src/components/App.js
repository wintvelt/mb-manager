import React from 'react';
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import '../css/App.css';

import Nav from './Nav';
import Snackbar from './Snackbar';
import Connection from './Connection';
import Contacts from './Contacts';
import Incoming from './Incoming';
import Received from './Received';
import Export from './Export';
import Bankmutations from './Bankmutations';
import Secret from './Secret';
import Home from './Home';

function mapStateToProps(state) {
	return {
		newSnack : state.newSnack,
		isConnected : (state.accessToken)? true : false
	}
}

const ConnectedApp = (props) => {
	let snackFromStore = props.newSnack;
	// only goes to /secret path in non-production environments
	let secretPath = (process.env.NODE_ENV !== 'production')? '/secret' : '/';
	return (
		<Router>
			<div>
			    <Route render = {(routeprops) => {
			    	return <Nav activePath = {routeprops.location.pathname}/>
			    }}/>
			    <Switch>
			    	<Route exact path="/" component={Home} />
				    <PrivateRoute exact path="/contacten/lijst" component={Contacts} 
				    	isConnected={props.isConnected}/>
				    <PrivateRoute path="/inkomend" component={Incoming} 
				    	isConnected={props.isConnected}/>
				    <PrivateRoute path="/betalingen" component={Received} 
				    	isConnected={props.isConnected}/>
				    <PrivateRoute path="/export" component={Export} 
				    	isConnected={props.isConnected}/>
					<Route exact path="/connection" component={Connection} />
					<Route exact path="/bankmutations" component={Bankmutations} />
					<Route exact path={secretPath} component={Secret} />
			    	<Route render={(routeprops) => 
			    		{ 
			    			const newSnack = "De pagina \"" + 
			    				routeprops.location.pathname + 
			    				"\" bestaat helaas (nog) niet. Gelukkig is er al genoeg anders te doen.";
			    			return <Redirect to={{pathname:"/", state:{
			    				newSnack:newSnack
			    			}}}/> 
			    		}
			    	}/>
			    </Switch>
			    <Route render={(propsFromRoute) => 
			    	{ 
			    		const newSnackFromRoute = 
			    		(propsFromRoute.location.state)?propsFromRoute.location.state.newSnack : null;
			    		return <Snackbar newSnack={snackFromStore} newSnackFromRoute={newSnackFromRoute} />
			    	}
			    }/>
			</div>
	    </Router>
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
