import {useEffect, useState} from "react";
import {buttons} from "../../utils/pad";
import {useLocation, useNavigate} from "react-router-dom";
import MovieDataService from "./../../service/movie.service";
import {CircularProgress} from "@mui/material";
import VideoJS from "../../component/VideoJS";
import ReactHlsPlayer from "@ducanh2912/react-hls-player";

export const MoviePlayerIndex = () => {

    const navigate = useNavigate();
    const {state} = useLocation();
    const item = state.item;
    const [isLoading, setIsLoading] = useState(true);
    const [source, setSource] = useState(null);

    useEffect(async () => {
        const res = await MovieDataService.getPlayerSrc(item.link, item.type).then(res => res.data);
        if("type" in res && res.type === "success"){
            setSource(res.value[1].link);
            console.log(res.value[1].link);
            setIsLoading(false);
        }
    },[])

    const getPlayer = () => {
        return (source.includes("m3u8"))
            ? <ReactHlsPlayer
                src={source}
                autoPlay={false}
                controls={true}
                width="100%"
                height="auto"
            />
            : <video src={source} controls={true} autoPlay={false}/>;
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