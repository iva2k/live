// v3.3.0 import { Session } from 'scribbletune';
import * as Tone from 'tone';
import { GET_DATA, WRITE_DATA } from './gql';

const getResolvers = (trackSession) => {
  // TODO: Refactor such that trackSession is not used here. Move all trackSession operations into a proper Apollo downstream subsccribers.

  const setChannelVolume = (channelIdx, volume) => {
    // Change volume of the channel
    trackSession.channels[channelIdx].setVolume(volume);
  };

  const startChannelClip = (channelIdx, clipIdx) => {
    trackSession.channels[channelIdx].startClip(clipIdx);
  };

  const stopChannelClip = (channelIdx, clipIdx) => {
    trackSession.channels[channelIdx].stopClip(clipIdx);
  };

  // const startTransport = () => {
  //   trackSession?.startTransport();
  // };

  // const stopTransport = () => {
  //   trackSession?.stopTransport();
  // };

  return {
    Query: {
      channels: (ref, args, { cache }) => {
        if (ref) return ref;
        const data = [];
        if (args && (args.idx || args.idx === 0)) {
          const existingData = cache.readQuery({
            query: GET_DATA,
          });
          existingData.channels.forEach((ch) => {
            if (ch.idx === args.idx) {
              data.push(ch);
              // ? break;
            }
          });
        }
        console.log('resolvers::channels(%o) return=%o', args, data);
        return data;
      },
    },

    Mutation: {
      // // Example monitoring network connection
      // updateNetworkStatus: (_, { isConnected }, { cache }) => {
      //   cache.writeData({ data: { isConnected } });
      //   return null;
      // },

      /* TODO: (if ever needed) local resolvers are deprecated (since @apollo/client@3),
       * per https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies/
       * code should be changed to local-only fields. However, they have significant issues, and
       * the issue discussion ends up with local resolvers living indefinitely,
       * see https://github.com/apollographql/apollo-client/issues/7072#issuecomment-857214561
       * Conclusion: Do not migrate from local resolvers. Revisit if ever needed.
       */
      mutationResolverStartStopTrack: (_root, { isPlaying }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });

        const data = {
          ...existingData,
          isPlaying,
        };

        // console.log(
        //   'mutationResolverStartStopTrack(%o) @%o existingData.isPlaying=%o',
        //   isPlaying,
        //   Tone.now(),
        //   existingData.isPlaying
        // );

        // // If "Start" is requested then start it only if not already started
        // if (!existingData.isPlaying && isPlaying) {
        //   console.log('mutationResolverStartStopTrack(START) @%o', Tone.now());
        //   startTransport();
        // }

        // If "Stop" is requested then start it only if not already started
        if (existingData.isPlaying && !isPlaying) {
          // Stop any playing clip as well
          data.channels = existingData.channels.map((ch) =>
            // trackSession.channels[ch.idx].stopClip(ch.activeClipIdx);
            ({ ...ch, activeClipIdx: -1 })
          );
          console.log('mutationResolverStartStopTrack(STOP) @%o', Tone.now()); // Compare time between direct intercept (here) and called from React hook
          // stopTransport();
        }
        cache.writeQuery({
          query: WRITE_DATA,
          data,
          optimisticResponse: { isPlaying, __typename: 'Track' }, // This does not seem to make any difference. // The intent is to have Apollo push changes to observers right away. Should have effect when there's a network connection (if ever)
        });
        // TODO: use cache.modify() for faster updates (since @apollo/client@3)
        return null;
      },

      playRow: (_root, { activeClipIdx }, { cache }) => {
        const existingData = cache.readQuery({
          query: GET_DATA,
        });
        // if (!existingData.isPlaying) {
        //   startTransport();
        // }

        const newChannels = existingData.channels.map((ch) => {
          startChannelClip(ch.idx, activeClipIdx);
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
        stopChannelClip(channelIdx, existingData.channels[channelIdx].activeClipIdx);
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
        startChannelClip(channelIdx, clipId);
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
