import React, { useState } from 'react';
import { Container, Button, Row, Col } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
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

const trackFileName = 'final.js';
const track = {
  ...trackRaw,
  channels: trackRaw.channels.map((ch, idx) => {
    if (ch.external) {
      ch.external = {
        ...ch.external,
        __typename: 'ExternalOutput',
      };
    }
    ch.clips = ch.clips.map((c) => ({
      pattern: '',
      ...c,
      ...{ clipStr: c.pattern ? JSON.stringify(c) : "''" },
      __typename: 'Clip',
    }));
    return {
      ...ch,
      __typename: 'Channel',
      activeClipIdx: -1,
      idx,
    };
  }),
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
  },
});

// Globals for mouse/pointer tracking in number spinner control (bpm)
// TODO: Move to a separate context, make spinner component
let repeatingBtnIntervalId;
let repeatingBtnTimeoutId;
let repeatingBtnClickCnt;
let repeatingBtnPointerIn;
// let repeatingBtnInOurClickHandler; // Guard from events produced by our evt.target.click() // TODO: Needed??

const repeatingBtnSlowTimeMs = 200;
const repeatingBtnFastTimeMs = 100;
const repeatingBtnFastDelayMs = 2000;

const enableSidebar = false;
const enableMenubar = false;

function App() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGears, setShowGears] = useState(false);
  const [bpmValue, setBpmValue] = useState(120.0);
  // TODO: connect bpm to scribbltune

  const onSidebarClose = () => setShowSidebar(false);
  const onSidebarOpen = () => setShowSidebar(true);
  const handleShowGearsChangeEvent = () => {
    setShowGears(!showGears);
  };
  const handleBpmChangeEvent = (evt) => {
    setBpmValue(+evt.target.value || bpmValue); // Primitive validation // TODO: Better validations (range)
  };

  // Handler for mouse/pointer tracking in number spinner control (bpm)
  // Produce repeating clicks action on the button while mouse is being held down.
  // TODO: Find a way to stop repeating action while pointer being pressed down and leaves the button.
  // With    evt.target.setPointerCapture() stops all enter/leave events from being delivered.
  // Without evt.target.setPointerCapture() up events are not delivered when pointer is outside of button.
  // Perhaps can attach mouseup listener to the body element and work without evt.target.setPointerCapture()
  const handleSpinnerButtonPointerEvents = (evt) => {
    // console.log('handleSpinnerButtonPointerEvents(evt.type=%o evt.button=%o evt.target=%o evt.srcElement=%o) repeatingBtnPointerIn=%o repeatingBtnClickCnt=%o', evt.type, evt.button, evt.target, evt.srcElement, repeatingBtnPointerIn, repeatingBtnClickCnt);

    // Track pointer regardless of which mouse button
    if (evt.type === 'pointerenter' || evt.type === 'mouseenter' || evt.type === 'mouseover') {
      repeatingBtnPointerIn = true;
    } else if (
      evt.type === 'pointerout' ||
      evt.type === 'pointerleave' ||
      evt.type === 'mouseleave' ||
      evt.type === 'mouseout'
    ) {
      repeatingBtnPointerIn = false;
    }

    // The rest of events of interest should be for left-click
    if (evt.button !== 0) {
      return;
    }

    if (evt.type === 'pointerdown') {
      evt.preventDefault();
      // console.log('click first');
      // evt.target.click();
      repeatingBtnPointerIn = true;
      // repeatingBtnInOurClickHandler = false;
      repeatingBtnClickCnt = 0;
      evt.target.setPointerCapture(evt.pointerId);

      clearTimeout(repeatingBtnTimeoutId);
      clearInterval(repeatingBtnIntervalId);

      // Start repeating with slow interval
      repeatingBtnIntervalId = setInterval(() => {
        // if (repeatingBtnPointerIn && !repeatingBtnInOurClickHandler) {
        if (repeatingBtnPointerIn) {
          // console.log('click repeat slow repeatingBtnPointerIn=%o', repeatingBtnPointerIn);
          // repeatingBtnInOurClickHandler = true;
          evt.target.click();
          // repeatingBtnInOurClickHandler = false;
          repeatingBtnClickCnt += 1;
        }
      }, repeatingBtnSlowTimeMs);

      // Set delay to switch repeating to fast interval
      repeatingBtnTimeoutId = setTimeout(() => {
        // Change repeating to fast interval
        clearInterval(repeatingBtnIntervalId);
        repeatingBtnIntervalId = setInterval(() => {
          // if (repeatingBtnPointerIn && !repeatingBtnInOurClickHandler) {
          if (repeatingBtnPointerIn) {
            // console.log('click repeat fast repeatingBtnPointerIn=%o', repeatingBtnPointerIn);
            // repeatingBtnInOurClickHandler = true;
            evt.target.click();
            // repeatingBtnInOurClickHandler = false;
            repeatingBtnClickCnt += 1;
          }
        }, repeatingBtnFastTimeMs);
      }, repeatingBtnFastDelayMs);
    } else if (evt.type === 'pointerup' || evt.type === 'pointercancel') {
      // evt.preventDefault();
      evt.target.releasePointerCapture(evt.pointerId);
      clearTimeout(repeatingBtnTimeoutId);
      // console.log('after clearTimeout(repeatingBtnTimeoutId)');
      clearInterval(repeatingBtnIntervalId);
      // console.log('after clearInterval(repeatingBtnIntervalId)');
      repeatingBtnIntervalId = undefined;
      repeatingBtnTimeoutId = undefined;
      if (repeatingBtnClickCnt !== 0) {
        // evt.preventDefault();
        // } else if (repeatingBtnPointerIn && !repeatingBtnInOurClickHandler) {
      } else if (repeatingBtnPointerIn) {
        // console.log('click once repeatingBtnPointerIn=%o', repeatingBtnPointerIn);
        // repeatingBtnInOurClickHandler = true; evt.target.click(); repeatingBtnInOurClickHandler = false;
        repeatingBtnClickCnt += 1;
      }
      repeatingBtnPointerIn = false;
    }
  };
  const handleBpmDecrEvent = () => {
    setBpmValue(bpmValue - 1);
    // console.log('handleBpmDecrEvent() %o', bpmValue);
  };
  const handleBpmIncrEvent = () => {
    setBpmValue(bpmValue + 1);
    // console.log('handleBpmIncrEvent() %o', bpmValue);
  };

  let channelsCnt;
  let clipsCnt;
  return (
    <ApolloProvider client={client}>
      <Query query={GET_DATA}>
        {({ data: { channels, isPlaying } }) => {
          channelsCnt = channels.length;
          clipsCnt = channels.reduce(
            (acc, ch) => (acc === undefined || acc < ch.clips.length ? ch.clips.length : acc),
            0
          );

          return (
            <Container fluid>
              <Row md={12} className="">
                <Col md={12}>
                  <Navbar bg="primary" variant="dark" className="toolbar">
                    {enableSidebar && (
                      <>
                        <Offcanvas show={showSidebar} onHide={onSidebarClose}>
                          <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Offcanvas</Offcanvas.Title>
                          </Offcanvas.Header>
                          <Offcanvas.Body>
                            <ListGroup>
                              <ListGroup.Item>Uno</ListGroup.Item>
                              <ListGroup.Item>Dos</ListGroup.Item>
                              <ListGroup.Item>Tres</ListGroup.Item>
                              <ListGroup.Item>About</ListGroup.Item>
                            </ListGroup>
                          </Offcanvas.Body>
                        </Offcanvas>
                        <Nav.Link onClick={onSidebarOpen} className="btn-sidebar-open">
                          &#9776;
                        </Nav.Link>
                      </>
                    )}

                    <Navbar.Brand href="#home">
                      <img src="logo192.png" className="d-inline-block" alt="Live logo" />
                      <span>Live Scribble</span>
                    </Navbar.Brand>

                    {enableMenubar && (
                      <>
                        <Nav className="me-auto">
                          <Nav.Link href="#home">Home</Nav.Link>
                          <Nav.Link href="#features">Features</Nav.Link>
                        </Nav>
                      </>
                    )}

                    <Navbar.Text>
                      <Form>
                        <Form.Switch
                          onChange={handleShowGearsChangeEvent}
                          id="custom-switch"
                          label="⚙"
                          checked={showGears}
                          // disabled // apply if you want the switch disabled
                        />
                      </Form>
                    </Navbar.Text>

                    <Navbar.Collapse className="justify-content-end">
                      <Navbar.Text className="file-name">{trackFileName}</Navbar.Text>

                      <Navbar.Text className="field-bpm">
                        <Form>
                          <Form.Group as={Row} className="my-0 my-auto" controlId="controlBpm">
                            <Col md={3} className="mx-0 my-auto px-0 py-0" />
                            <Col md={6} className="mx-0 my-auto px-0 py-0 btn-group">
                              <div as="div" className="mx-0 my-auto px-1 py-0">
                                <Button
                                  onClick={handleBpmDecrEvent}
                                  onPointerDown={handleSpinnerButtonPointerEvents}
                                  onPointerUp={handleSpinnerButtonPointerEvents}
                                  onPointerLeave={handleSpinnerButtonPointerEvents}
                                  onPointerEnter={handleSpinnerButtonPointerEvents}
                                  onMouseLeave={handleSpinnerButtonPointerEvents}
                                  onMouseEnter={handleSpinnerButtonPointerEvents}
                                  onMouseOut={handleSpinnerButtonPointerEvents}
                                  onMouseOver={handleSpinnerButtonPointerEvents}
                                >
                                  -
                                </Button>
                              </div>
                              <Form.Control
                                className="mx-0 my-auto px-0"
                                type="number"
                                size="sm"
                                htmlSize="5"
                                name="bpm"
                                value={bpmValue}
                                onChange={handleBpmChangeEvent}
                              />
                              <div as="div" className="mx-0 my-auto px-0 py-0">
                                <Button
                                  onClick={handleBpmIncrEvent}
                                  onPointerDown={handleSpinnerButtonPointerEvents}
                                  onPointerUp={handleSpinnerButtonPointerEvents}
                                  onPointerLeave={handleSpinnerButtonPointerEvents}
                                  onPointerEnter={handleSpinnerButtonPointerEvents}
                                  onMouseLeave={handleSpinnerButtonPointerEvents}
                                  onMouseEnter={handleSpinnerButtonPointerEvents}
                                  onMouseOut={handleSpinnerButtonPointerEvents}
                                  onMouseOver={handleSpinnerButtonPointerEvents}
                                >
                                  +
                                </Button>
                              </div>
                            </Col>
                            <Col md={3} className="mx-0 my-auto px-1 py-0">
                              <Form.Label className="mx-0 my-auto">bpm</Form.Label>
                            </Col>
                          </Form.Group>
                        </Form>
                      </Navbar.Text>

                      <Navbar.Text className="transport">
                        <Transport isPlaying={isPlaying} />
                      </Navbar.Text>
                    </Navbar.Collapse>
                  </Navbar>
                </Col>
              </Row>
              <Row>
                {channelsCnt &&
                  channels.map((channel) => <Channel channel={channel} key={channel.idx} showGears={showGears} />)}
                <Master count={channelsCnt && clipsCnt} />
              </Row>
            </Container>
          );
        }}
      </Query>
    </ApolloProvider>
  );
}

export default App;
