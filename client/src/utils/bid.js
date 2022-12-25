/**
 * bidExample = {times: 5, dice: 6}
 */

export function create(multiplier, diceValue) {
    return { times: multiplier, dice: diceValue }
}

export function isGreater(bid, bidToCompare) {
    return (
        (bidToCompare.dice !== 1 && (
            (bid.times > bidToCompare.times) ||
            ((bid.dice > bidToCompare.dice) && (bid.times >= bidToCompare.times)) ||
            ((bid.dice === 1) && (bid.times >= Math.ceil(bidToCompare.times/2)))
        ))
         || 
        (bidToCompare.dice === 1 && (
            ((bid.dice !== 1) && (bid.times >= 2*bidToCompare.times+1)) ||
            ((bid.dice === 1) && (bid.times > bidToCompare.times))
        ))
    );
}