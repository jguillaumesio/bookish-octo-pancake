import {List, ListItem, ListItemText} from "@mui/material";
import {makeStyles} from "@mui/styles";

const useStyle = makeStyles({
    item: {
        color: 'grey',
        cursor: 'pointer',
        '&:nth-child(even)':{
            background:'#121212',
        },
        '&:nth-child(odd)':{
            background:'#101010',
        }
    }
})

export const TextGameList = (props) => {

    let { games, onClick } = props;
    const classes = useStyle();

    const htmlDecode = input => {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    return(
        <List sx={{ width:"100%", height: 'auto', boxSizing:'border-box' }}>
            {games.map((game, index) => (
                <ListItem key={index} className={classes.item} onClick={() => onClick(game)}>
                    <ListItemText primary={htmlDecode(game.name)}/>
                </ListItem>))}
        </List>
    )
}