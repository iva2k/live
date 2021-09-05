import React from 'react';

import ChannelState from './ChannelState';

export default {
  component: ChannelState,
  title: 'ChannelState',
};

// eslint-disable-next-line react/jsx-props-no-spreading
const Template = (args) => <ChannelState {...args} />;

export const Default = Template.bind({});
Default.args = {
  state: 'loaded',
  error: {
    message: '',
  },
};

export const Loading = Template.bind({});
Loading.args = {
  ...Default.args,
  error: {
    ...Default.args.error,
    message: 'Failed something internal to this computer.',
  },
  state: 'loading',
};

export const Error = Template.bind({});
Error.args = {
  ...Default.args,
  error: {
    ...Default.args.error,
    message: 'Failed something internal to this computer.',
  },
  state: 'error',
};
