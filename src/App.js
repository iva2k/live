import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from '@apollo/client';
import { Query } from '@apollo/client/react/components';
import * as Tone from 'tone';

import { GET_DATA, WRITE_DATA } from './gql';
import Transport from './Transport';
import Channel from './Channel';
import Master from './Master';

import getResolvers from './resolvers';


// import trackRaw from './tracks/dummy';
// import trackRaw from './tracks/init';
// import trackRaw from './tracks/half';
import trackRaw from './tracks/final';
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
      pattern: '', ...c,
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

window.Tone = Tone; // For the scribbletune lib to pick up the instance.

const cache = new InMemoryCache();
const client = new ApolloClient({
  // uri: process.env.REACT_APP_GRAPHQL_ENDPOINT,
  cache,
  resolvers: getResolvers(track),
});

cache.writeQuery({
  query: WRITE_DATA,
  data: {
    ...track,
    isPlaying: false,
  }
});

function App() {

  let channelsCnt;
  let clipsCnt;
  return (
    <ApolloProvider client={client}>
      <Query query={GET_DATA}>
        {({ data: { channels, isPlaying } }) => {
          channelsCnt = channels.length;
          clipsCnt = channels.reduce((acc, ch) => acc === undefined || acc < ch.clips.length ? ch.clips.length : acc, 0);

          return (
          <Container channels={channels} isPlaying={isPlaying} fluid={true}>
            <Row>
              <Col md={11}>
                <div>
                  <Navbar.Brand href="">
                    <img
                      src="logo192.png"
                      className="d-inline-block"
                      alt="Live logo"
                    />
                    Live Scribble
                  </Navbar.Brand>
                </div>
              </Col>

              <Col md={1}>
                <Transport isPlaying={isPlaying} />
              </Col>
            </Row>
            <Row>
              {channelsCnt && channels.map(channel => (
                <Channel channel={channel} key={channel.idx} />
              ))}
              <Master count={channelsCnt && clipsCnt} />
            </Row>
          </Container>
        );}}
      </Query>
    </ApolloProvider>
  );
}

export default App;
