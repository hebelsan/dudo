import React from 'react';

import Clockwise_arrow from '../assets/clockwise_arrow.svg';

export class GameStatus extends React.Component {
  render() {
    const r = 220;
    const circleWidthFactor = 3;
    const clockwiseImgWidth = 50;
    const playerInfoBoxWidth = 150;
    const playerInfoBoxHeight = 30;
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

    const playerStyle = (angle, id) => {
      const style = {
        width: playerInfoBoxWidth,
        height: playerInfoBoxHeight,
        position: 'absolute', 
        border: '1px solid black',
      }

      if (id === this.props.state.curPlayer) {
        style['background-color'] = '#D0D0D0';
      }

      // x value
      const circleX = getCircleX(angle, r)
      if (circleX > ZERO_TRASHOLD) {
        style.right = circleWidthFactor*r - circleX;
      } else if (circleX < -ZERO_TRASHOLD) {
        style.left = circleWidthFactor*r + circleX;
      } else {
        style.left = circleWidthFactor*r + circleX - playerInfoBoxWidth/2;
      }

      // y value
      const circleY = getCircleY(angle, r);
      if (circleY > ZERO_TRASHOLD) {
        style.bottom = r - circleY;
      } else if (circleY < -ZERO_TRASHOLD) {
        style.top = r + circleY;
      } else {
        style.top = r + circleY - playerInfoBoxHeight
      }
      
      return style;
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

        {playersPosition().map((p) => {
          return <div 
            key={'player_angle' + p.angle}
            style={playerStyle(p.angle, p.id)}
          >
            {p.name}
          </div>
        })}

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