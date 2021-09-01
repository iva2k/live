import React from 'react';
// import PropTypes from 'prop-types'; // npm install --save prop-types
import { Col } from 'react-bootstrap';
// import { useQuery } from '@apollo/client';
import { Mutation } from '@apollo/client/react/components';
// import * as Tone from 'tone';
import Clip from './Clip';

// import { GET_VOLUME, SET_VOLUME } from './gql';
import { SET_VOLUME } from './gql';

// React hook for scribbletune channel volume
// function useScribbletuneGetVolume(channelIdx, store) {
//   const { loading, error, data } = useQuery(GET_VOLUME, {
//     variables: { channelIdx },
//     client: store,
//   });
//   console.log(
//     'useScribbletuneGetVolume(%o) @%o loading=%o error=%o data=%o volume=%o',
//     channelIdx,
//     Tone.now(),
//     loading,
//     error,
//     data,
//     data?.channels[0]?.volume
//   );
//   return data?.channels[0]?.volume;
// }

function Channel({ channel, showGears }) {
  // console.log('REDRAW: Channel %o', channel);
  // useScribbletuneGetVolume(channel.idx); // Using volume here to set scribbletune channel volume is possiblem but this approach adds 10ms latency vs. observer in resolvers.js
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
                value={channel.volume}
                step="1"
                onChange={(e) => {
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
