import {makeStyles} from "@mui/styles";

const useStyle = makeStyles({
    "item": {
        color: 'grey',
        cursor: 'pointer',
        fontWeight:"bold",
        fontSize:"medium",
        margin:"0",
        padding:"8px 5px",
        background:'#131313',
    },
    "selectedItem":{
        color:"white"
    }
})

export const TextGameList = (props) => {

    let { games, offset, limit, isContainerSelected } = props;
    const selectedGame = games[offset];
    const visibleGamesNumber = 12;

    const visibleGames = () => {
        if(games.length <= visibleGamesNumber){
            return games;
        }
        return (offset + limit > games.length)
            ? [...games.slice(offset, games.length), ...games.slice(0, offset + limit - games.length)]
            : games.slice(offset, offset + limit);
    }
    const classes = useStyle();

    const htmlDecode = input => {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc?.documentElement?.textContent;
    }

    return(
        <div style={{ width:"100%", flex:"1", flexDirection:"column", justifyContent:`${ (games.length > visibleGamesNumber) ? "space-evenly" : "flex-start"}`, display:"flex", boxSizing:'border-box', padding:'0 20px', margin:'0'}}>
            {visibleGames().map((game, index) => (
                <p key={index} className={`${(isContainerSelected && selectedGame === game) ? classes.selectedItem : ""} ${classes.item}`}>{htmlDecode(game.name)}</p>
            ))}
        </div>
    )
}