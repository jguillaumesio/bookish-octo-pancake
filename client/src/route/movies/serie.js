import {useEffect} from "react";
import {buttons} from "../../utils/pad";
import {useLocation, useNavigate} from "react-router-dom";
import MovieDataService from "./../../service/movie.service";

export const SeriePlayerIndex = () => {

    const navigate = useNavigate();
    const {state} = useLocation();
    const item = state.item;

    useEffect(async () => {
        const res = await MovieDataService.getPlayerSrc(item.link, item.type).then(res => res.data);
        if("type" in res && res.type === "success"){
            console.log(res);
        }
    },[])

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

            </div>
        </div>
    )
}