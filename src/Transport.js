import React from 'react';
import { Mutation } from '@apollo/client/react/components';
import { ButtonGroup, Button } from 'react-bootstrap';
import { START_STOP_TRACK } from './gql';

function Transport({ isPlaying }) {
  return (
    <div className="transport">
      <ButtonGroup>
        <Mutation mutation={START_STOP_TRACK} variables={{ isPlaying: false }}>
          {startStopTrack => (
            <Button
              variant="dark"
              onClick={startStopTrack}
              disabled={!isPlaying}
            >
              {' '}
              &#9632;
            </Button>
          )}
        </Mutation>
        <Mutation mutation={START_STOP_TRACK} variables={{ isPlaying: true }}>
          {startStopTrack => (
            <Button
              variant={isPlaying ? 'success' : 'dark'}
              onClick={startStopTrack}
              disabled={isPlaying}
            >
              {' '}
              &#9658;
            </Button>
          )}
        </Mutation>
      </ButtonGroup>
    </div>
  );
}

export default Transport;
