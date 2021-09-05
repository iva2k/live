// import React, { useState } from 'react';
import React from 'react';
import { Col, Button } from 'react-bootstrap';

import { useMutation } from '@apollo/client';

import { PLAY_ROW } from './gql';

const jsxLoop = function* jsxLoop(count, callback) {
  for (let i = 0; i < count; i += 1) yield callback(i);
};

function Master({ count }) {
  const [playRow] = useMutation(PLAY_ROW);
  // console.log('REDRAW: Master');
  return (
    <>
      <Col>
        {/* Draw out the buttons on the far right to trigger each row */}
        {[
          ...jsxLoop(count, (idx) => (
            <div className="clip" key={idx}>
              <Button variant="outline-dark" onClick={() => playRow({ variables: { activeClipIdx: idx } })}>
                {' '}
                &#9658;
              </Button>
            </div>
          )),
        ]}
        <div className="volume-slider" />
        <h6 className="text-center">MASTER</h6>
      </Col>
    </>
  );
}

export default Master;
