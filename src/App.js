import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from '@apollo/client';
import { Query, Mutation } from '@apollo/client/react/components';
import * as Tone from 'tone';

import { GET_DATA, WRITE_DATA, PLAY_ROW } from './gql';
import Transport from './Transport';
import Channel from './Channel';

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

  return (
    <ApolloProvider client={client}>
      <Query query={GET_DATA}>
        {({ data: { channels, isPlaying } }) => { return (
          <Container channels={channels} isPlaying={isPlaying} fluid={true}>
            <Row>
              <Col md={5} />
              <Col md={7}>
                <Transport isPlaying={isPlaying} />
              </Col>
            </Row>
            <Row>
              {channels.length &&
                channels.map(channel => (
                  <Channel channel={channel} key={channel.idx} />
                ))}
              <Col>
                {/* Draw out the buttons on the far right to trigger each row */}
                {channels.length &&
                  channels[0].clips.map((el, idx) => (
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
              </Col>
            </Row>
          </Container>
        );}}
      </Query>
    </ApolloProvider>
  );
}

export default App;
