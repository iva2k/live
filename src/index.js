import React from 'react';
import { render } from 'react-dom';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';
import { GET_DATA } from './gql';

import * as Tone from 'tone';

import getResolvers from './resolvers';
import App from './App';

// import trackRaw from './tracks/dummy';
// import trackRaw from './tracks/init';
// import trackRaw from './tracks/half';
import trackRaw from './tracks/final';

import './index.css';

window.Tone = Tone; // For the scribbletune lib to pick up the instance.

let track = {
  ...trackRaw,
  channels: trackRaw.channels.map((ch, idx) => {
    if (ch.external) {
      ch.external = {
        ...ch.external,
        __typename: 'ExternalOutput',
      }
    }
    ch.clips = ch.clips.map(c => ({
      ...{ clipStr: (c.pattern ? JSON.stringify(c) : "''") },
      __typename: 'Clip',
    }));
    return {
      ...ch,
      __typename: 'Channel',
      activeClipIdx: -1,
      idx,
    };
  })
};

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  resolvers: getResolvers(track),
});

cache.writeData({
  data: {
    ...track,
    isPlaying: false,
  },
});

render(
  <ApolloProvider client={client}>
    <Query query={GET_DATA}>
      {({ data: { channels, isPlaying } }) => {
        return <App channels={channels} isPlaying={isPlaying} />;
      }}
    </Query>
  </ApolloProvider>,
  document.getElementById('root')
);
