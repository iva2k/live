import { gql } from '@apollo/client';

export const GET_DATA = gql`
  query {
    channels @client {
      idx
      activeClipIdx
      name
      volume
      clips @client {
        clipStr
      }
    }
    isPlaying @client
  }
`;

export const WRITE_DATA = gql`
  query {
    channels @client
    isPlaying @client
  }
`;

export const PLAY_ROW = gql`
  mutation playRow($activeClipIdx: Number!) {
    playRow(activeClipIdx: $activeClipIdx) @client
  }
`;

export const STOP_CLIP = gql`
  mutation stopClip($channelIdx: Number!) {
    stopClip(channelIdx: $channelIdx) @client
  }
`;

export const PLAY_CLIP = gql`
  mutation playClip($channelIdx: Number!, $clipId: Number!) {
    playClip(channelIdx: $channelIdx, clipId: $clipId) @client
  }
`;

export const START_STOP_TRACK = gql`
  mutation startStopTrack($isPlaying: Boolean!) {
    startStopTrack(isPlaying: $isPlaying) @client
  }
`;

export const SET_VOLUME = gql`
  mutation setVolume($channelIdx: Number!, $volume: Number!) {
    setVolume(channelIdx: $channelIdx, volume: $volume) @client
  }
`;
