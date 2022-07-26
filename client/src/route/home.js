import {makeStyles} from "@mui/styles";
import images from "./../utils/images";
import {buttons} from "../utils/pad";
import {useEffect, useState} from "react";
import * as React from "react";
import {KeyContext} from "../provider/HotKeyProvider";
import {SportsEsports as SportsEsportsIcon, Audiotrack as AudiotrackIcon, Movie as MovieIcon, LiveTv as LiveTvIcon} from '@mui/icons-material';
import {useNavigate} from "react-router-dom";

const useStyle = makeStyles({
    "menuItem":{
        width:"20%",
        height:"100%",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        filter: "grayscale(100%)",
        transition: `200ms ease-in-out`,
        "& img":{
            height:"100%",
            width:"100%",
            display:"block",
            objectFit:"cover"
        }
    },
    "selectedItem":{
        filter:"grayscale(0%)"
    }
})

export const HomeIndex = () => {

    const classes = useStyle();
    const navigate = useNavigate();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [setKeys] = React.useContext(KeyContext);

    useEffect(() => {
        setKeys(keyEvents)
    },[]);

    useEffect(() => {
        setKeys(keyEvents)
    },[selectedIndex, setSelectedIndex]);

    const handleMoves = (increment) => {
        const modulo = (i, n) => {
            return ((i % n) + n) % n;
        };
        const max = 4;
        setSelectedIndex(index => modulo(index + increment, max));
    }

    const keyEvents = [
        {
            ...buttons.left,
            display: false,
            continuous: true,
            args:{"increment":-1},
            callback: ({increment}) => handleMoves(increment)
        }, {
            ...buttons.right,
            continuous: true,
            display: false,
            args:{"increment":1},
            callback: ({increment}) => handleMoves(increment)
        },
        {
            ...buttons.cross,
            label:"Sélectionner",
            callback: () => {
                switch(selectedIndex){
                    case 0:
                        navigate("emulators");
                        break;
                    case 1:
                        navigate("movie");
                        break;
                    case 2:
                        navigate("music");
                        break;
                    case 3:
                        navigate("tv");
                        break;
                }
            }
        }
    ];

    return (
        <div className='container' >
            <div className='content'>
                <ul style={{ display:"flex", height:"100%", flex:1, justifyContent:"center", alignItems:"center" }}>
                    <li className={`${(selectedIndex === 0) ? classes.selectedItem : ""} ${classes.menuItem}`}><img src={images.game} title="game" alt="game"/></li>
                    <li className={`${(selectedIndex === 1) ? classes.selectedItem : ""} ${classes.menuItem}`}><img src={images.tv} title="movie" alt="movie"/></li>
                    <li className={`${(selectedIndex === 2) ? classes.selectedItem : ""} ${classes.menuItem}`}><img src={images.music} title="music" alt="music"/></li>
                    <li className={`${(selectedIndex === 3) ? classes.selectedItem : ""} ${classes.menuItem}`}><img src={images.tv} title="television" alt="television"/></li>
                    <li className={classes.menuItem}>
                        <MovieIcon/>
                        <LiveTvIcon/>
                        <AudiotrackIcon/>
                        <SportsEsportsIcon/>
                    </li>
                </ul>
            </div>
        </div>
    )
}