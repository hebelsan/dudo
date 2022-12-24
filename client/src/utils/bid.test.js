import * as bid from './bid';

it('create bid', () => {
    expect(bid.create(1, 2)).toEqual({ times: 1, dice: 2 });
});

it('compare bid greater times', () => {
    expect(bid.isGreater(bid.create(2, 2), bid.create(1, 2))).toEqual(true);
});

it('compare bid greater dice same times', () => {
    expect(bid.isGreater(bid.create(1, 3), bid.create(1, 2))).toEqual(true);
});

it('compare bid greater all greater', () => {
    expect(bid.isGreater(bid.create(3, 4), bid.create(2, 3))).toEqual(true);
});

it('compare bid greater bidDice is one', () => {
    expect(bid.isGreater(bid.create(2, 1), bid.create(4, 6))).toEqual(true);
    expect(bid.isGreater(bid.create(2, 1), bid.create(5, 6))).toEqual(false);
});

it('compare bid greater compareDice is one and bidDice is not one', () => {
    expect(bid.isGreater(bid.create(3, 1), bid.create(6, 6))).toEqual(true);
    expect(bid.isGreater(bid.create(3, 1), bid.create(7, 6))).toEqual(false);
});

it('compare bid greater compareDice is one and bid dice is one', () => {
    expect(bid.isGreater(bid.create(4, 1), bid.create(3, 1))).toEqual(true);
});

it('compareDice is one but still greater', () => {
    expect(bid.isGreater(bid.create(4, 2), bid.create(4, 1))).toEqual(false);
});

it('compareDice is one but still greater', () => {
    expect(bid.isGreater(bid.create(5, 1), bid.create(4, 1))).toEqual(true);
});

it('higher dice is always higher', () => {
    expect(bid.isGreater(bid.create(3, 2), bid.create(2, 3))).toEqual(true);
});

it('test', () => {
    expect(bid.isGreater(bid.create(2, 1), bid.create(3, 6))).toEqual(true);
});