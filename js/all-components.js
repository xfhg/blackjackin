/**
 * All components living under one roof for now.
 * TODO: Give them separate better homes :)
 */

var App = React.createClass({

    /* Mixins info right away */
    mixins: [CascadedMixin],

    getInitialState:function(){

        return {deck: [
            {v:11,f:"c1"},{v:2,f:"c2"},{v:3,f:"c3"},{v:4,f:"c4"},{v:5,f:"c5"},{v:6,f:"c6"},
            {v:7,f:"c7"},{v:8,f:"c8"},{v:9,f:"c9"},{v:10,f:"c10"},{v:10,f:"c11"},{v:10,f:"c12"},{v:10,f:"c13"},
            {v:11,f:"h1"},{v:2,f:"h2"},{v:3,f:"h3"},{v:4,f:"h4"},{v:5,f:"h5"},{v:6,f:"h6"},
            {v:7,f:"h7"},{v:8,f:"h8"},{v:9,f:"h9"},{v:10,f:"h10"},{v:10,f:"h11"},{v:10,f:"h12"},{v:10,f:"h13"},
            {v:11,f:"s1"},{v:2,f:"s2"},{v:3,f:"s3"},{v:4,f:"s4"},{v:5,f:"s5"},{v:6,f:"s6"},
            {v:7,f:"s7"},{v:8,f:"s8"},{v:9,f:"s9"},{v:10,f:"s10"},{v:10,f:"s11"},{v:10,f:"s12"},{v:10,f:"s13"},
            {v:11,f:"d1"},{v:2,f:"d2"},{v:3,f:"d3"},{v:4,f:"d4"},{v:5,f:"d5"},{v:6,f:"d6"},
            {v:7,f:"d7"},{v:8,f:"d8"},{v:9,f:"d9"},{v:10,f:"d10"},{v:10,f:"d11"},{v:10,f:"d12"},{v:10,f:"d13"}
        ]

        };

    },

    /* Shuffle the deck before passing it to the tables */
    shuffleDeck : function(deck){
        return _.shuffle(_.shuffle(_.shuffle(_.shuffle(deck))));
    },

    /* At this point we will just render ONE table for you to catch up with the tutorial */
    /* We shuffle the deck and serve it to the table as a prop */
    render: function() {
        return (

            <Table deck={this.shuffleDeck(this.state.deck)}/>

        );
    }

});

/* Mixins Demo */
/* http://simblestudios.com/blog/development/react-mixins-by-example.html */
var UselessMixin = {
    componentDidMount: function () {
        console.log("Just mounted !");
    }
};

var CascadedMixin = {
    mixins: [UselessMixin]
};


/* We need cards, we got the images at the img/ directory and carefully named them the f value on the deck array */

var Card = React.createClass({

    render: function() {
        var bgUrl = (this.props.hidden)
            ? 'url(img/hidden.png)'
            : 'url(img/' + this.props.face + '.png)';
        /* in react we pass the css properties as an object with camelCase variables referring to the respective CSS variables */
        var cardStyle = {backgroundImage: bgUrl};

        return (
            <div className='card' style={cardStyle}/>
        );
    }

});


var Hand = React.createClass({

    getDefaultProps : function(){
        return {
            /* Default empty hand for the component */
            hand : [],
        }
    },
    render: function() {

        return (
            <div className='hand'>

                {/* Example on how to use an IF/ELSE statement inside the return (jsx) function */}
                {/* This will show an upside down card representing the deck on the dealer side of the table */}
                {this.props.showDeck ? <Card hidden={true}/> : ''}

                {/* here we iterate the hand array and serve the Card component with the card info */}
                {this.props.hand.map(function(card,i){
                    return <Card face={card.f} value={card.v} key={i}/>
                })}

            </div>
        );
    }

});

var Outcome = React.createClass({

    getDefaultProps : function(){
        return {
            status : "playing",
        }
    },
    render: function() {
        /* nothing fancy happening here , displaying a bootstrap alert representing the game status */
        switch(this.props.status) {
            case "playing":
                return (<div className="alert alert-info" role="alert">Hit or Stand</div>);
                break;
            case "win":
                return (<div className="alert alert-success" role="alert">Win Win Win</div>);
                break;
            case "lose":
                return (<div className="alert alert-danger" role="alert">You Lose</div>);
                break;
            default:
                return(<div className="alert alert-info" role="alert">Click Deal to Start ! </div>);
                break;
        }

    }

});

