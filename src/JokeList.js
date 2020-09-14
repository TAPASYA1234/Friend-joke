import React, { Component } from 'react';
import axios from "axios";
import "./JokeList.css";
import Joke from './Joke';
import uuid from "uuid/v4";


class JokeList extends Component {
    static defaultProps = {
        numJokesToGet: 10
    };
    constructor(props) {
        super(props);
        this.state = {
          jokes:  JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
          };
         this.seenJokes = new Set(this.state.jokes.map(j => j.text));
         console.log(this.seenJokes);
        this.handleClick = this.handleClick.bind(this);
        };
    
     componentDidMount() {
        if(this.state.jokes.length === 0) this.getJokes();
    }


    async getJokes(){
        try{        
        let jokes = [];
        while (jokes.length < this.props.numJokesToGet) {    
            let res = await axios.get("http://icanhazdadjoke.com/", {
                headers: { Accept: 'application/json' }
            });
            let newJoke = res.data.joke;
            if(!this.seenJokes.has(newJoke)){
            jokes.push({id:uuid(), text : newJoke, votes:0});
            } else{
                console.log("found duplicate");
                console.log(newJoke);
            }
        }
        this.setState(st => ({
            loading:false,
            jokes: [...st.jokes, ...jokes]
        }),
        ()=> window.localStorage.setItem("jokes" , JSON.stringify(this.state.jokes))
        
        );
       
        }catch(err){
            alert(err);
            this.setState({loading:false});
        }
    }
        //loadjokes
    
    handleVote(id,delta){
        this.setState(
            st => ({
                jokes: st.jokes.map(j =>
                    j.id === id ? {...j,votes:j.votes+delta}:j)}
            ),
            ()=> window.localStorage.setItem("jokes" , JSON.stringify(this.state.jokes))
        );
    }
    handleClick(){
        this.setState({ loading: true}, this.getJokes);
        
    }
    render() {
        if(this.state.loading){
            return(
            <div className="JokeList-spinner" >
              <i className="far fa-8x fa-laugh fa-spin" />
              <h1 className="JokeList-title" >loading</h1>
            </div>
            );
        }
        let jokes = this.state.jokes.sort((a,b) => b.votes-a.votes);
        return (
            <div className="JokeList" >
                <div className="JokeList-sidebar">

                    <h1 className="JokeList-title"  >
                        <span>Friend</span> Jokes</h1>
                    <img height="25%" src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQgsPscT_UuQopxocyjCotwP14UAhLzQthBSw&usqp=CAU" />

                    <button className='JokeList-getmore'
                    onClick={this.handleClick} >
                        new Jokes
                    </button>

                </div>

                <div className="JokeList-jokes">
                    {jokes.map(j => (
                       <Joke 
                       key={j.id} 
                       votes={j.votes} 
                       text={j.text} 
                       upvote={() =>
                         this.handleVote(j.id,1) }
                       downvote={() => this.handleVote(j.id,-1)}
                       />
                    ))}
                </div>
            </div>
        )
    }
}
export default JokeList;