import React from 'react';
import { connect } from 'react-redux';
import Channel from './Channel';
import Rows from './Rows';

const App = ({ channels }) => {
  const channelsList = channels.map((ch, idx) => <Channel key={idx} channel={ch} />);

  // Get the channel with the maximum number of clips and set that as the total number of rows required
  const getRowsCount = () => {
    let count = 0;

    channels.forEach(ch => {
      if (ch.clips.length > count) {
        count = ch.clips.length;
      }
    });

    return count;
  };

  return (
    <div className="row">
      {channelsList}
      <Rows rowsCount = {getRowsCount()} />
    </div>
  );
};

const mapStateToProps = state => ({ channels: state.channels });
export default connect(mapStateToProps)(App);