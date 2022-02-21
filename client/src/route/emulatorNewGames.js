import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import GameDataService from "../service/game.service";
import {GameList} from "../component/GameList";

export const NewGameListIndex = () => {

    const [games,setGames] = useState([]);
    const {emulator} = useParams();

    useEffect(() => {
        GameDataService.getNewByEmulator(emulator).then(response => {
            console.log("ok");
            if(response.data.type === 'success'){
                setGames(response.data.value);
            }
            else{
                //Write alert message
            }
        })
    },[emulator]);

    return (
        <div className="container" >
            <div className="content" >
                <GameList games={games} emulator={emulator}/>
            </div>
        </div>
    )
}