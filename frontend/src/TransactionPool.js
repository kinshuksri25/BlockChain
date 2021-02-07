import React,{Component} from "react";
import {Button} from "react-bootstrap";
import Transaction from './Transaction.js';
import {Link} from 'react-router-dom';
import history from './history.js';

const POLL_INTERVAL_MS = 10000;

class TransactionPool extends Component {
    state = {transactionPoolMap:{}};

    fetchTransactionPoolMap = () =>{
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        //the response that we get from the server returns a json we use the available json function with is a promise to give us the value
        .then((response)=>response.json())
        .then(responseJSON =>{
            this.setState({transactionPoolMap : {...responseJSON}});
        });
    }

    componentDidMount(){
        this.fetchTransactionPoolMap();

        this.fetchPoolMapInterval = setInterval(()=>{
            this.fetchTransactionPoolMap();
        },POLL_INTERVAL_MS);
    }

    componentWillUnmount(){
        clearInterval(this.fetchPoolMapInterval);
    }

    fetchMineTransactions = () =>{
        fetch(`${document.location.origin}/api/mine-transactions`)
        //the response that we get from the server returns a json we use the available json function with is a promise to give us the value
        .then(response =>{
            if(response.status === 200){
                alert('Success');
                history.push("/blocks");
            }else{
                alert("Mining failed");
            }
        });
    }

    render(){
        return(
            <div className="TransactionPoolMap">
                <div><Link to="/">Home</Link></div>
                <br/>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction =>{
                        return (
                           <div key={transaction.id}>
                               <hr/>
                                <Transaction transaction={transaction}/>
                           </div> 
                        )
                    })
                }
                <hr/>
                <Button vairant="danger" onClick={this.fetchMineTransactions}>Mine</Button>
            </div>
        );
    }
}

export default TransactionPool;