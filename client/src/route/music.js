import MusicDataService from "../service/music.service";
import {useContext, useEffect, useState} from "react";
import Player from 'react-material-music-player'
import { Track, PlayerInterface } from 'react-material-music-player'
import * as React from "react";
import {makeStyles} from "@mui/styles";
import {buttons} from "../utils/pad";
import {KeyboardContext} from "../component/VisualKeyboard";
import {KeyContext} from "../provider/HotKeyProvider";
import {TextMusicList} from "../component/TextMusicList";

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
    const [currentPlaylist, setCurrentPlaylist] = useState([]);
    const [searchedMusics, setSearchedMusics] = useState([]);
    const [selectedSearchedMusicIndex, setSelectedSearchedMusicIndex] = useState(0);
    const [isSearching, setIsSearching] = useState(0);
    const [setKeys] = React.useContext(KeyContext);
    const [setIsOpen, setKeyboardCallback, setKeyboardCloseCallback] = useContext(KeyboardContext);

    useEffect(() => {
        playPlaylist([]);
    },[]);

    useEffect(() => {
        setKeys(keyEvents);
        //const track = createTrack("cabeza","Oboy","");
        //playPlaylist([track]);
    },[setSelectedSearchedMusicIndex, setSearchedMusics, selectedSearchedMusicIndex, searchedMusics]);

    const playPlaylist = playlist => {
        PlayerInterface.play(playlist);
    }

    const addToPlaylist = (music) => {
        const track = createTrack(music["tit_art"], music.url);
        PlayerInterface.playLater([track]);
    }

    const addNextMusic = track => {
        PlayerInterface.playNext(track);
    }

    const createTrack = (title_artist, source) => {
        console.log(title_artist)
        const [title, artist] = title_artist.split(" - ");
        return new Track(
            Date.now().toString(),
            null,
            title,
            artist,
            "https://slider.kz/download/-2001651955_68651955/148/cs3-4v4/s/v1/acmp/BKgwi0fdg9gnvFyrKPF75X2bcWXm2nNge-_8zcWYYHCbdz2Mdp6qM9ppS5L3RrKAeUKNs-zjxLoOioYrU_G1acdjpL4rLJO-3MEGOM686KuG5d7VyAJ2m82EffWZYC2RGHp9N5e-5bwPTHHmjGUldaBTSnQzE-zRH_FXYC5lFdzqcKr1gQ/OBOY - Cabeza.mp3?extra=null"
        );
    }

    const searchFiltering = async (search, setSearchedMusics, setSelectedSearchedMusicIndex, setIsSearching) => {
        setIsSearching(1);
        const response = await MusicDataService.search(search);
        if("type" in response.data && response.data.type === "success"){
            setSelectedSearchedMusicIndex(0);
            setSearchedMusics(response.data.value);
            setIsSearching(0);
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
            display: false,
            label:"Se déplacer",
            args: {"move": "down", "setter": setSelectedSearchedMusicIndex, "length": searchedMusics.length},
            callback: ({move, setter, length}) => handleIndexSelection({move, setter, length})
        },
        {
            ...buttons.top,
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
                <Player sx={{ "position":"relative", "borderRadius":"0px"}}/>
            </div>
        </div>
    )
}