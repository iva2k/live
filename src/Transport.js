import React from 'react';
import { useMutation } from '@apollo/client';
import { ButtonGroup, Button, Col } from 'react-bootstrap';
import { START_STOP_TRACK } from './gql';

function Transport({ isPlaying }) {
  const [startStopTrack] = useMutation(START_STOP_TRACK);

  // console.log('REDRAW: Transport');
  return (
    <Col className="transport">
      <ButtonGroup>
        <Button
          variant="dark"
          onClick={() => startStopTrack({ variables: { isPlaying: false } })}
          disabled={!isPlaying}
        >
          {' '}
          &#9632;
        </Button>
        <Button
          variant={isPlaying ? 'success' : 'dark'}
          onClick={() => startStopTrack({ variables: { isPlaying: true } })}
          disabled={isPlaying}
        >
          {' '}
          &#9658;
        </Button>
      </ButtonGroup>
    </Col>
  );
}

export default Transport;
