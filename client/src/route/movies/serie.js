import {useEffect, useState, useContext} from "react";
import {buttons} from "../../utils/pad";
import {useLocation, useNavigate} from "react-router-dom";
import MovieDataService from "./../../service/movie.service";
import {ModalStepper} from "../../component/ModalStepper";
import {CircularProgress, Dialog} from "@mui/material";
import ReactHlsPlayer from "@ducanh2912/react-hls-player";
import MiscDataService from "../../service/misc.service";
import {KeyContext} from "../../provider/HotKeyProvider";

export const SeriePlayerIndex = () => {

    const navigate = useNavigate();
    const {state} = useLocation();
    const item = state?.item;
    const [seasons, setSeasons] = useState([]);
    const [preferences, setPreferences] = useState({player: null, version:null});
    const [currentEpisode, setCurrentEpisode] = useState({state:-1, url: null, seasonIndex: null, episodeIndex:null });
    const [playerRef, setRef] = useState(null);
    const [setKeys] = useContext(KeyContext);

    useEffect(() => {
        if(playerRef !== null && playerRef !== undefined){
            playerRef.addEventListener('canplay', async _ => {
                if(playerRef.paused){
                    await play({element: playerRef});
                }
            })
            playerRef.addEventListener('ended', async _ => {
                setCurrentEpisode({...currentEpisode, "state": 0});
                let nextOne = {state:0, url: null, seasonIndex: null, episodeIndex:null }
                if(seasons[currentEpisode.seasonIndex][currentEpisode.episodeIndex + 1] !== undefined){
                    nextOne = {...nextOne, seasonIndex: currentEpisode.seasonIndex, episodeIndex: currentEpisode.episodeIndex + 1}
                }
                else if(seasons[currentEpisode.seasonIndex + 1][0] !== undefined){
                    nextOne = {...nextOne, seasonIndex: currentEpisode.seasonIndex + 1, episodeIndex: 0}
                }
                else{
                    return;
                }
                const playerOject = (seasons[nextOne.seasonIndex][nextOne.episodeIndex].find(e => e.player === preferences.player && e.version === preferences.version) ?? seasons[nextOne.seasonIndex][nextOne.episodeIndex].find(e => e.version === preferences.version) ?? seasons[nextOne.seasonIndex][nextOne.episodeIndex][0]);
                const res = await MovieDataService.getLinksFromPlayer(playerOject.link, playerOject.player).then(res => res.data);
                if("type" in res && res.type === "success"){
                    setCurrentEpisode({...nextOne, state:1, url:res.value});
                }
            });
        }
    },[playerRef])

    useEffect(() => {
        if(currentEpisode.state === 1 && currentEpisode.url !== null){
            setKeys(keyEvents);
        }
    },[currentEpisode, playerRef])

    useEffect(async () => {
        const res = await MovieDataService.getSerieEpisodes(item.link).then(res => res.data);
        if("type" in res && res.type === "success"){
            setSeasons(res.value);
        }
    },[])

    const getPlayer = () => {
        setTimeout(() => {
            setRef(document.querySelectorAll("video")[0]);
        },500);
        return (currentEpisode.url.includes("m3u8"))
            ? <ReactHlsPlayer
                src={currentEpisode.url}
                autoPlay={false}
                controls={true}
            />
            : <video src={currentEpisode.url} controls={true} autoPlay={false}/>;
    }

    const modalSetCurrentEpisode = async (seasonIndex, episodeIndex, player) => {
        setPreferences({version: player.version, player: player.player});
        setCurrentEpisode({state:0, url: player.link, seasonIndex: seasonIndex, episodeIndex:episodeIndex });
        const res = await MovieDataService.getLinksFromPlayer(player.link, player.player).then(res => res.data);
        if("type" in res && res.type === "success"){
            setCurrentEpisode({state:1, url: res.value, seasonIndex: seasonIndex, episodeIndex:episodeIndex });
        }
    }

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "top") ? -1 : 1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => modulo(index + shift, length));
    }

    const play = async ({element}) => {
        if(element !== null){
            const result = await MiscDataService.click(element.offsetWidth / 2, element.offsetHeight / 2).then(res => res.data);
            if("type" in result && result.type === "success"){
                element.play();
            }
        }
    }

    const moveVideo = ({move}) => {
        playerRef.currentTime += move * 10;
    }

    const changeEpisode = () => {
        setPreferences({player: null, version:null});
        setCurrentEpisode({state:-1, url: null, seasonIndex: null, episodeIndex:null });
    }

    const keyEvents = [
        {
            ...buttons.bottom,
            display: false,
            continuous: true,
            args: {"move": "bottom", "setter": null, "length": 0},
            callback: handleIndexSelection
        },
        {
            ...buttons.top,
            display: false,
            continuous: true,
            args: {"move": "top", "setter": null, "length": 0},
            callback: handleIndexSelection
        },
        {
            ...buttons.right,
            display: false,
            continuous: true,
            args: {"move": 1},
            callback: moveVideo
        },
        {
            ...buttons.left,
            display: false,
            continuous: true,
            args: {"move": -1},
            callback: moveVideo
        },
        {
            ...buttons.cross,
            label: "Voir",
            args:{element: playerRef},
            callback: play
        },{
            ...buttons.triangle,
            label: "Choisir l'épisode",
            callback: changeEpisode
        },
        {
            ...buttons.circle,
            label: "Retour",
            callback: () => navigate("/movies")
        },
    ]

    return (
        <div className='container' >
            <div className='content'>
                <Dialog open={seasons.length > 0 && currentEpisode.state === -1} PaperProps={{style: { height:"80%", overflow:"hidden"} }}>
                    <ModalStepper canSetKeys={currentEpisode.state !== 1 || currentEpisode.url === null} seasons={seasons} setCurrentEpisode={modalSetCurrentEpisode}/>
                </Dialog>
                { (currentEpisode.state === 1 && currentEpisode.url !== null)
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