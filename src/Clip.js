import React, { useState } from 'react';
import { Mutation } from '@apollo/client/react/components';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import { STOP_CLIP, PLAY_CLIP } from './gql';
import Editor from './Editor';

function Clip(props) {
  const { clip, showGears } = props;
  const [showModal, setShowModal] = useState(false);

  // console.log('REDRAW: Channel %o Clip %o clip.pattern=%o', clip.channelIdx, clip.idx, clip.pattern);

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
    if (!clip.pattern && clip.clipStr === "''") {
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
        <Modal.Title>
          Edit Clip {clip.idx} Channel {clip.channelIdx} {clip.channelName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Editor clip={clip} />
        {/* <textarea
            id="clipCode"
            onChange={e => setClipStr(e.target.value)}
            value={clip.clipStr}
          /> */}
      </Modal.Body>
    </Modal>
  );

  return showGears ? (
    <div className="clip">
      <ButtonGroup>
        {getClipButton()}
        <Button
          variant={clip.pattern || clip.clipStr ? 'secondary' : 'outline-secondary'}
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
