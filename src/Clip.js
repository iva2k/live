import React from 'react';
import { ButtonGroup, Button } from 'react-bootstrap';

function Clip({ clip, showGears, stopClip, playClip, setShowModal }) {
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
    setShowModal?.({ show: true, clip });
  };
  const onShowModal = () => {
    setShowModal?.({ show: true, clip });
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

  return showGears ? (
    <div className="clip">
      <ButtonGroup>
        <ClipButton />
        <GearsButton />
      </ButtonGroup>
    </div>
  ) : (
    <div className="clip">
      <ClipButton />
    </div>
  );
}

export default Clip;
