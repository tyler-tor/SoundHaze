import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import AudioPlayer from 'react-h5-audio-player';
import { playNext, playPrevious } from '../../store/player';
import { Cover } from '../common';
import './Player.css';

// The player bar is always on screen, fixed to the bottom of the window.
// With nothing chosen yet it says so instead of showing dead controls.
function Player() {
  const dispatch = useDispatch();
  const song = useSelector((state) => state.player.song);
  const queue = useSelector((state) => state.player.queue);

  return (
    <section className='media-player' aria-label='Music player'>
      <div className='media-player-inner'>
        <div className='now-playing'>
          {song ? (
            <>
              <Cover src={song.previewImage} label={song.title} size={112} className='now-playing-cover' />
              <div className='now-playing-text'>
                <Link to={`/songs/${song.id}`} className='now-playing-title'>{song.title}</Link>
                {song.artistName && <span className='now-playing-artist'>{song.artistName}</span>}
              </div>
            </>
          ) : (
            <p className='now-playing-empty'>Pick a song to start listening.</p>
          )}
        </div>
        {/* No song yet: dimmed and `inert`, so keyboard users do not tab into dead controls. */}
        <div className={song ? 'player-controls' : 'player-controls is-idle'} inert={!song}>
        <AudioPlayer
          src={song?.url}
          volume={0.5}
          preload='metadata'
          autoPlay={false}
          autoPlayAfterSrcChange={true}
          layout='horizontal-reverse'
          showSkipControls={queue.length > 1}
          showJumpControls={false}
          customAdditionalControls={[]}
          onClickNext={() => dispatch(playNext())}
          onClickPrevious={() => dispatch(playPrevious())}
          onEnded={() => dispatch(playNext())}
        />
        </div>
      </div>
    </section>
  )
}

export default Player
