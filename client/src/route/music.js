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
import {useNavigate} from "react-router-dom";
import {Alert, Dialog, List, ListItem, ListItemText, Snackbar} from "@mui/material";

const useStyle = makeStyles({
    'genreContainer':{
        backgroundColor:"#151515",
        borderRadius:"20px",
        listStyleType:"none",
        margin:"0 4px",
        color:"grey",
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-between",
        height:"100%",
        zIndex:1
    },
    'selectedContainer':{
        margin:"4px 4px 0 4px !important",
        border:"1px solid #485e6d",
    }
})

export const MusicIndex = () => {

    const classes = useStyle();
    const navigate = useNavigate();
    const [snackbar,setSnackbar] = useState({"state": false, "type": null, "message":"" });
    const [addingMusicDialog, setAddingMusicDialog] = useState({open: false, index:0});
    const [searchedMusics, setSearchedMusics] = useState([]);
    const [selectedSearchedMusicIndex, setSelectedSearchedMusicIndex] = useState(0);
    const [isSearching, setIsSearching] = useState(0);
    const [setKeys] = React.useContext(KeyContext);
    const [setIsOpen, setKeyboardCallback, setKeyboardCloseCallback] = useContext(KeyboardContext);
    const [playlist, _setPlaylist] = useState([]);

    const setPlaylist = (e) => {
        _setPlaylist(e);
    }

    useEffect(() => {
        setKeys(keyEvents)
    },[]);

    useEffect(() => {
        if(addingMusicDialog.open){
            setKeys(addingMusicKeyEvents);
        }
        else{
            setKeys(keyEvents);
        }
    },[selectedSearchedMusicIndex, searchedMusics, addingMusicDialog]);

    const addToPlaylist = async music => {
        const res = await MusicDataService.getMp3Link(music["title"], music["artist"]).then(res => res.data);
        if("type" in res && res.type === "success"){
            const result = res.value;
            setPlaylist([...playlist, {
                "src":result.stream,
                "title": music["title"],
                "artist": music["artist"],
            }]);
            setAddingMusicDialog({"index": 0, "open": false});
        }
        else if("type" in res && res.type === "error"){
            setSearchedMusics(e => e.filter(i => i !== music) );
            setSnackbar({"type":"error", "message":"La musique est introuvable !", "state": true});
            setAddingMusicDialog({"index": 0, "open": false});
        }
    }

    const addAfter = async music => {
        const res = await MusicDataService.getMp3Link(music["title"], music["artist"]).then(res => res.data);
        if("type" in res && res.type === "success"){
            const result = res.value;
            setPlaylist([...playlist.slice(0,1), {
                "src":result.stream,
                "title": music["title"],
                "artist": music["artist"],
            }, ...playlist.slice(1, playlist.length)]);
            setAddingMusicDialog({"index": 0, "open": false});
        }
        else if("type" in res && res.type === "error"){
            setSearchedMusics(e => e.filter(i => i !== music) );
            setSnackbar({"type":"error", "message":"La musique est introuvable !", "state": true});
            setAddingMusicDialog({"index": 0, "open": false});
        }
    }


    const searchFiltering = async (search, setSearchedMusics, setSelectedSearchedMusicIndex, setIsSearching) => {
        setIsSearching(1);
        const response = await MusicDataService.search(search, "track");
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
            setTimeout(() => setKeys(keyEvents), 100);
        })
        setIsOpen(true);
    }

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "down") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => modulo(index + shift, length));
    }

    const addingMusicKeyEvents = [
        {
            ...buttons.bottom,
            continuous: true,
            display: false,
            args:{"addingMusicDialog": addingMusicDialog},
            callback: ({addingMusicDialog}) => setAddingMusicDialog({...addingMusicDialog, "index": (addingMusicDialog.index === 1) ? 0 : 1})
        },
        {
            ...buttons.top,
            continuous: true,
            display: false,
            args:{"addingMusicDialog": addingMusicDialog},
            callback: ({addingMusicDialog}) => setAddingMusicDialog({...addingMusicDialog, "index": (addingMusicDialog.index === 1) ? 0 : 1})
        },
        {
            ...buttons.cross,
            label:"Valider",
            args:{"music":searchedMusics[selectedSearchedMusicIndex], "index": addingMusicDialog.index},
            callback: ({music, index}) => (index === 1) ? addAfter(music) : addToPlaylist(music)
        }
    ]

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
            ...buttons.square,
            label: "Réinitialiser",
            callback: () => setSearchedMusics([])
        },
        {
            ...buttons.cross,
            label: "Ajouter",
            callback: () => setAddingMusicDialog(e => { return { ...e, open: true}})
        },
        {
            ...buttons.circle,
            label: "Retour",
            callback: () => navigate("../")
        }
    ]

    return (
        <div className='container' >
            <Snackbar open={snackbar.state} autoHideDuration={6000} onClose={() => setSnackbar({"state": false, "type": "error", "message":"" })}>
                <div>
                    { snackbar.state &&
                        <Alert variant="filled" severity={snackbar.type} sx={{ width: '100%' }}>
                            {snackbar.message}
                        </Alert>
                    }
                </div>
            </Snackbar>
            {
                (searchedMusics.length !== 0) &&
                <Dialog open={addingMusicDialog.open}>
                    <List sx={{pt: 0, paddingBottom:"0"}}>
                        <ListItem sx={{background:`${addingMusicDialog.index === 0 ? "#C5C5C5" : "transparent"}`}}><ListItemText primary="Ajouter à la playlist"/></ListItem>
                        <ListItem sx={{background:`${addingMusicDialog.index === 1 ? "#C5C5C5" : "transparent"}`}}><ListItemText primary="Écouter après"/></ListItem>
                    </List>
                </Dialog>
            }
            <div className='content'>
                <div style={{ display:"flex", flexDirection:"row", flex:1, padding:"8px 4px"}}>
                    <div className={classes.genreContainer} style={{ width:"25%", padding:"20px" }}>
                        {[].map((genre, index) => <span key={index} >{genre.name}</span>)}
                        <div style={{ display:"flex", flexDirection:"column"}}>
                            <span>Créer une playlist</span>
                            <span>Chercher une playlist</span>
                            <span>Mes playlists</span>
                        </div>
                        { playlist.length > 0 &&
                            <div style={{ display:"flex", flexDirection:"column"}}>
                                <h3>Liste de lecture</h3>
                                {playlist.map((e,index) => <span key={index} style={{
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    display: "block",
                                    width: "100%",
                                    overflow:"hidden",
                                    color:`${(index === 0) ? "white" : "grey"}`
                                }}>{e.artist} - {e.title}</span>)}
                            </div>
                        }
                    </div>
                    <div className={classes.genreContainer} style={{ width:"75%" }}>
                        <TextMusicList offset={selectedSearchedMusicIndex} isContainerSelected={true} limit={12} musics={searchedMusics}/>
                    </div>
                </div>
                { playlist.length > 0 &&
                    <AudioPlayer
                        autoPlay
                        hasDefaultKeyBindings={false}
                        //autoPlayAfterSrcChange={true}
                        showJumpControls={false}
                        showFilledVolume={false}
                        customAdditionalControls={[]}
                        layout={"horizontal"}
                        src={playlist[0]?.src}
                        onEnded={_ => setPlaylist((playlist.length === 1) ? [] : playlist.slice(1, playlist.length))}
                    />
                }
            </div>
        </div>
    )
}