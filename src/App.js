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
  const [counter, setCounter] = useState(0)

  // This will start a new game
  const deal = async () => {
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
    let n = counter
    let dealerCards = playerDeck.length - dealerDeck.length;
    const res = await axios.get(
      `${api_endpoint}/deck/${deckId}/draw/?count=${dealerCards}`
    );
    setCounter(n += 1)

      if (dealerDeckVal <= playerDeckVal){

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
          <p className="game-over">{winner} wins</p>
        </div>
      );
    } else {
      return <></>;
    }
  };
  const resetGame = () => {
    localStorage.clear();
    setGameover(false);
    setWinner("");
    setDealerDeck([]);
    setPlayerDeck([]);
    setDeckId();
    setCounter(0)
  };

  useEffect(() => {
    const gameResult = async () => {
      const playerDeckVal = await playerDeckValue();
      const dealerDeckVal = await dealerDeckValue();

      if (playerDeckVal > 21 || dealerDeckVal === 21) {
        setGameover(true);
        setWinner("Dealer");
      }

      if (playerDeckVal === 21 || (dealerDeckVal > 21 && playerDeckVal < 21)) {
        setGameover(true);
        setWinner("Player");
      }
      
      if(counter === 2){
        if (dealerDeckVal > playerDeckVal || dealerDeckVal == playerDeckVal){
          setGameover(true)
          setWinner("Dealer")
        }else {
          
          setGameover(true)
          setWinner("Player")
        }

        setCounter(0)

      }
    };

    gameResult();
  });

  return (
    <div className="App">
      <h1>Welcome To Blackjack</h1>
      <p>Select Deal to Play!</p>

      <div className="button-container">
        <button onClick={deal}>Deal</button>
        <button onClick={hitMe}>Hit</button>
        <button onClick={stand}>Stand</button>
      </div>
      <GameOver isGameOver={gameover} />

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
