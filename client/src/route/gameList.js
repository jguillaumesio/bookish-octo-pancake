import {useEffect, useState} from "react";
import GameDataService from "../service/game.service";
import {GameCaroussel} from "../component/GameCaroussel";
import {ButtonBottomIndicator} from "../component/ButtonBottomIndicator";

export const GameListIndex = () => {

    const [games,setGames] = useState([]);

    useEffect(() => {
        GameDataService.getGames().then(response => {
            if(response.data.type === 'success'){
                let tempGames = response.data.value.map((game, i) => {
                    return {...game, index: i}
                })
                console.log(tempGames);
                setGames(tempGames);
            }
            else{
                //Write alert message
            }
        })
    },[]);

    return (
        <div className="container" >
            <div className="content" style={{ alignItems:'center', justifyContent:'center'}}>
                <GameCaroussel onEnter={() => console.log('toLaunch')} onBackspace={()=> console.log('back')} games={games}/>
            </div>
        </div>
    )
}