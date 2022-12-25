import dice_1_img from '../assets/dices/dice_1.svg';
import dice_2_img from '../assets/dices/dice_2.svg';
import dice_3_img from '../assets/dices/dice_3.svg';
import dice_4_img from '../assets/dices/dice_4.svg';
import dice_5_img from '../assets/dices/dice_5.svg';
import dice_6_img from '../assets/dices/dice_6.svg';

export function getDiceImg(dice_value) {
    switch(dice_value) {
        case 1:
            return dice_1_img;
        case 2:
            return dice_2_img;
        case 3:
            return dice_3_img;
        case 4:
            return dice_4_img;
        case 5:
            return dice_5_img;
        case 6:
            return dice_6_img;
    }
}

