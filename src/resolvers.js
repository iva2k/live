// v3.3.0 import { Session } from 'scribbletune';
import { Session } from 'scribbletune/browser';
import { GET_DATA } from './gql';
import * as Tone from 'tone';

const getResolvers = track => {
  Tone.Transport.bpm.value = 138;

  const channels = track.channels.map(ch => {
    const channelClips = ch.clips.map((cl, idx) => {
      try {
        if (cl.clipStr) {
          /*eslint-disable */
          let clipObj = JSON.parse(cl.clipStr);
          /*eslint-enable */
          // ? cl = { clipStr: cl.clipStr, __typename: cl.__typename }; // reset all
          [ 'pattern', 'notes', 'randomNotes', 'dur', 'subdiv', 
            'shuffle', 'arpegiate', 'amp', 'sizzle', 'accent', 'accentLow', 'sizzleReps', 'durations',
            // 'offlineRendering', 'offlineRenderingCallback', 
          ].forEach(key => {
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

  const setChannelVolume = (channelId, volume) => {
    // Change volume of the channel
    trackSession.channels[channelId].setVolume(volume);
  };

  const startTransport = () => {
    trackSession?.startTransport();
  };

  const stopTransport = () => {
    trackSession?.stopTransport();
  };

  return {
    Mutation: {
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
          data.channels = existingData.channels.map(ch => {
            // trackSession.channels[ch.idx].stopClip(ch.activeClipIdx);
            return { ...ch, activeClipIdx: -1 };
          });
          stopTransport();
        }

        cache.writeData({
          data,
        });
        return null;
      },
      playRow: (_root, { activeClipIdx }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        if (!existingData.isPlaying) {
          startTransport();
        }

        const newChannels = existingData.channels.map(ch => {
          trackSession.channels[ch.idx].startClip(activeClipIdx);
          setChannelVolume(ch.idx, ch.volume);
          return {
            ...ch,
            activeClipIdx,
          };
        });

        cache.writeData({ data: { channels: newChannels, isPlaying: true } });
        return null;
      },

      stopClip: (_root, { channelId }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        const newChannels = existingData.channels.map(ch => {
          const newChannel = { ...ch };
          if (ch.idx === channelId) {
            newChannel.activeClipIdx = -1;
          }
          return newChannel;
        });
        cache.writeData({ data: { channels: newChannels } });
        // Stop the active clip on the channelId passed in this method
        trackSession.channels[channelId].stopClip(
          existingData.channels[channelId].activeClipIdx
        );
        return null;
      },

      playClip: (_root, { channelId, clipId }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        let volume;
        const newChannels = existingData.channels.map(ch => {
          const newChannel = {
            ...ch,
          };
          if (ch.idx === channelId) {
            newChannel.activeClipIdx = clipId;
            // play the new clip
            volume = ch.volume;
          }
          return newChannel;
        });
        cache.writeData({
          data: {
            channels: newChannels,
          },
        });
        // Start the active clip on the channelId passed in this method
        trackSession.channels[channelId].startClip(clipId);
        setChannelVolume(channelId, volume);
        return null;
      },

      setVolume: (_root, { channelId, volume }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        const newChannels = existingData.channels.map(ch => {
          const newChannel = { ...ch };
          if (ch.idx === channelId) {
            newChannel.volume = volume;
            // set channel volume
          }
          return newChannel;
        });
        cache.writeData({
          data: {
            channels: newChannels,
          },
        });

        setChannelVolume(channelId, volume);
        return null;
      },

    },
  };
};

export default getResolvers;
