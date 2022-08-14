import {useEffect, useState, useContext} from "react";
import {buttons} from "../../utils/pad";
import {useLocation, useNavigate} from "react-router-dom";
import MovieDataService from "./../../service/movie.service";
import MiscDataService from "./../../service/misc.service";
import {CircularProgress, Dialog, DialogTitle, List, ListItem, ListItemText} from "@mui/material";
import ReactHlsPlayer from "@ducanh2912/react-hls-player";
import {KeyContext} from "../../provider/HotKeyProvider";

export const MoviePlayerIndex = () => {

    const navigate = useNavigate();
    const {state} = useLocation();
    const item = state.item;
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);
    const [availableSources, setAvailableSources] = useState(null);
    const [source, setSource] = useState(null);
    const [playerRef, setRef] = useState(null);
    const [setKeys] = useContext(KeyContext);

    useEffect(() => {
        const events = (source !== null) ? movieKeyEvents : selectorKeyEvents;
        setKeys(events);
    },[source, playerRef, availableSources, selectedSourceIndex])

    useEffect(async () => {
        const res = await MovieDataService.getPlayerSrc(item.link, item.type).then(res => res.data);
        if("type" in res && res.type === "success"){
            setAvailableSources(res.value);
            setIsLoading(false);
        }
    },[]);

    const getPlayer = () => {
        setTimeout(() => {
            setRef(document.querySelectorAll("video")[0]);
        },500);
        return (source.includes("m3u8"))
            ? <ReactHlsPlayer
                src={source}
                autoPlay={false}
                controls={true}
              />
            : <video src={source} controls={true} autoPlay={false}/>;
    }

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "top") ? -1 : 1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => modulo(index + shift, length));
    }

    const choose = ({index}) => {
        setSource(availableSources[index]?.link);
        setAvailableSources(null);
    }

    const play = async ({element}) => {
        if(element !== null){
            const result = await MiscDataService.click(element.offsetWidth / 2, element.offsetHeight / 2).then(res => res.data);
            if("type" in result && result.type === "success"){
                element.play();
            }
        }
    }

    const pause = async ({element}) => {
        if(element !== null){
            const result = await MiscDataService.click(element.offsetWidth / 2, element.offsetHeight / 2).then(res => res.data);
            if("type" in result && result.type === "success"){
                element.pause();
            }
        }
    }

    const movieKeyEvents = [
        {
            ...buttons.square,
            label: "Pause",
            args:{element: playerRef},
            callback: pause
        },
        {
            ...buttons.cross,
            label: "Voir",
            args:{element: playerRef},
            callback: play
        },
        {
            ...buttons.circle,
            label: "Retour",
            callback: () => navigate("/movies")
        },
    ];

    const selectorKeyEvents = [
        {
            ...buttons.bottom,
            display: false,
            continuous: true,
            args: {"move": "bottom", "setter": setSelectedSourceIndex, "length": availableSources?.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.top,
            display: false,
            continuous: true,
            args: {"move": "top", "setter": setSelectedSourceIndex, "length": availableSources?.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.cross,
            label: "Voir",
            args:{index: selectedSourceIndex},
            callback: choose
        },
    ]

    return (
        <div className='container' >
            <Dialog open={availableSources !== null && source === null}>
                <DialogTitle>Liste de lecture</DialogTitle>
                <List sx={{pt: 0}}>
                    {(availableSources ?? []).map((element, index) => (
                        <ListItem key={index} sx={{background:`${index === selectedSourceIndex ? "#C5C5C5" : "transparent"}`}}>
                            <ListItemText primary={element.version} secondary={element.player}/>
                        </ListItem>
                    ))}
                </List>
            </Dialog>
            <div className='content'>
                <button id="domInteract" style={{ display:"none"}}></button>
                { (source !== null && !isLoading)
                ?
                    <div>
                        {getPlayer()}
                    </div>
                :
                <div style={{ display:"flex", width: "100%", height:"100%", alignItems:"center", justifyContent:"center"}}>
                    <CircularProgress/>
                </div>
                }
            </div>
        </div>
    )
}