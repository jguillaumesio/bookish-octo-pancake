import {useContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import GameDataService from "../../service/game.service";
import {TextGameList} from "../../component/TextGameList";
import * as React from "react";
import {KeyContext} from '../../provider/HotKeyProvider';
import {buttons} from "../../utils/pad";
import {CircularProgress} from "@mui/material";
import {makeStyles} from "@mui/styles";
import {TopBar} from "../../component/TopBar";
import {KeyboardContext} from "../../component/VisualKeyboard";

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
    const [setKeys] = React.useContext(KeyContext);
    const [setIsOpen, setKeyboardCallback, setKeyboardCloseCallback] = useContext(KeyboardContext);

    const getGames = () => {
        return (isFiltered) ? filteredGames : games;
    }

    const searchFiltering = async (genres, search, setIsFiltered, setSelectedGameIndex, setFilteredGames) => {
        if(genres.findIndex(e => e.selected) !== -1){
            setGenres(genres.map(e => { return {...e, "selected": false}}));
        }
        setIsFiltered(-1);
        const response = await GameDataService.searchByName(search);
        if("type" in response.data && response.data.type === "success"){
            response.data.value.sort((a,b) => a.name.localeCompare(b.name) );
            setSelectedGameIndex(0);
            setFilteredGames(response.data.value);
            setIsFiltered(1);
        }
    }

    const handleSearchFiltering = async ({genres, setIsFiltered, setSelectedGameIndex, setFilteredGames}) => {
        setKeyboardCallback(_ => async (search) => {
            await searchFiltering(genres, search, setIsFiltered, setSelectedGameIndex, setFilteredGames);
        });
        setKeyboardCloseCallback(_ => () => {
            setKeys(keyEvents)
        })
        setIsOpen(true);
    }

    const handleGenreFiltering = async ({genres, selectedGenreIndex, setIsFiltered, setSelectedGameIndex, setFilteredGames}) => {
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

    const seeGameDetails = ({games, selectedGameIndex}) => {
        const game = games[selectedGameIndex];
        navigate(game.name, { state: {"game": game} });
    }
    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "down") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => modulo(index + shift, length));
    }

    let containers = [{
        "index": 0,
        "onTap": handleGenreFiltering,
        "onMove": ({setSelectedGenreIndex, genres, move}) => handleIndexSelection({"setter": setSelectedGenreIndex,"length":genres.length, "move": move})
    },{
        "index": 1,
        "onTap": seeGameDetails,
        "onMove": ({setSelectedGameIndex, games, move}) => handleIndexSelection({"setter": setSelectedGameIndex,"length":games.length, "move": move})
    }];

    const [selectedContainer, setSelectedContainer] = useState(containers[0]);

    useEffect(() => {
        setKeys(keyEvents);
     },[games, filteredGames, selectedContainer, selectedGameIndex, selectedGenreIndex, genres]);

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
    },[setKeys]);

    const handleContainerSelection = ({move, setSelectedContainer}) => {
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
            display: false,
            continuous: true,
            label:"Se déplacer",
            args: {"move": "down", "setSelectedGameIndex": setSelectedGameIndex, "games": getGames(), "setSelectedGenreIndex": setSelectedGenreIndex, "genres": genres},
            callback: selectedContainer.onMove
        },
        {
            ...buttons.top,
            display: false,
            continuous: true,
            label:"Se déplacer",
            args: {"move": "up", "setSelectedGameIndex": setSelectedGameIndex, "games": getGames(), "setSelectedGenreIndex": setSelectedGenreIndex, "genres": genres},
            callback: selectedContainer.onMove
        },
        {
            ...buttons.right,
            continuous: true,
            display: false,
            label:"Se déplacer",
            args: {"move": "right", "setSelectedContainer":setSelectedContainer},
            callback: handleContainerSelection
        },
        {
            ...buttons.left,
            continuous: true,
            display: false,
            label:"Se déplacer",
            args: {"move": "left", "setSelectedContainer":setSelectedContainer},
            callback: handleContainerSelection
        },
        {
            ...buttons.square,
            label: "Réinitialiser",
            args:{"setGenres": setGenres, "setIsFiltered": setIsFiltered, "setSelectedGameIndex": setSelectedGameIndex, "setFilteredGames": setFilteredGames},
            callback: ({setGenres, setSelectedGameIndex, setFilteredGames, setIsFiltered}) => {
                setGenres(genres => genres.map(e => { return {...e, "selected":false}}))
                setIsFiltered(0);
                setSelectedGameIndex(0);
                setFilteredGames([]);
            }
        },
        {
            ...buttons.triangle,
            label: "Chercher",
            args:{"genres": genres, "setIsFiltered": setIsFiltered, "setSelectedGameIndex": setSelectedGameIndex, "setFilteredGames": setFilteredGames, "games": getGames(), "selectedGameIndex": selectedGameIndex},
            callback: handleSearchFiltering
        },
        {
            ...buttons.cross,
            label: "Voir",
            args:{"genres": genres, "selectedGenreIndex": selectedGenreIndex, "setIsFiltered": setIsFiltered, "setSelectedGameIndex": setSelectedGameIndex, "setFilteredGames": setFilteredGames, "games": getGames(), "selectedGameIndex": selectedGameIndex},
            callback: selectedContainer.onTap
        },
        {
            ...buttons.circle,
            label: "Retour",
            callback: () => {
                navigate("/")
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
                            <div className={`${(selectedContainer.index === 0) ? classes.selectedContainer : ""} ${classes.genreContainer}`}>
                                {genres.map((genre, index) => <span key={index} className={`${(genre.selected || (genre === genres[selectedGenreIndex] && (selectedContainer.index === 0))) ? classes.selectedFilter : ""}`}>{genre.name}</span>)}
                            </div>
                            <div style={{ display:"flex", flexDirection:"column", flex:1}}>
                                { isFiltered === 1 &&
                                    <span style={{ color: "grey", textAlign:"right", padding:"0 8px"}}>{filteredGames.length} jeu(x) trouvé(s)</span>
                                }
                                <div className={`${(selectedContainer.index === 1) ? classes.selectedContainer : ""} ${classes.gameContainer}`}>
                                    <div style={{ display:"flex", flex:1 }}>
                                        {isFiltered === -1
                                            ? <div style={{ display:"flex", width: "100%", height:"100%", alignItems:"center", justifyContent:"center"}}><CircularProgress/></div>
                                            : <TextGameList offset={selectedGameIndex} isContainerSelected={(selectedContainer.index === 1)} limit={12} games={getGames()}/>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
        </div>
    )
}