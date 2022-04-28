import axios from "axios";
import React, { useEffect, useState } from "react";
import "./styles/main.css";

const api_endpoint = "https://deckofcardsapi.com/api";

function App() {
  const [deckId, setDeckId] = useState("");
  const [playerDeck, setPlayerDeck] = useState([]);
  const [dealerDeck, setDealerDeck] = useState([]);
  const [gameover, setGameover] = useState(false);
  const [winner, setWinner] = useState("");
  const [counter, setCounter] = useState(0);
  const [score, setScore] = useState(0);
  const [div, setDiv] = useState(false);

  // This will start a new game
  const deal = async () => {
    setDealerDeck([]);
    setPlayerDeck([]);
    setGameover(false);
    setWinner("");
    resetGame();
    let res = await axios.get(`${api_endpoint}/deck/new/shuffle/?deck_count=6`);

    let deck_id = await res.data.deck_id;

    setDeckId(deck_id);

    let player_deck = [];

    let dealer_deck = [];

    let cardsDrawn = await axios.get(
      `${api_endpoint}/deck/${deck_id}/draw/?count=3`
    );
    player_deck.push(cardsDrawn.data.cards[0]);
    player_deck.push(cardsDrawn.data.cards[1]);
    dealer_deck.push(cardsDrawn.data.cards[2]);

    setDealerDeck(dealer_deck);
    setPlayerDeck(player_deck);
  };

  const hitMe = async () => {
    if (playerDeck.length < 5) {
      setCounter(0);
      const res = await axios.get(
        `${api_endpoint}/deck/${deckId}/draw/?count=1`
      );
      const cardData = await res.data.cards[0];
      setPlayerDeck((playerDeck) => [...playerDeck, cardData]);
    }
  };

  const stand = async () => {
    const playerDeckVal = await playerDeckValue();
    const dealerDeckVal = await dealerDeckValue();

    let n = counter;
    let dealerCards = playerDeck.length - dealerDeck.length;
    if (dealerCards === 0) {
      dealerCards = 1;
    }
    const res = await axios.get(
      `${api_endpoint}/deck/${deckId}/draw/?count=${dealerCards}`
    );
    setCounter((n += 1));

    if (dealerDeckVal <= playerDeckVal) {
      for (let i = 0; i < dealerCards; i++) {
        let dealer_card = await res.data.cards[i];
        setDealerDeck((dealerDeck) => [...dealerDeck, dealer_card]);
      }

      console.log(counter);
    }
  };

  const playerDeckValue = async () => {
    let sum = 0;

    playerDeck.forEach((card) => {
      let value = getCardVal(card);
      sum = sum + value;
    });

    return sum;
  };
  const dealerDeckValue = async () => {
    let sum = 0;

    dealerDeck.forEach((card) => {
      let value = getCardVal(card);
      sum = sum + value;
    });

    return sum;
  };

  const getCardVal = (card) => {
    let card_val = card.value;
    console.log(card_val);
    if (card_val === "KING" || card_val === "QUEEN" || card_val === "JACK") {
      card_val = 10;
    } else if (card_val === "ACE") {
      card_val = 11;
    } else {
      card_val = parseInt(card_val);
    }
    return card_val;
  };

  const GameOver = ({ isGameOver }) => {
    if (isGameOver === true) {
      return (
        <div className="game-over-container">
          <h1 className="game-over">{winner} wins</h1>
        </div>
      );
    } else {
      return <></>;
    }
  };

  const Welcome = () => {
    if(div == false){

      return(
        <div className="container">
          <div className="welcome" >
            <div className="close">
              <h3 onClick={() => setDiv(true)}>X</h3>
            </div>
            <h2>How To Play:</h2>
            <p>The objective of the game is to get to 21 but not go over. <br></br> The rules are: <br></br>1. Press Deal to start a new game
              <br></br>
              2. Press hit to add more cards to your deck
              <br></br>
              3. Press stand to make the dealer draw a card
              <br></br>
              4. If you go over 21, you lose
              <br></br>
              5. If you get 21 you win or the dealer goes over 21
              <br></br>
              6. If no one gets 21 the highest value of cards wins
              <br></br>
              7. Make sure to collect points and have fun!

            </p>
          </div>
        </div>
      )
    }
  }

  const resetGame = async () => {
    let playerDeckVal = await playerDeckValue();
    let dealerDeckVal = await dealerDeckValue();

    playerDeckVal = null;
    dealerDeckVal = null;

    setDeckId();
    setCounter(0);
  };

  useEffect(() => {
    const gameResult = async () => {
      let playerDeckVal = await playerDeckValue();
      let dealerDeckVal = await dealerDeckValue();

      if (playerDeckVal > 21 || dealerDeckVal === 21) {
        setGameover(true);
        setWinner("Dealer");
        setScore(0);
      }

      if (playerDeckVal === 21 || (dealerDeckVal > 21 && playerDeckVal < 21)) {
        playerDeckVal = 19;
        setGameover(true);
        setWinner("Player");
        let n = 100;
        setScore(score + n);
        resetGame();
      }

      if (counter === 2) {
        if (dealerDeckVal > playerDeckVal || dealerDeckVal == playerDeckVal) {
          setGameover(true);
          setWinner("Dealer");
          setScore(0);
        } else {
          setGameover(true);
          setWinner("Player");

          let n = 100;
          setScore(score + n);
          resetGame();
        }

        setCounter(0);
      }
    };

    gameResult();
  }, [playerDeck, dealerDeck, counter]);

  return (
    <div className="App">
      
      <Welcome />
      <h1>Welcome To Blackjack</h1>
      <h2>Select Deal to Play!</h2>

      <div className="button-container">
        <button onClick={deal}>Deal</button>
        <button onClick={hitMe}>Hit</button>
        <button onClick={stand}>Stand</button>
      </div>
      <GameOver isGameOver={gameover} />

      <div className="score-container">
        <h2>Score: {score}</h2>
      </div>

      <div className="dealer-cards">
        <h2>Dealer:</h2>
        <div className="cards">
          {dealerDeck.map((card) => {
            return (
              <div className="card">
                <img src={card.image}></img>
              </div>
            );
          })}
        </div>
      </div>

      <div className="player-cards">
        <h2>Player:</h2>
        <div className="cards">
          {playerDeck.map((card) => {
            return (
              <div className="card">
                <img src={card.image}></img>
              </div>
            );
          })}
        </div>
      
      </div>
    </div>
  );
}

export default App;
