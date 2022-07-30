import {useEffect, useState} from "react";
import GameDataService from "../../service/game.service";
import {GameCaroussel} from "../../component/GameCaroussel";
import {useNavigate} from "react-router-dom";

export const GameListIndex = () => {

    const [games,setGames] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        GameDataService.getGames().then(response => {
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
    },[]);

    const launchGame = ({path}) => {
        GameDataService.launchGame(path)
    }

    return (
        <div className="container" >
            <div className="content" style={{ alignItems:'center', justifyContent:'center'}}>
                <GameCaroussel onLeave={() => navigate("/emulators")} onEnter={launchGame} onBackspace={()=> console.log('back')} games={games}/>
            </div>
        </div>
    )
}