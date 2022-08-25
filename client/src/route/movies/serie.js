import {useEffect, useState} from "react";
import {buttons} from "../../utils/pad";
import {useLocation, useNavigate} from "react-router-dom";
import MovieDataService from "./../../service/movie.service";
import {ModalStepper} from "../../component/ModalStepper";
import {Dialog} from "@mui/material";

export const SeriePlayerIndex = () => {

    const navigate = useNavigate();
    const {state} = useLocation();
    const item = state?.item;
    const [seasons, setSeasons] = useState([]);
    const [preferences, setPreferences] = useState({player: null});
    const [currentEpisode, setCurrentEpisode] = useState({state:-1, url: null, seasonIndex: null, episodeIndex:null });
    const [nextEpisode, setNextEpisode] = useState({state:-1, url: null, seasonIndex: null, episodeIndex:null });

    useEffect(async () => {
        const res = await MovieDataService.getSerieEpisodes(item.link).then(res => res.data);
        if("type" in res && res.type === "success"){
            setSeasons(res.value);
        }
    },[])

    const modalSetCurrentEpisode = async (seasonIndex, episodeIndex, player) => {
        setPreferences({version: player.version, player: player.player});
        setCurrentEpisode({state:0, url: player.link, seasonIndex: seasonIndex, episodeIndex:episodeIndex });
        const res = await MovieDataService.getPlayerSrc(player.link, item.type);
        if("type" in res && res.type === "success"){
            console.log(res.value);
            setCurrentEpisode({state:1, url: null, seasonIndex: seasonIndex, episodeIndex:episodeIndex });
        }
    }

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "top") ? -1 : 1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => modulo(index + shift, length));
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
            ...buttons.cross,
            label: "Voir",
            args:{},
            callback: () => {}
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
                    <ModalStepper seasons={seasons} setCurrentEpisode={modalSetCurrentEpisode}/>
                </Dialog>
            </div>
        </div>
    )
}