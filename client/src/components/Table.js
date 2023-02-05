import './Table.scss';
import {Text} from 'react-native';
import useWindowDimensions from './window';
import Clockwise_arrow from '../assets/clockwise_arrow.svg';
import Skull_lose_dice from '../assets/skulls/skull_lose.svg';
import Skull_win_dice from '../assets/skulls/skull_win.svg';

export function Table(props) {
  const fontSize = parseInt(getComputedStyle(document.documentElement).fontSize);
  const fontScale = 1.5;
  const textHeight = fontSize * fontScale;
  const { width, height } = useWindowDimensions();

  let circleWidthFactor = 1;
  let circleHeightFactor = 1;
  const calcR = () => {
    const circleWidth = width / 100 * 95;
    const circleHeight = (height * props.heightAmount) / 100 * 95;
    if (width >= height) {
      circleWidthFactor = circleWidth/circleHeight;
      return circleHeight / 2;
    } else {
      circleHeightFactor = circleHeight/circleWidth;
      return circleWidth / 2;
    }
  }

  const ZERO_TRASHOLD = 0.001;
  const r = calcR();
  const playerBorderWidth = '3px';
  const totalDicesWidth = 1;
  const clockwiseImgWidth = textHeight + 20;
  const skullWidth = clockwiseImgWidth;
  const playerInfoBoxHeight = textHeight + 4;
  const playerInfoBoxWidth = (width/100 * 10) > 4 * fontSize ? (width/100 * 10) : 4 * fontSize;
  const playerInfoBoxTextWidth = playerInfoBoxWidth - 10;
  const numPlayers = props.players.length;

  const toRadian = (degree) => {
    return degree * (Math.PI / 180);
  }

  // x = r * cos(PHI)
  const getCircleX = (degree, radius) => {
    return circleWidthFactor * Math.cos(toRadian(degree)) * radius;
  }

  // y = r * sin(PHI)
  const getCircleY = (degree, radius) => {
    return circleHeightFactor * Math.sin(toRadian(degree)) * radius;
  }

  const playersPosition = (startAngle = 90) => {
    const angles = [];
    let curAngle = startAngle;
    for (let i = 0; i < numPlayers; i++) {
      angles.push({ angle: curAngle, name: props.players[i].name, id: props.players[i].id });
      curAngle = (curAngle + (360/numPlayers)) % 360
    }
    return angles;
  }

  const renderPlayer = (id, name, angle) => {
    const infoBoxStyle = {
      width: playerInfoBoxWidth,
      height: playerInfoBoxHeight,
      border: `${playerBorderWidth} solid transparent`,
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }

    const skullStyle = {
      width: skullWidth,
      height: skullWidth,
      position: 'absolute', 
    }

    // x value
    const circleX = getCircleX(angle, r)
    if (circleX > ZERO_TRASHOLD) {
      infoBoxStyle.right = circleWidthFactor*r - circleX;
      skullStyle.right = circleWidthFactor*r - circleX + skullWidth;
    } else if (circleX < -ZERO_TRASHOLD) {
      infoBoxStyle.left = circleWidthFactor*r + circleX;
      skullStyle.left = circleWidthFactor*r + circleX + skullWidth;
    } else {
      infoBoxStyle.left = circleWidthFactor*r + circleX - playerInfoBoxWidth/2;
      skullStyle.left = circleWidthFactor*r + circleX - skullWidth/2;
    }
    // y value
    const circleY = getCircleY(angle, r);
    if (circleY > ZERO_TRASHOLD) {
      infoBoxStyle.bottom = circleHeightFactor * r - circleY;
      skullStyle.bottom = circleHeightFactor * r - circleY;
    } else if (circleY < -ZERO_TRASHOLD) {
      infoBoxStyle.top = circleHeightFactor * r + circleY;
      skullStyle.top = circleHeightFactor * r + circleY;
    } else {
      infoBoxStyle.top = circleHeightFactor * r + circleY - playerInfoBoxHeight
      skullStyle.top = circleHeightFactor * r + circleY - skullWidth;
    }

    let skullImg = <></>;

    if (id === props.state.curPlayer) {
      infoBoxStyle.borderColor = 'transparent';
      infoBoxStyle.className = 'moving-border';
    } else {
      infoBoxStyle.borderColor = 'black';
    }

    if (id === props.state.id) {
      infoBoxStyle.color = '#990012';
    }

    if (id === props.state?.diceChange?.playerID) {
      if (props.state?.diceChange.amount === 1) {
        skullImg = <img key={'skull_win_' + angle} src={Skull_win_dice} alt={id + 'skull'} style={skullStyle} className='fade-out'/>;
      }
      if (props.state?.diceChange.amount === -1) {
        skullImg = <img key={'skull_lose_' + angle} src={Skull_lose_dice} alt={id + 'skull'} style={skullStyle} className='fade-out'/>;
      }
    }
    
    return (
    <div key={angle}>
      <div key={'player_angle' + angle} style={infoBoxStyle} className={infoBoxStyle.className}>
        <span className='player-text table-text' style={{playerInfoBoxTextWidth}}>{name}</span>
      </div>
      {skullImg}
    </div>);
  }
  
  return (
    <div style={{width: 2*r*circleWidthFactor, height: 2*r*circleHeightFactor}} className={'table'}>

      { playersPosition().map(p => renderPlayer(p.id, p.name, p.angle)) }

      <img 
        src={Clockwise_arrow} 
        width={clockwiseImgWidth}
        height={clockwiseImgWidth}
        alt='clockwise_arrow'
        style={{
          position: 'absolute', 
          left: circleWidthFactor*r - clockwiseImgWidth/2, 
          top: circleHeightFactor*r - clockwiseImgWidth/2,
          transform: 'rotate(90deg)'
        }}
      />
      <div style={{
          width: totalDicesWidth,
          height: totalDicesWidth,
          left: circleWidthFactor*r - totalDicesWidth/2, 
          top: circleHeightFactor*r - totalDicesWidth/2,
        }} className={'number-dices-container'}>
        <span className='table-text'>
          {props.state.totalDices}
        </span>
      </div>
    </div>
  )
}