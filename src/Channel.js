import React, { useState } from 'react';
// import PropTypes from 'prop-types'; // npm install --save prop-types
import { Col } from 'react-bootstrap';
import { Mutation } from '@apollo/client/react/components';
import Clip from './Clip';

import { SET_VOLUME } from './gql';

function Channel({ channel, showGears }) {
  const [volume, setVolumeState] = useState(channel.volume || 0.0);
  return (
    <>
      <Col>
        {channel.clips &&
          channel.clips.map((c, idx) => {
            // Make a shallow copy, as 'c' passed to us is protected from changes by @apollo/client@3
            const clip = { ...c, idx };
            clip.activeClipIdx = channel.activeClipIdx;
            clip.channelIdx = channel.idx;
            clip.channelName = channel.name;
            return <Clip clip={clip} key={clip.idx} showGears={showGears} />;
          })}
        <div className="volume-slider">
          <Mutation mutation={SET_VOLUME}>
            {(setVolume /* , { data, loading, error } */) => (
              <input
                type="range"
                orient="vertical"
                min="-60"
                max="6"
                value={volume}
                step="1"
                onChange={(e) => {
                  setVolumeState(e.target.value);
                  setVolume({
                    variables: {
                      channelIdx: channel.idx,
                      volume: e.target.value,
                    },
                  });
                  // ? .then( res => { this.props.refetch(); })
                }}
              />
            )}
          </Mutation>
        </div>
        <h6 className="text-center">{channel.name}</h6>
      </Col>
    </>
  );
}

// Channel.propTypes = {
//   channel: PropTypes.object.isRequired,
//   showGears: PropTypes.bool.isRequired,
// };

export default Channel;
