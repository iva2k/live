// import React, { useState } from 'react';
import React from 'react';
import { Col, Button } from 'react-bootstrap';

import { Mutation } from '@apollo/client/react/components';

import { PLAY_ROW } from './gql';

function Master({ count }) {
  return (
    <>
      <Col>
        {/* Draw out the buttons on the far right to trigger each row */}
        {(new Array(count)).fill(undefined).map((_, idx) => (
            <div className="clip" key={idx}>
              <Mutation
                mutation={PLAY_ROW}
                variables={{ activeClipIdx: idx }}
              >
                {playRow => (
                  <Button variant="outline-dark" onClick={playRow}>
                    {' '}
                    &#9658;
                  </Button>
                )}
              </Mutation>
            </div>
          ))}
        <div className="volumeSlider">
        </div>
        <h6 className="text-center">MASTER</h6>
      </Col>
    </>
  );
}

export default Master;
