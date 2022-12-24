/**
 * bidExample = {times: 5, dice: 6}
 */

module.exports.create = function(multiplier, diceValue) {
    return { times: multiplier, dice: diceValue }
}

module.exports.isGreater = function(bid, bidToCompare) {
    return (
        (bidToCompare.dice !== 1 && 
            ((bid.dice === bidToCompare.dice) && (bid.times > bidToCompare.times)) ||
            ((bid.dice > bidToCompare.dice) && (bid.times >= bidToCompare.times)) ||
            ((bid.dice === 1) && (bid.times >= Math.ceil(bidToCompare.times/2)))
        )
         || 
        (bidToCompare.dice === 1 && 
            ((bid.dice !== 1) && (bid.times >= ((2*bidToCompare.times) +1))) ||
            ((bid.dice === 1) && (bid.times > bidToCompare.times))
        )
    );
}