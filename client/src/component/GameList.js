import {ImageList, ImageListItem, ImageListItemBar} from "@mui/material";
import GameDataService from './../service/game.service';

export const GameList = (props) => {

    let { games, emulator } = props;

    return(
        <ImageList sx={{ width:"100%", height: 'auto', padding:'20px', boxSizing:'border-box' }} cols={5} gap={20}>
            {games.map((game, index) => (
                <ImageListItem key={index}>
                    <img
                        src={game.thumbnail}
                        srcSet={game.thumbnail}
                        alt={game.name}
                        loading="lazy"
                        onClick={() => GameDataService.downloadNewGame(game.url, emulator, game)}
                    />
                    <ImageListItemBar
                        sx={{ background:'rgba(0,0,0,0.8)'}}
                        title={game.name}
                    />
                </ImageListItem>
            ))}
        </ImageList>
    )
}