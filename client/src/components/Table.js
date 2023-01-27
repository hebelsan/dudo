import React from 'react';
import './Table.scss';
import Clockwise_arrow from '../assets/clockwise_arrow.svg';
import Skull_lose_dice from '../assets/skulls/skull_lose.svg';
import Skull_win_dice from '../assets/skulls/skull_win.svg';

export class GameStatus extends React.Component {
  render() {
    const r = 220;
    const circleWidthFactor = 3;
    const clockwiseImgWidth = 50;
    const skullWidth = 50;
    const playerInfoBoxWidth = 150;
    const playerInfoBoxHeight = 34;
    const playerBorderWidth = '3px';
    const ZERO_TRASHOLD = 0.001;

    const numPlayers = this.props.players.length;

    const toRadian = (degree) => {
      return degree * (Math.PI / 180);
    }
  
    // x = r * cos(PHI)
    const getCircleX = (degree, radius) => {
      return circleWidthFactor* Math.cos(toRadian(degree)) * radius;
    }

    // y = r * sin(PHI)
    const getCircleY = (degree, radius) => {
      return Math.sin(toRadian(degree)) * radius;
    }

    const playersPosition = (startAngle = 90) => {
      const angles = [];
      let curAngle = startAngle;
      for (let i = 0; i < numPlayers; i++) {
        angles.push({ angle: curAngle, name: this.props.players[i].name, id: this.props.players[i].id });
        curAngle = (curAngle + (360/numPlayers)) % 360
      }
      return angles;
    }

    const renderPlayer = (id, name, angle) => {
      const infoBoxStyle = {
        width: playerInfoBoxWidth,
        height: playerInfoBoxHeight,
        position: 'absolute',
        border: `${playerBorderWidth} solid transparent`
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
        infoBoxStyle.bottom = r - circleY;
        skullStyle.bottom = r - circleY;
      } else if (circleY < -ZERO_TRASHOLD) {
        infoBoxStyle.top = r + circleY;
        skullStyle.top = r + circleY;
      } else {
        infoBoxStyle.top = r + circleY - playerInfoBoxHeight
        skullStyle.top = r + circleY - skullWidth;
      }

      let skullImg = <></>;

      if (id === this.props.state.curPlayer) {
        infoBoxStyle.borderColor = 'transparent';
        infoBoxStyle.className = 'moving-border';
      } else {
        infoBoxStyle.borderColor = 'black';
      }

      if (id === this.props.state.id) {
        infoBoxStyle.color = '#990012';
      }

      if (id === this.props.state?.diceChange?.playerID) {
        if (this.props.state?.diceChange.amount === 1) {
          skullImg = <img src={Skull_win_dice} alt={id + 'skull'} style={skullStyle} className='fade-out'/>;
        }
        if (this.props.state?.diceChange.amount === -1) {
          skullImg = <img src={Skull_lose_dice} alt={id + 'skull'} style={skullStyle} className='fade-out'/>;
        }
      }
      
      return (<>
        <div key={'player_angle' + angle} style={infoBoxStyle} className={infoBoxStyle.className}>
          {name}
        </div>
        {skullImg}
      </>);
    }
    
    return (
      <div style={{
        width: 2*r*circleWidthFactor, 
        height: 2*r, 
        position: 'relative', 
        border: '1px solid black', 
        'marginLeft': 'auto',
        'marginRight': 'auto',
        'marginTop': '10px',
        'marginBottom': '10px'}}>

        { playersPosition().map(p => renderPlayer(p.id, p.name, p.angle)) }

        <img 
          src={Clockwise_arrow} 
          width={clockwiseImgWidth}
          height={clockwiseImgWidth}
          alt='clockwise_arrow'
          style={{
            position: 'absolute', 
            left: circleWidthFactor*r - clockwiseImgWidth/2, 
            top: r - clockwiseImgWidth/2,
            transform: 'rotate(90deg)'
          }}
        />
      </div>
    )
  }
}