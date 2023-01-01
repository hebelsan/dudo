import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export function InfoButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Info
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body>
          <h2>History</h2>
          <p>Dudo (Spanish for I doubt), also known as Cacho, 
            Pico, Perudo, Liar's Dice, Cachito or 
            Dadinho is a popular dice game played in South America.</p>
          <h2>Description</h2>
          <p>This game can be played by two or more players and consists of guessing how many 
            dice, placed under cups, there are on the table showing a certain number. 
            The player who loses a round loses one of their dice. 
            The last player to still have dice is the winner.</p>
          <h2>Game Play</h2>
          <p>Each player starts having five dice.
            After deciding who starts the game, the players shake their dice in their cups, 
            and then each player looks at their own dice, keeping their dice concealed from other players. 
            Then, the first player makes a bid about how many dice of a certain value are 
            showing among all players, at a minimum. Aces (dice showing a one) are wild, meaning 
            that they count as every number. For example, a bid of "five threes" 
            is a claim that between all players, there are at least five dice showing a three or an ace. 
            The player challenges the next player (moving clockwise) to raise the bid or 
            call dudo to end the round.
          </p>
          <ul>
            <li><b>Raise:</b> also known as "bid" in most versions, a player can increase the quantity of dice (e.g. from "five threes" to "six threes") or the die number (e.g. "five threes" to "five sixes") or both. If a player increases the quantity, they can choose any number e.g. a bid may increase from "five threes" to "six twos".</li>
            <li><b>Bidding aces:</b> a player who wishes to bid aces can halve the quantity of dice, rounding upwards. For instance, if the current bid is "five threes" then the next player would have to bid at least three aces. If the current bid is aces, the next player can call dudo or increase the quantity (e.g. "four aces") or bid a different number, in which case the lower bound on the quantity is one more than double the previous quantity—for instance, from "three aces", a player wishing to bid fours would have to bid "seven fours" or higher.</li>
            <li><b>Call:</b> also known as dudo, if the player calls, it means that they do not believe the previous bid was correct. All dice are then shown and, if the guess is not correct, the previous player (the player who made the bid) loses a die. If it is correct, the player who called loses a die. A player with no dice remaining is eliminated from the game. After calling, a new round starts with the player that lost a die making the first bid, or (if that player was eliminated) the player to that player's left</li>
            <li><b>Spot on:</b> also known as "calza" in some versions, the player claims that the previous bidder's bid is exactly right. If the number is higher or lower, the claimant loses the round; otherwise, the bidder loses the round. A "spot-on" claim typically has a lower chance of being correct than a challenge, so a correct "spot on" call sometimes has a greater reward, such as the player regaining a previously lost die.</li>
          </ul>
          <p>The game ends when only one player has dice remaining; that player is the winner.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}