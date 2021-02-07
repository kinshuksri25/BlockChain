import React,{Component} from "react";
import {Link} from "react-router-dom";
import Block from "./Block.js";

class Blocks extends Component{
    state = {blocks:[]};

    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks`)
        //the response that we get from the server returns a json we use the available json function with is a promise to give us the value
        .then((response)=>response.json())
        .then(responseJSON =>{
            this.setState({blocks : [...responseJSON]});
        });
    }

    render(){
        return(
                <div>
                    <div><Link to="/">Home</Link></div>
                    <br/>
                    <h3>Blocks</h3>
                    {
                        this.state.blocks.map(block =>{
                            return(<Block key={block.hash} block={block}/>)
                        })
                    }
                </div>);        
    }
}

export default Blocks;