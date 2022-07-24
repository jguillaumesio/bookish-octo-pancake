import MusicDataService from "../service/music.service";
import {useContext, useEffect, useState} from "react";
import * as React from "react";
import {makeStyles} from "@mui/styles";
import {buttons} from "../utils/pad";
import {KeyboardContext} from "../component/VisualKeyboard";
import {KeyContext} from "../provider/HotKeyProvider";
import {TextMusicList} from "../component/TextMusicList";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const useStyle = makeStyles({
    'genreContainer':{
        backgroundColor:"#131313",
        borderRadius:"20px",
        listStyleType:"none",
        margin:"8px 8px 0 8px",
        color:"grey",
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-evenly",
        padding:"0 20px",
        zIndex:1
    },
    'selectedContainer':{
        margin:"4px 4px 0 4px !important",
        border:"1px solid #485e6d",
    }
})

export const MusicIndex = () => {

    const classes = useStyle();
    const [searchedMusics, setSearchedMusics] = useState([]);
    const [selectedSearchedMusicIndex, setSelectedSearchedMusicIndex] = useState(0);
    const [isSearching, setIsSearching] = useState(0);
    const [setKeys] = React.useContext(KeyContext);
    const [setIsOpen, setKeyboardCallback, setKeyboardCloseCallback] = useContext(KeyboardContext);
    const [playlist, setPlaylist] = useState([]);

    useEffect(() => {
        setKeys(keyEvents)
    },[]);

    useEffect(() => {
        setKeys(keyEvents);
    },[selectedSearchedMusicIndex, searchedMusics]);

    const addToPlaylist = music => {
        setPlaylist(playlist => [...playlist, music.stream])
    }

    const searchFiltering = async (search, setSearchedMusics, setSelectedSearchedMusicIndex, setIsSearching) => {
        setIsSearching(1);
        const response = await MusicDataService.search(search);
        if("type" in response.data && response.data.type === "success"){
            setSelectedSearchedMusicIndex(0);
            setIsSearching(0);
            setSearchedMusics(response.data.value);
        }
    }

    const handleSearchFiltering = async ({setSearchedMusics, setSelectedSearchedMusicIndex, setIsSearching}) => {
        setKeyboardCallback(_ => async (search) => {
            await searchFiltering(search, setSearchedMusics, setSelectedSearchedMusicIndex, setIsSearching);
        });
        setKeyboardCloseCallback(_ => () => {
            setKeys(keyEvents)
        })
        setIsOpen(true);
    }

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "down") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => modulo(index + shift, length));
    }

    const keyEvents = [
        {
            ...buttons.bottom,
            continuous: true,
            display: false,
            label:"Se déplacer",
            args: {"move": "down", "setter": setSelectedSearchedMusicIndex, "length": searchedMusics.length},
            callback: ({move, setter, length}) => handleIndexSelection({move, setter, length})
        },
        {
            ...buttons.top,
            continuous: true,
            display: false,
            label:"Se déplacer",
            args: {"move": "up", "setter": setSelectedSearchedMusicIndex, "length": searchedMusics.length},
            callback: ({move, setter, length}) => handleIndexSelection({move, setter, length})
        },
        {
            ...buttons.triangle,
            label: "Chercher",
            args:{"setSearchedMusics": setSearchedMusics, "setSelectedSearchedMusicIndex": setSelectedSearchedMusicIndex, "setIsSearching": setIsSearching},
            callback: handleSearchFiltering
        },
        {
            ...buttons.cross,
            label: "Ajouter",
            args:{"music": searchedMusics[selectedSearchedMusicIndex]},
            callback: ({music}) => addToPlaylist(music)
        }
    ]

    return (
        <div className='container' >
            <div className='content'>
                <div style={{ display:"flex", flexDirection:"row", flex: 1, padding:"0px 8px 8px 8px"}}>
                    <div className={classes.genreContainer}>
                        {[].map((genre, index) => <span key={index} >{genre.name}</span>)}
                    </div>
                    <div className={classes.genreContainer}>
                        <TextMusicList offset={selectedSearchedMusicIndex} isContainerSelected={true} limit={12} musics={searchedMusics}/>
                    </div>
                </div>
                <AudioPlayer
                    autoPlay
                    src={playlist[0]}
                    onEnded={_ => setPlaylist(e => (e.length === 1) ? [] : e.slice(1, e.length))}
                />
            </div>
        </div>
    )
}