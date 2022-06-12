import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import GameDataService from "../service/game.service";
import {TextGameList} from "../component/TextGameList";
import {FullScreenDialog} from "../component/FullScreenDialog";
import * as React from "react";

export const NewGameListIndex = () => {

    const [games,setGames] = useState([]);
    const [open, setOpen] = React.useState(false);
    const {emulator} = useParams();

    useEffect(() => {
        GameDataService.getNewByEmulator(emulator).then(response => {
            if(response.data.type === 'success'){
                setGames(response.data.value);
            }
            else{
                //Write alert message
            }
        })
    },[emulator]);

    const handleDialog = (state = null) => {
        (state) ? setOpen(state) : setOpen(!open);
    }

    const getGameDetails = (game) => {
        console.log(game);
        GameDataService.getGameDetails(emulator, game.name).then(
            response => console.log(response)
        )
    }

    return (
        <div className="container" >
            <div className="content" >
                <TextGameList games={games} emulator={emulator} onClick={getGameDetails}/>
            </div>
        </div>
    )
}