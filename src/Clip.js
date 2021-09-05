import React, { useState } from 'react';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import Editor from './Editor';

function Clip({ clip, showGears, stopClip, playClip }) {
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

  // Pattern: "avoid binding arrow functions in render"
  const handleRightClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
  const onShowModal = () => {
    setShowModal(true);
  };
  const onHideModal = () => {
    setShowModal(false);
  };

  // Pattern: "avoid binding arrow functions in render"
  const ClipDisabledButton = () => (
    <Button variant="outline-secondary" onContextMenu={handleRightClick}>
      &#x25CB;
    </Button>
  );

  // Pattern: "avoid binding arrow functions in render"
  const ClipStopButton = () => {
    const onButtonClick = () => {
      stopClip?.({ variables: { channelIdx: clip.channelIdx } });
    };
    return (
      <Button variant="danger" onClick={onButtonClick} onContextMenu={handleRightClick}>
        {' '}
        &#9632;
      </Button>
    );
  };

  // Pattern: "avoid binding arrow functions in render"
  const ClipPlayButton = () => {
    const onButtonClick = () => {
      playClip?.({ variables: { channelIdx: clip.channelIdx, clipId: clip.idx } });
    };
    return (
      <Button variant="success" onClick={onButtonClick} onContextMenu={handleRightClick}>
        {' '}
        &#9658;
      </Button>
    );
  };

  const ClipButton = () => {
    if (!clip.pattern && (!clip.clipStr || clip.clipStr === "''")) {
      return <ClipDisabledButton />;
    }

    if (clip.activeClipIdx === clip.idx) {
      // Clip is playing
      return <ClipStopButton />;
    }
    // Clip is stopped
    return <ClipPlayButton />;
  };

  const GearsButton = () => (
    <Button variant={clip.pattern || clip.clipStr ? 'secondary' : 'outline-secondary'} onClick={onShowModal}>
      ⚙
    </Button>
  );

  const EditorModal = () => (
    <Modal show={showModal} onHide={onHideModal}>
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
        <ClipButton />
        <GearsButton />
      </ButtonGroup>
      <EditorModal />
    </div>
  ) : (
    <div className="clip">
      <ClipButton />
      <EditorModal />
    </div>
  );
}

export default Clip;
