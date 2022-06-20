import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import GameDataService from "../service/game.service";
import {TextGameList} from "../component/TextGameList";
import * as React from "react";
import {KeyContext} from '../provider/HotKeyProvider';
import {buttons} from "../utils/pad";
import {CircularProgress} from "@mui/material";
import {makeStyles} from "@mui/styles";

const useStyle = makeStyles({
    'customScrollbar':{
        '&::-webkit-scrollbar': {
            background: 'rgba(0,0,0,0.5)',
            width:'25px',
        },
        '&::-webkit-scrollbar-track': {
            margin:'5px'
        },
        '&::-webkit-scrollbar-thumb': {
            'backgroundClip': 'padding-box',
            backgroundColor: '#121212',
            'borderRight':'5px solid transparent',
            'borderLeft':'5px solid transparent',
        }
    },
})

export const NewGameListIndex = () => {

    const classes = useStyle();
    const navigate = useNavigate();
    const [games,setGames] = useState([]);
    const [_, setKeys] = React.useContext(KeyContext);

    useEffect(async () => {
        setKeys(keyEvents);
        try{
            const result = await GameDataService.getNewGameList().then(res => res.data);
            if("type" in result && result.type === "success"){
                setGames(result.value);
            }
        }catch(e){
            console.log(e);
        }
    },[]);

    const seeGameDetails = (game) => {
        navigate(game.name, { state: {game: game} });
    }

    const keyEvents = [
        {
            ...buttons.cross,
            label: "Voir",
            callback: () => {
                console.log('Enter');
            }
        }, {
            ...buttons.circle,
            label: "Retour",
            callback: () => {
                GameDataService.launchGame("C:\\Users\\Guillaume\\Downloads\\bookish-octo-pancake\\server\\public\\games\\ps2\\Need-for-Speed-Carbon\\game.iso");
            }
        },
    ]

    return (
        <div className={`${classes.customScrollbar} container`} style={{ overflowY:"overlay", maxHeight:"100%", minHeight:"100%", display:"flex"}}>
                { (games.length === 0)
                    ?
                    <div className="content">
                        <div style={{ display:"flex", width: "100%", flex:"1", alignItems:"center", justifyContent:"center"}}>
                            <CircularProgress/>
                        </div>
                    </div>
                    :
                    <div className="content" >
                        <TextGameList games={games} onClick={seeGameDetails}/>
                    </div>
                }
        </div>
    )
}