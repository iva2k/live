import React, { useState } from 'react';
import { Mutation } from '@apollo/client/react/components';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import { STOP_CLIP, PLAY_CLIP } from './gql';
import Editor from './Editor';

function Clip(props) {
  const { clip, showGears } = props;
  const [showModal, setShowModal] = useState(false);
  // const [isPlaying, setIsPlaying] = useState(false);

  // const [clipStr, setClipStr] = useState(clip.clipStr || '');
  const [clipStr] = useState(clip.clipStr || '');
  // const [pattern, setPattern] = useState(clip.pattern || '');
  const [pattern] = useState(clip.pattern || '');

  // const [notes, setNotes] = useState(clip.notes || '');
  // const [randomNotes, setRandomNotes] = useState(clip.randomNotes || '');
  // const [subdiv, setSubdiv] = useState(clip.subdiv || '4n');
  // const [dur, setDur] = useState(clip.dur || '4n');

  // useEffect(() => {
  //   const clipCode = document.getElementById('clipCode');

  //   /*eslint-disable */
  //   clipCode &&
  //     CodeMirror.fromTextArea(clipCode, {
  //       lineNumbers: true,
  //       mode: 'javascript',
  //     });
  //   /*eslint-enable */
  // });

  const handleRightClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
  const getClipButton = () => {
    if (!pattern && clipStr === "''") {
      return (
        <Button variant="outline-secondary" onContextMenu={handleRightClick}>
          &#x25CB;
        </Button>
      );
    }

    if (clip.activeClipIdx === clip.idx) {
      // Clip is playing
      return (
        <Mutation mutation={STOP_CLIP} variables={{ channelIdx: clip.channelIdx }}>
          {(stopClip) => (
            <Button variant="danger" onClick={stopClip} onContextMenu={handleRightClick}>
              {' '}
              &#9632;
            </Button>
          )}
        </Mutation>
      );
    }
    // Clip is stopped
    return (
      <Mutation mutation={PLAY_CLIP} variables={{ channelIdx: clip.channelIdx, clipId: clip.idx }}>
        {(playClip) => (
          <Button variant="success" onClick={playClip} onContextMenu={handleRightClick}>
            {' '}
            &#9658;
          </Button>
        )}
      </Mutation>
    );
  };

  const getModal = () => (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit clip</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Editor />
        {/* <textarea
            id="clipCode"
            onChange={e => setClipStr(e.target.value)}
            value={clipStr}
          /> */}
      </Modal.Body>
    </Modal>
  );

  return showGears ? (
    <div className="clip">
      <ButtonGroup>
        {getClipButton()}
        <Button
          variant={pattern || clipStr ? 'secondary' : 'outline-secondary'}
          onClick={() => setShowModal(true)}
          dangerouslySetInnerHTML={{
            __html: '⚙',
          }}
        />
      </ButtonGroup>
      {getModal()}
    </div>
  ) : (
    <div className="clip">
      {getClipButton()}
      {getModal()}
    </div>
  );
}

export default Clip;
