export const ROUND_STATE = {
    NEXT: "next", // next player (lastBid = curBid + curPlayer update)
    CUR_PLAYER_LOSE: "cur_player_lose", // (lose a dice + start new round + lastBid = undefined)
    PLAYER_BEFORE_LOSE:"player_before_lose", // (the player before looses a dice but starts round ) 
    WIN: "win", // (it's your turn but you don't win a dice) 
    WIN_GAIN: "win_gain" // (it's your turn and you win a dice)
};