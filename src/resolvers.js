// v3.3.0 import { Session } from 'scribbletune';
import { Session } from 'scribbletune/browser';
import * as Tone from 'tone';
import { GET_DATA, WRITE_DATA } from './gql';

const getResolvers = (track) => {
  Tone.Transport.bpm.value = 138;

  const channels = track.channels.map((ch) => {
    const channelClips = ch.clips.map((cl, idx) => {
      try {
        if (cl.clipStr) {
          /* eslint-disable */
          let clipObj = JSON.parse(cl.clipStr);
          /* eslint-enable */
          [
            'pattern',
            'notes',
            'randomNotes',
            'dur',
            'subdiv',
            'shuffle',
            'arpegiate',
            'amp',
            'sizzle',
            'accent',
            'accentLow',
            'sizzleReps',
            'durations',
            // 'offlineRendering', 'offlineRenderingCallback',
          ].forEach((key) => {
            if (clipObj[key]) {
              cl[key] = clipObj[key];
            }
          });
        }
      } catch (e) {
        if (cl.clipStr !== "''") {
          console.log('Channel %o clip #%o Error %o', ch.name, idx, e);
        }
      }

      return cl;
    });
    ch.clips = channelClips;
    return ch;
  });
  const trackSession = new Session(channels);

  const setChannelVolume = (channelIdx, volume) => {
    // Change volume of the channel
    trackSession.channels[channelIdx].setVolume(volume);
  };

  const startTransport = () => {
    trackSession?.startTransport();
  };

  const stopTransport = () => {
    trackSession?.stopTransport();
  };

  return {
    Mutation: {
      // TODO: local resolvers are deprecated (since @apollo/client@3), should change to local-only fields https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies/
      startStopTrack: (_root, { isPlaying }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });

        const data = {
          ...existingData,
          isPlaying,
        };

        // If "Start" is requested then start it only if not already started
        if (!existingData.isPlaying && isPlaying) {
          startTransport();
        }

        // If "Stop" is requested then start it only if not already started
        if (existingData.isPlaying && !isPlaying) {
          // Stop any playing clip as well
          data.channels = existingData.channels.map((ch) =>
            // trackSession.channels[ch.idx].stopClip(ch.activeClipIdx);
            ({ ...ch, activeClipIdx: -1 })
          );
          stopTransport();
        }
        cache.writeQuery({
          query: WRITE_DATA,
          data,
        });
        // TODO: use cache.modify() for faster updates (since @apollo/client@3)
        return null;
      },

      playRow: (_root, { activeClipIdx }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        if (!existingData.isPlaying) {
          startTransport();
        }

        const newChannels = existingData.channels.map((ch) => {
          trackSession.channels[ch.idx].startClip(activeClipIdx);
          setChannelVolume(ch.idx, ch.volume);
          return {
            ...ch,
            activeClipIdx,
          };
        });
        cache.writeQuery({
          query: WRITE_DATA,
          data: { channels: newChannels, isPlaying: true },
        });
        return null;
      },

      stopClip: (_root, { channelIdx }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        const newChannels = existingData.channels.map((ch) => {
          const newChannel = { ...ch };
          if (ch.idx === channelIdx) {
            newChannel.activeClipIdx = -1;
          }
          return newChannel;
        });
        cache.writeQuery({
          query: WRITE_DATA,
          data: { channels: newChannels },
        });

        // Stop the active clip on the channelIdx passed in this method
        trackSession.channels[channelIdx].stopClip(existingData.channels[channelIdx].activeClipIdx);
        return null;
      },

      playClip: (_root, { channelIdx, clipId }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        let volume;
        const newChannels = existingData.channels.map((ch) => {
          const newChannel = {
            ...ch,
          };
          if (ch.idx === channelIdx) {
            newChannel.activeClipIdx = clipId;
            // play the new clip
            volume = ch.volume;
          }
          return newChannel;
        });
        cache.writeQuery({
          query: WRITE_DATA,
          data: { channels: newChannels },
        });
        // Start the active clip on the channelIdx passed in this method
        trackSession.channels[channelIdx].startClip(clipId);
        setChannelVolume(channelIdx, volume);
        return null;
      },

      setVolume: (_root, { channelIdx, volume }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        const newChannels = existingData.channels.map((ch) => {
          const newChannel = { ...ch };
          if (ch.idx === channelIdx) {
            newChannel.volume = volume;
            // set channel volume
          }
          return newChannel;
        });
        cache.writeQuery({
          query: WRITE_DATA,
          data: { channels: newChannels },
        });

        setChannelVolume(channelIdx, volume);
        return null;
      },
    },
  };
};

export default getResolvers;
