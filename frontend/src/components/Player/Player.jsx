import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AudioPlayer from 'react-h5-audio-player';
import { playNext, playPrevious } from '../../store/player';
import './Player.css';

function Player() {
  const dispatch = useDispatch();
  const song = useSelector((state) => state.player.song);
  const queue = useSelector((state) => state.player.queue);
  const index = useSelector((state) => state.player.index);

  const header = song && (
    <div className='now-playing'>
      <img
        className='now-playing-cover'
        src={song.previewImage}
        alt=''
        width='40'
        height='40'
        decoding='async'
      />
      <div className='now-playing-text'>
        <strong className='now-playing-title'>{song.title}</strong>
        {song.artistName && <span className='now-playing-artist'>{song.artistName}</span>}
      </div>
    </div>
  );

  return (
    <div className='media-player'>
      <AudioPlayer
        src={song?.url}
        header={header}
        volume={0.5}
        preload='metadata'
        autoPlay={false}
        autoPlayAfterSrcChange={true}
        showSkipControls={queue.length > 1}
        showJumpControls={false}
        onClickNext={() => dispatch(playNext())}
        onClickPrevious={() => dispatch(playPrevious())}
        onEnded={() => dispatch(playNext())}
      />
    </div>
  )
}

export default Player
