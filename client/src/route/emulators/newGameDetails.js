import {useEffect, useState, useContext} from "react";
import {useLocation, useNavigate,} from "react-router-dom";
import GameDataService from "../../service/game.service";
import * as React from "react";
import {KeyContext} from '../../provider/HotKeyProvider';
import {buttons} from "../../utils/pad";
import {Chip, CircularProgress, Alert, Rating, Dialog, DialogTitle, List, ListItem, ListItemText, Typography, Snackbar} from "@mui/material";
import {Star} from '@mui/icons-material';
import {makeStyles} from "@mui/styles";
import {KeyboardContext} from "../../component/VisualKeyboard";

const useStyle = makeStyles({
    screenshot: {
        position: "relative",
        "&::after": {
            top:0,
            left:"20px",
            content:'""',
            height:"100%",
            width: "calc(100% - 40px)",
            background:"rgba(0,0,0,0.8)",
            display:'block',
            position:'absolute'
        }
    },
    selectedScreenshot: {
        transform: "scale(1.05)"
    }
})

export const NewGameDetailsIndex = () => {

    const classes = useStyle();
    const {state} = useLocation();
    const game = state.game;
    const navigate = useNavigate();
    const [gameDetails, setGameDetails] = useState(game);
    const [openAvailableDownloads, _setOpenAvailableDownloads] = useState(0);
    const [selectedGameDownload, setSelectedGameDownload] = useState(0);
    const [screenshots, setScreenshots] = useState([{ "index": 0, "selected": true, "offset": 0}]);
    const [galleryRef, setGalleryRef] = useState(null);
    const [snackbar,setSnackbar] = useState({"state": false, "type": null, "message":"" });
    const [selectedContainer, setSelectedContainer] = useState(0);
    const [setKeys] = useContext(KeyContext);
    const [setIsOpen, setKeyboardCallback, setKeyboardCloseCallback] = useContext(KeyboardContext);

    const setOpenAvailableDownloads = (state) => {
        if(!("state" in gameDetails)){
            return;
        }
        if(gameDetails.state === "downloaded"){
            setSnackbar({"type":"error", "message":"Le jeu est déjà dans la bibliothèque !", "state": true});
        }
        else if(gameDetails.state === "downloading"){
            setSnackbar({"type":"error", "message":"Le jeu est déjà en téléchargement !", "state": true});
        }
        else{
            _setOpenAvailableDownloads(state);
            const containerIndex = (state === 1 || state === -1) ? 1 : 0;
            setSelectedContainer(containerIndex);
        }
    }

    useEffect(() => {
        setKeys(keyEvents);
    }, [selectedContainer, gameDetails, screenshots]);

    useEffect(async () => {
        setKeys(keyEvents);
        try{
            const response = await GameDataService.searchGameDetails(game.name, game.directory).then(response => response.data);
            if("type" in response && response.type === "success"){
                setGameDetails({...game, ...response.value});
            }
            else if ("type" in response && response.type === "error"){
                navigate("/emulators/new");
            }
        }catch(e){
            console.log(e);
        }
    },[]);

    useEffect(async () => {
        if(galleryRef !== null){
            setTimeout(() =>{
                const containerWidth = galleryRef.offsetWidth;
                const nodes = [...galleryRef.querySelectorAll("figure")];
                const index = Math.floor(nodes.length/2);
                const screenshots = [];
                for(let i = 0; i < nodes.length; i++){
                    let offset = (i > 0) ? screenshots[i-1].offset - nodes[i-1].offsetWidth: 0;
                    screenshots.push({
                        "offset": offset,
                        "index": i,
                        "selected": (i === index),
                        "width": nodes[i].offsetWidth
                    });
                }
                setScreenshots(screenshots.map(e => {return {...e, "offset": e.offset + ((containerWidth - e.width)/2)}}));
            },1000);
        }
    },[galleryRef]);

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "down") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => {
            return modulo(index + shift, length)
        });
    }

    const handleMove = ({move}) => {
        const shift = (move === "right") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        const newIndex = modulo(getSelectedIndex()+shift, screenshots.length);
        const newScreenshots = screenshots.map(e => {
            return {
                ...e,
                selected: (e.index === newIndex)
            }
        });
        setScreenshots(newScreenshots);
    }

    const download = () => {
        setOpenAvailableDownloads(-1);
        GameDataService.download(game.games[selectedGameDownload].url, game.directory, game.name, (args) => {
            setOpenAvailableDownloads(0);
            setSnackbar({...args, "state": true});
            setGameDetails({
                ...gameDetails,
                "state":"downloading"
            });
        });
    }

    const containers = [
        {
            "index": 0,
            "onTap": ({state}) => setOpenAvailableDownloads(state),
            "onLeave": () => navigate("/emulators/new")
        },
        {
            "index": 1,
            "onTap": download,
            "onMove": handleIndexSelection,
            "onLeave": ({state}) => setOpenAvailableDownloads(state)
        }
    ];

    const getSelectedIndex = () => {
        return screenshots.find(screenshot => screenshot.selected).index ?? -1;
    }

    const keyEvents = [
        {
            ...buttons.L1,
            label: "Clavier",
            args: {},
            callback: () => {
                setKeyboardCallback(_ => (value) => {
                    console.log(value);
                });
                setKeyboardCloseCallback(_ => () => {
                    setKeys(keyEvents)
                })
                setIsOpen(true);
            }
        },
        {
            ...buttons.right,
            continuous: true,
            display: false,
            args: {"move": "right"},
            callback: handleMove
        },
        {
            ...buttons.left,
            continuous: true,
            display: false,
            args: {"move": "left"},
            callback: handleMove
        },
        {
            ...buttons.top,
            continuous: true,
            display: false,
            args: {setter: setSelectedGameDownload, length: game.games.length, move: "top"},
            callback: containers[selectedContainer].onMove ?? (() => {})
        },{
            ...buttons.bottom,
            continuous: true,
            display: false,
            args: {setter: setSelectedGameDownload, length: game.games.length, move: "down"},
            callback: containers[selectedContainer].onMove ?? (() => {})
        }, {
            ...buttons.cross,
            label: "Voir",
            args: {"state": 1},
            callback: containers[selectedContainer].onTap
        }, {
            ...buttons.circle,
            label: "Retour",
            args: {"state": 0},
            callback: containers[selectedContainer].onLeave
        },
    ]

    const rating = parseFloat(gameDetails["total_rating"] / 20).toFixed(1);

    const htmlDecode = input => {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent;
    }

    return (
        <div className="container">
            <Snackbar open={snackbar.state} autoHideDuration={6000} onClose={() => setSnackbar({"state": false, "type": "error", "message":"" })}>
                <div>
                    { snackbar.state &&
                        <Alert variant="filled" severity={snackbar.type} sx={{ width: '100%' }}>
                            {snackbar.message}
                        </Alert>
                    }
                </div>
            </Snackbar>
            <div className="content">
                <Dialog open={openAvailableDownloads !== 0}>
                    <DialogTitle>Téléchargements:</DialogTitle>
                    { openAvailableDownloads === -1
                        ? <div style={{ display:"flex", width: "100%", padding:"20px", flex:"1", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
                            <CircularProgress/>
                          </div>
                        : <List sx={{pt: 0}}>
                            {game.games.map((element, index) => (
                                <ListItem sx={{background:`${index === selectedGameDownload ? "#C5C5C5" : "transparent"}`}} key={index}>
                                    <ListItemText primary={element.rawName}/>
                                </ListItem>
                            ))}
                        </List>
                    }
                </Dialog>
                <div style={{display:'flex', flexDirection:"row", justifyContent:"space-between", alignItems:'center', padding:"0 50px", color:'white', height:"80px", position: 'relative', backgroundColor: "#101010"}}>
                    <Typography sx={{ml: 2, flex: 1, padding:"0 20px", color: "#EAEAEA", fontSize:"28px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}} variant="h5" component="div">
                        {htmlDecode(gameDetails?.name)}
                    </Typography>
                    { "total_rating" in gameDetails &&
                        <Rating readOnly precision={0.1} value={Number(rating)} emptyIcon={<Star style={{ fill:"rgba(255,255,255,0.1)" }} fontSize="inherit" />}/>
                    }
                </div>
                {
                    (state.game === gameDetails)
                        ?
                        <div style={{ display:"flex", width: "100%", flex:"1", alignItems:"center", justifyContent:"center"}}>
                            <CircularProgress/>
                        </div>
                        :
                        <div style={{
                            height: "100%",
                            padding: "20px",
                            width: "100%",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <div style={{display: "flex", flexDirection: "row", alignItems: "center", height:"50%", minHeight:"50%",maxHeight:"50%"}}>
                                <img src={gameDetails?.cover?.url} alt="cover" style={{maxHeight:"100%", width: "auto", height: "100%", display: "block", margin: "0 auto"}}/>
                                <div style={{ padding: "0 20px", width: "60%", display: "flex", flexDirection:"column", alignItems:"flex-start", justifyContent:"space-between", alignSelf:"stretch"}}>
                                    <div style={{ display:"flex", width:"100%", boxSizing:"border-box", marginBottom:"10px", overflow:"hidden", color: "#EAEAEA", lineHeight: "1.6"}}>
                                        {gameDetails?.summary}
                                    </div>
                                    <div style={{ display:"block", width:"100%"}}>
                                        <div>
                                            { gameDetails.tags.slice(0,10).map(tag => <Chip key={tag.name} label={tag.name} sx={{ background: "#101010", color:"#fff", borderColor:"#101010", margin:"5px"}} variant="outlined" />)}
                                        </div>
                                        <div style={{ display:"flex", flexDirection:"row", height:"50px", margin:"10px 0",width:"100%"}}>
                                            { "involved_companies" in gameDetails && gameDetails["involved_companies"].map(object =>
                                                ("logo" in object.company) && <img key={object.id} src={object.company.logo.url} alt={object.company.name} style={{ display:"block", margin:"0 10px",  objectFit: "contain", height: "100%", width:"auto"}}/>
                                            ) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {   "screenshots" in gameDetails && gameDetails.screenshots.length > 0 &&
                                <div ref={(el) => setGalleryRef(el)} style={{ position:"relative", width:"100%", overflow:"hidden", minHeight:"50%", maxHeight:"50%", height:"50%", padding:'20px 0'}}>
                                    <div style={{ transform:`translateX(${screenshots[getSelectedIndex()].offset}px)`, display:"flex", flexDirection:"row", height:"100%"}}>
                                        { "screenshots" in gameDetails && gameDetails.screenshots.length > 0 &&
                                            gameDetails?.screenshots?.map((image, index) => (
                                                <figure key={index} className={(index === screenshots[getSelectedIndex()].index) ? classes.selectedScreenshot : classes.screenshot} style={{ margin:"0", padding:"0 20px" }}>
                                                    <img src={image.url} alt={image.url} style={{ height:"100%", width:"auto", display:"block"}}/>
                                                </figure>
                                            ))
                                        }
                                    </div>
                                </div>
                            }
                        </div>
                }
            </div>
        </div>
    )
}