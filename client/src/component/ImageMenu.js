import {makeStyles} from "@mui/styles";
import images from "./../utils/images";
import {buttons} from "../utils/pad";
import {useEffect, useState} from "react";
import * as React from "react";
import {KeyContext} from "../provider/HotKeyProvider";
import {SportsEsports as SportsEsportsIcon, Audiotrack as AudiotrackIcon, Movie as MovieIcon, LiveTv as LiveTvIcon} from '@mui/icons-material';
import {useNavigate} from "react-router-dom";
import "./../assets/css/slideFromTopAnimation.css";

const useStyle = makeStyles({
    "selectedIcon":{
        color: "white",
        animation: "200ms slideFromTop"
    },
    "menuItem":{
        //width:"18%",
        height:"100%",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        filter: "grayscale(100%)",
        transition: `200ms ease-in-out`,
        "& svg":{
            height:"70px",
            width:"100%"
        },
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

export const ImageMenu = ({items, onValidate, onLeave, style}) => {

    const classes = useStyle();
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
        const max = items.length;
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
            args: {"selectedIndex": selectedIndex},
            callback: ({selectedIndex}) => onValidate(selectedIndex)
        },
        {
            ...buttons.circle,
            label:"Retour",
            callback: () => onLeave()
        }
    ];

    return (
        <ul style={style}>
            { items.map( (item, index) => <li key={index} style={{ width:`${(100-28)/items.length}%`}} className={`${(selectedIndex === index) ? classes.selectedItem : ""} ${classes.menuItem}`}><img src={item.image} title={item.name} alt={item.name}/></li>)}
            { items.map( (item, index) => selectedIndex === index && <li key={index} className={classes.menuItem} style={{ display:"flex", fontSize: "35px", flexDirection:"column", color:"white", width:"28%"}}><item.Icon className={classes.selectedIcon}/>{item.name}</li>)}
        </ul>
    )
}