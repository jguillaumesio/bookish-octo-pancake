import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import GameDataService from "../service/game.service";
import {GameCaroussel} from "../component/GameCaroussel";
import {ButtonBottomIndicator} from "../component/ButtonBottomIndicator";

export const GameListIndex = () => {

    const [games,setGames] = useState([]);
    const {emulator} = useParams();

    useEffect(() => {
        GameDataService.getByEmulator(emulator).then(response => {
            if(response.data.type === 'success'){
                let tempGames = response.data.value.map((game, i) => {
                    return {...game, index: i}
                })
                setGames(tempGames);
            }
            else{
                //Write alert message
            }
        })
    },[emulator]);

    return (
        <div className="container" >
            <div className="content" style={{ alignItems:'center'}}>
                <GameCaroussel onEnter={() => console.log('toLaunch')} games={games}/>
                <ButtonBottomIndicator/>
            </div>
        </div>
    )
}