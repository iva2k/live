import React, { useState } from 'react';
import { Mutation } from '@apollo/client/react/components';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import { STOP_CLIP, PLAY_CLIP } from './gql';
import Editor from './Editor';

function Clip(props) {
  const [showModal, setShowModal] = useState(false);
  // const [isPlaying, setIsPlaying] = useState(false);

  // const [clipStr, setClipStr] = useState(props.clipStr || '');
  const [clipStr] = useState(props.clipStr || '');
  // const [pattern, setPattern] = useState(props.pattern || '');
  const [pattern] = useState(props.pattern || '');

  // const [notes, setNotes] = useState(props.notes || '');
  // const [randomNotes, setRandomNotes] = useState(props.randomNotes || '');
  // const [subdiv, setSubdiv] = useState(props.subdiv || '4n');
  // const [dur, setDur] = useState(props.dur || '4n');

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

  const useRightClick = false; // TODO: UI to change: true;
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

    if (props.activeClipIdx === props.idx) {
      // Clip is playing
      return (
        <Mutation
          mutation={STOP_CLIP}
          variables={{ channelId: props.channelId }}
        >
          {stopClip => (
            <Button variant="danger" onClick={stopClip} onContextMenu={handleRightClick}>
              {' '}
              &#9632;
            </Button>
          )}
        </Mutation>
      );
    } else {
      // Clip is stopped
      return (
        <Mutation
          mutation={PLAY_CLIP}
          variables={{ channelId: props.channelId, clipId: props.idx }}
        >
          {playClip => (
            <Button variant="success" onClick={playClip} onContextMenu={handleRightClick}>
              {' '}
              &#9658;
            </Button>
          )}
        </Mutation>
      );
    }
  };

  const getModal = () => {
    return (
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
  };

  return useRightClick
    ? (
      <div className="clip">
        {getClipButton()}
        {getModal()}
      </div>
    )
    : (
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
  );
}

export default Clip;
