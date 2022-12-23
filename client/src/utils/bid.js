/**
 * bidExample = {times: 5, dice: 6}
 */

module.exports.create = function(multiplier, diceValue) {
    return { times: multiplier, dice: diceValue }
}

module.exports.isGreater = function(bid, bidToCompare) {
    return (
        (bidToCompare.dice !== 1 && (bid.times > bidToCompare.times || bid.dices > bidToCompare.dices)) || 
        (bidToCompare.dice === 1 && (bid.times > 2*bidToCompare.times))
    );
}