import React from 'react';
// import PropTypes from 'prop-types'; // npm install --save prop-types
import { Col } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
// import * as Tone from 'tone';
import Clip from './components/Clip';
import ChannelState from './components/ChannelState';

// import { GET_VOLUME, SET_VOLUME } from './gql';
import { SET_VOLUME, STOP_CLIP, PLAY_CLIP } from './gql';

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

function Channel({ channel, showGears, setShowModal }) {
  const [setVolume] = useMutation(SET_VOLUME);
  const [stopClip] = useMutation(STOP_CLIP);
  const [playClip] = useMutation(PLAY_CLIP);
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
            return (
              <Clip
                clip={clip}
                key={clip.idx}
                showGears={showGears}
                stopClip={stopClip}
                playClip={playClip}
                setShowModal={setShowModal}
              />
            );
          })}
        <div className="volume-slider">
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
        </div>
        <h6 className="text-center">{channel.name}</h6>
        <ChannelState state={channel.state} error={channel.error} />
      </Col>
    </>
  );
}

// Channel.propTypes = {
//   channel: PropTypes.object.isRequired,
//   showGears: PropTypes.bool.isRequired,
// };

export default Channel;
