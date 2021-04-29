import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player(){
    const audioRef = useRef<HTMLAudioElement>(null); // typescript
    const [progress, setProgress] = useState(0);

    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying,
        isLooping,
        isShuffling,
        toggleShuffling, 
        togglePlay,
        toggleLoop,
        playNext, 
        playPrevious, 
        hasNext,
        hasPrevious,
        clearPlayerState,
        setIsPlayingState } = usePlayer();

    useEffect(() => {
        if(!audioRef.current){
            return; // não retorna nada, se a var estiver null 
        }

        if(isPlaying){
            audioRef.current.play(); // true 
        } else {
            audioRef.current.pause(); // false
        }

    }, [isPlaying]) // dispara essa função todo fez q o isPlaying for alterado 

    function setupProgressListener(){
        audioRef.current.currentTime = 0; // volta o player para a estaca 0

        audioRef.current.addEventListener('timeupdate', () =>{
            setProgress(Math.floor(audioRef.current.currentTime)); // retorna o tempo atual do player 
        });
    }

    function handleSeek(amount: number){ // numero da duração do time 
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded(){
        if(hasNext){
            playNext(); // ira tocar proxima musica 
        } else {
            clearPlayerState(); // limpa o estado 
        }
    }

    const episode = episodeList[currentEpisodeIndex];

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora</strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image width={592} height={592} src={episode.thumbnail} objectFit="cover" />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                <strong>Selecione um podcast para ouvir</strong>
                </div>
            ) }


            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        
                        { episode ? (
                           <Slider 
                            max={episode.duration}
                            value={progress}
                            onChange={handleSeek}
                            trackStyle={{ backgroundColor: '#84d361'}}
                            railStyle={{ backgroundColor: '#9f75ff'}}
                            handleStyle={{ borderColor: '#84d361'}}/>     
                        ) : (
                            <div className={styles.emptySlider} />
                        ) }
                  
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode && (
                    <audio 
                        src={episode.url}
                        ref={audioRef}
                        loop={isLooping}
                        autoPlay
                        onEnded={handleEpisodeEnded}
                        onPlay={() => setIsPlayingState(true)} 
                        onPause={()=> setIsPlayingState(false)}
                        onLoadedMetadata={setupProgressListener}
                    />
                )}

                <div className={styles.buttons}>
                    <button type="button" disabled={!episode || episodeList.length === 1} onClick={toggleShuffling} className={isShuffling ? styles.isActive : ''}>
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>
                    <button type="button" onClick={playPrevious}  disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"/>
                    </button>
                    <button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
                        { isPlaying 
                            ?  <img src="/pause.svg" alt="Tocar"/> 
                            : <img src="/play.svg" alt="Tocar"/> }
                        
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima"/>
                    </button>
                    <button type="button" disabled={!episode} onClick={toggleLoop} className={isLooping ? styles.isActive : ""}>
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>
        </div>
    );
}
