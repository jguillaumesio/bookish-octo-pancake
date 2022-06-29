import {useEffect, useState} from "react";
import {useNavigate,} from "react-router-dom";
import GameDataService from "../service/game.service";
import {TextGameList} from "../component/TextGameList";
import * as React from "react";
import {KeyContext} from '../provider/HotKeyProvider';
import {buttons} from "../utils/pad";
import {CircularProgress} from "@mui/material";
import {makeStyles} from "@mui/styles";
import {TopBar} from "../component/TopBar";

const useStyle = makeStyles({
    'selectedFilter':{
        color:"#fff"
    },
    'gameContainer':{
        display:"flex",
        flex:1,
        margin:"8px 8px 0 8px",
        backgroundColor:"#131313",
        borderRadius:"20px",
        overflow:"hidden"
    },
    'genreContainer':{
        backgroundColor:"#131313",
        borderRadius:"20px",
        listStyleType:"none",
        margin:"8px 8px 0 8px",
        color:"grey",
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-evenly",
        padding:"0 20px",
        zIndex:1
    },
    'selectedContainer':{
        margin:"4px 4px 0 4px !important",
        border:"1px solid #485e6d",
        boxShadow:"0 0 4px 0 #485e6d"
    }
})

export const NewGameListIndex = ({breadCrumb}) => {

    const classes = useStyle();
    const navigate = useNavigate();
    const [selectedGameIndex, setSelectedGameIndex] = useState(0);
    const [selectedGenreIndex, setSelectedGenreIndex] = useState(0);
    const [games,setGames] = useState([]);
    const [filteredGames,setFilteredGames] = useState([]);
    const [isFiltered, setIsFiltered] = useState(0); //-1 loading, 0 not filtered, 1 filtered
    const [genres, setGenres] = useState([]);
    const [_, setKeys] = React.useContext(KeyContext);

    const getGames = () => {
        return (isFiltered) ? filteredGames : games;
    }

    const handleGenreFiltering = async () => {
        const tempGenres = genres.map(e => (e === genres[selectedGenreIndex]) ? { ...e, selected: !e.selected} : e);
        setGenres([...tempGenres]);
        if(tempGenres.findIndex(e => e.selected) !== -1){
            setIsFiltered(-1);
            const response = await GameDataService.searchByGenre(tempGenres.filter(e => e.selected).map(e => e.id));
            if("type" in response.data && response.data.type === "success"){
                response.data.value.sort((a,b) => a.name.localeCompare(b.name) );
                setSelectedGameIndex(0);
                setFilteredGames(response.data.value);
                setIsFiltered(1);
            }
        }
        else{
            setIsFiltered(0);
        }
    }
    const genreContainer = (index, selected) => {
        return (
            <div key={index} className={`${(selected) ? classes.selectedContainer : ""} ${classes.genreContainer}`}>
                {genres.map((genre, index) => <a key={index} style={{cursor:"pointer"}} className={`${(genre.selected || genre === genres[selectedGenreIndex]) ? classes.selectedFilter : ""}`}>{genre.name}</a>)}
            </div>
        );
    }
    const gameContainer = (index, selected) => {
        return (
            <div key={index} className={`${(selected) ? classes.selectedContainer : ""} ${classes.gameContainer}`}>
                <div style={{ display:"flex", flex:1 }}>
                    {isFiltered === -1
                        ? <div style={{ display:"flex", width: "100%", height:"100%", alignItems:"center", justifyContent:"center"}}><CircularProgress/></div>
                        : <TextGameList offset={selectedGameIndex} limit={12} games={getGames()}/>}
                </div>
            </div>
        )
    }

    const seeGameDetails = () => {
        const game = getGames()[selectedGameIndex];
        navigate(game.name, { state: {"game": game} });
    }

    const handleIndexSelection = (setter, length, move) => {
        const shift = (move === "down") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => {
            return modulo(index + shift, length)
        });
    }

    let containers = [{
        "index": 0,
        "widget": genreContainer,
        "onTap": handleGenreFiltering,
        "onMove": (move) => handleIndexSelection(setSelectedGenreIndex, genres.length, move)
    },{
        "index": 1,
        "widget": gameContainer,
        "onTap": seeGameDetails,
        "onMove": (move) => handleIndexSelection(setSelectedGameIndex, getGames().length, move)
    }];

    const [selectedContainer, setSelectedContainer] = useState(containers[0]);

    useEffect(() => {
        containers = [{
            "index": 0,
            "widget": genreContainer,
            "onTap": handleGenreFiltering,
            "onMove": (move) => handleIndexSelection(setSelectedGenreIndex, genres.length, move)
        },{
            "index": 1,
            "widget": gameContainer,
            "onTap": seeGameDetails,
            "onMove": (move) => handleIndexSelection(setSelectedGameIndex, getGames().length, move)
        }];
        setSelectedContainer(containers[selectedContainer.index]);
        setKeys(keyEvents);
    },[games, filteredGames, selectedGameIndex, selectedGenreIndex, genres]);

    useEffect(() => {
        setKeys(keyEvents);
    },[selectedContainer])

    useEffect(async () => {
        setKeys(keyEvents);
        try{
            await Promise.all([
                GameDataService.getGenres().then(res => {
                    if ("type" in res.data && res.data.type === "success") {
                        res.data.value.sort((a,b) => a.name.localeCompare(b.name) );
                        setGenres(res.data.value.map(e => {
                            return {
                                ...e,
                                selected: false
                            }
                        }));
                    }
                }),
                GameDataService.getNewGameList().then(res => {
                    if ("type" in res.data && res.data.type === "success") {
                        setGames(res.data.value);
                    }
                })
            ])
        }catch(e){
            console.log(e);
        }
    },[]);

    const handleContainerSelection = (move) => {
        const shift = (move === "right") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setSelectedContainer(actual => {
            const index = containers.findIndex(container => container.index === actual.index);
            return containers[modulo(index + shift, containers.length)];
        });
    }

    const keyEvents = [

        {
            ...buttons.bottom,
            label:"Se déplacer",
            callback: () => {
                selectedContainer.onMove("down");
            }
        },
        {
            ...buttons.top,
            label:"Se déplacer",
            callback: () => {
                selectedContainer.onMove("up");
            }
        },
        {
            ...buttons.right,
            label:"Se déplacer",
            callback: () => {
                handleContainerSelection("right");
            }
        },
        {
            ...buttons.left,
            label:"Se déplacer",
            callback: () => {
                handleContainerSelection("left");
            }
        },
        {
            ...buttons.cross,
            label: "Voir",
            callback: () => {
                selectedContainer.onTap();
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
        <div className="container" style={{ maxHeight:"100%", minHeight:"100%", display:"flex"}}>
                { (games.length === 0)
                    ?
                    <div className="content">
                        <div style={{ display:"flex", width: "100%", flex:"1", alignItems:"center", justifyContent:"center"}}>
                            <CircularProgress/>
                        </div>
                    </div>
                    :
                    <div className="content" style={{ backgroundColor:"#101010", zIndex:2}}>
                        <div style={{ padding:"16px 16px 0 16px"}}>
                            <TopBar links={[]} breadCrumb={breadCrumb}/>
                        </div>
                        <div style={{ display:"flex", flexDirection:"row", flex: 1, padding:"8px 8px 0 8px"}}>
                            {
                                containers.map((element, index) => element.widget(index, element.index === selectedContainer.index))
                            }
                        </div>
                    </div>
                }
        </div>
    )
}