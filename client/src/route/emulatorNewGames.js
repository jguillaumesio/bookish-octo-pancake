import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import GameDataService from "../service/game.service";
import {TextGameList} from "../component/TextGameList";
import {FullScreenDialog} from "../component/FullScreenDialog";
import * as React from "react";
import {KeyContext} from '../provider/HotKeyProvider';
import {buttons} from "../utils/pad";

export const NewGameListIndex = () => {

    const [games,setGames] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [gameDetails, setGameDetail] = React.useState(null);
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

    const handleDialog = (state) => {
        setOpen(state);
        if(!state){
            setGameDetail(null);
        }
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
                handleDialog(false);
            }
        },
    ]

    const getGameDetails = async (game) => {
        handleDialog(true);
        const response = await GameDataService.searchGameDetails(game.name).then(response => response.data.value);
        setGameDetail({...game, ...response});
    }

    const download = (game) => {
        GameDataService.download(game.url, game.directory, game.name);
    }

    return (
        <div className="container" >
            <div className="content" >
                <FullScreenDialog game={gameDetails} open={open} handleDialog={handleDialog} download={download}/>
                <TextGameList games={games} onClick={getGameDetails} download={download}/>
            </div>
        </div>
    )
}