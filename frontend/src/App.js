import React,{Component} from "react";
import {Link} from 'react-router-dom'; //we use this component because it will navigate without refreshing the window whereas anchor tag will refresh
import logo from "../assests/logo.png";
import "./index.css";

class App extends Component {
    state = {walletInfo:{}};

    componentDidMount(){
        fetch(`${document.location.origin}/api/wallet-info`)
        //the response that we get from the server returns a json we use the available json function with is a promise to give us the value
        .then((response)=>response.json())
        .then(responseJSON =>{
            this.setState({walletInfo : {...responseJSON}});
        });
    }

    render(){
        const {address,balance} = this.state.walletInfo;
        return(<div className = "App">
                    <img src={logo} className="logo"></img>
                    <br/>
                    <div>Welcome to the Blockchain...</div>
                    <br/>
                    <div><Link to="/blocks">Blocks</Link></div>
                    <div><Link to="/conduct-transaction">Conduct a Transaction</Link></div>
                    <div><Link to="/transaction-pool">Transaction Pool</Link></div>
                    <br/>
                    <div className="WalletInfo">
                        <div>Address: {address}</div>
                        <div>Balance: {balance}</div>
                    </div>
                </div>);
    }
}

export default App;