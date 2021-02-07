import React from "react";
import ReactDOM from "react-dom";
import {Router,Switch,Route} from "react-router-dom";
import App from './App';
import Blocks from './Blocks.js';
import history from './history.js';
import ConductTransaction from './ConductTransaction.js';
import TransactionPoolMap from './TransactionPoolMap';


ReactDOM.render(
                <Router history={history}>
                    <Switch>
                        <Route path="/blocks" component={Blocks} />
                        <Route exact={true} path="/" component={App} />
                        <Route exact={true} path="/conduct-transaction" component={ConductTransaction} />
                        <Route exact={true} path="/transaction-pool" component={TransactionPoolMap} />
                    </Switch>
                </Router>,document.getElementById("root"));


//Router component is the parent component for the overall react router behavior
//Switch is the direct child of the router component collects the vaiours routes held by the route component
//Route component helps us to match endpoints on the front end with our components 