var Interface = React.createClass({

    getDefaultProps : function(){
        return {
            status : "new"
        }
    },

    render: function() {
        return (
            <div className='panel interface'>
                {/* Outcome component child of Interface */}
                <Outcome status={this.props.status}/>

                <div className="btn-group btn-group-justified" role="group" aria-label="score">
                    <a className="btn btn-default">Dealer Score : {this.props.dealerscore}</a>
                    <a className="btn btn-default">Player Score : {this.props.playerscore}</a>

                </div>
                <br/>

                <div className="btn-group btn-group-justified" role="group" aria-label="game">
                    <div className="btn-group" role="group">
                        {/* received as props to the Interface component the handleDeal function is now bound to the onClick event */}
                        <button onClick={this.props.deal} type="button" className="btn btn-info">Deal</button>
                    </div>
                    <div className="btn-group" role="group">
                        <button onClick={this.props.hit} type="button" className="btn btn-success">Hit</button>
                    </div>
                    <div className="btn-group" role="group">
                        <button onClick={this.props.stand} type="button" className="btn btn-danger">Stand</button>
                    </div>
                </div>

            </div>
        );
    }

});


var Table = React.createClass({

    getInitialState:function(){

        // table deck shuffle
        var shuffled = _.shuffle(this.props.deck);

        return {
            deck: shuffled,
        };

    },

    /* function to compute the hand score */
    handScore : function(hand){

        var score = _.sum(hand,'v');

        if(score > 21){
            //check for aces
            var aces = _.countBy(hand,{v:11}).true;
            while (score > 21 && aces > 0){
                score -= 10;
                aces -=1;
            }
        }

        return score;
    },

    /* function to handle the event of user clicking the Deal button */
    handleDealButton :function(){

        /* this variables are restrained to this closure and modifying state variables without the setState is prohibited */
        var deck        = this.state.deck;
        var playerhand  = [];
        var dealerhand  = [];

        //check deck size to see if we need to shuffle a new deck
        if(deck.length < 5){
            deck = _.shuffle(this.props.deck);
        }

        //player hand, deal 2 cards
        playerhand.push(deck.pop());
        playerhand.push(deck.pop());

        //lets just burn a card
        deck.pop();

        //dealer card
        //since we are using client side state the dealer secret card is only popped out of the deal at the time the user clicks Stand.
        dealerhand.push(deck.pop());

        //set the updates
        this.setState({
            player :  playerhand,
            dealer : dealerhand,
            deck : deck,
            status : "playing"
        });

    },

    /* function to handle the event of user clicking the Hit button */
    handleHitButton : function(){

        var newStatus = this.state.status;
        var playerHand = this.state.player;

        // check deck size to see if we need to shuffle a new deck
        if(this.state.deck.length < 5){
            this.state.deck = _.shuffle(this.props.deck);
        }

        // we shuffle every time so you don't cheat by checking component state :D
        var shuffled = _.shuffle(this.state.deck);

        // deal the card
        playerHand.push(shuffled.pop());

        var newPlayerscore = this.handScore(playerHand);

        // five card charlie
        if(newPlayerscore < 21 && playerHand.length == 5)
            newStatus = "win";
        if(newPlayerscore > 21)
            newStatus = "lose";

        // set the updates
        this.setState({
            player :  playerHand,
            playerscore: newPlayerscore,
            deck : shuffled,
            status : newStatus
        });

    },

    /* function to handle the event of user clicking the Stand button */
    handleStandButton :function(){

        // check deck size to see if we need to shuffle a new deck
        var dealerHand = this.state.dealer;
        var deck = this.state.deck;
        if(deck.length < 5) {
            deck = _.shuffle(this.props.deck);
        }

        // we shuffle every time so you don't cheat by checking component state :D
        var shuffled = _.shuffle(deck);

        // update scores for the interface component
        var dealerScore = this.handScore(dealerHand);
        var playerScore = this.handScore(this.state.player);
        var dealerHasCharlie = false;

        // compute game status while dealing cards to the dealer
        while (dealerScore < playerScore || dealerScore <= 17) {

            // deal a card
            dealerHand.push(shuffled.pop());
            dealerScore = this.handScore(dealerHand);

            if(dealerScore < 21 && dealerHand.length == 5){
                // five card charlie
                dealerHasCharlie = true;
                break;
            }

        }

        // update the state variables accordingly
        this.setState({
            dealer :  dealerHand,
            deck : shuffled,
            // compute game status
            status : (dealerScore < 21 || dealerHasCharlie) ? 'lose' : 'win'
        });

    },

    /*

     lets call for a Hand component for the dealer where we will show the deck of cards,
     the user Interface component to display scores and buttons (that will trigger the game logic events)
     and finaly another Hand component for the player

     */
    render: function() {
        return (
            <div className='table-board'>
                <Hand
                    showDeck={true}
                    hand={this.state.dealer}
                    />
                <Interface
                    playerscore={this.handScore(this.state.player)}
                    dealerscore={this.handScore(this.state.dealer)}
                    deal={this.handleDealButton}
                    hit={this.handleHitButton}
                    stand={this.handleStandButton}
                    status={this.state.status}
                    />
                <Hand
                    hand={this.state.player}
                    />
            </div>
        );
    }
});

