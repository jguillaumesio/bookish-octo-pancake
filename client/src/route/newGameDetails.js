import {useEffect, useState, useContext} from "react";
import {useLocation,} from "react-router-dom";
import GameDataService from "../service/game.service";
import * as React from "react";
import {KeyContext} from '../provider/HotKeyProvider';
import {buttons} from "../utils/pad";
import {Button, Chip, CircularProgress, Rating, Dialog, DialogTitle, List, ListItem, ListItemText, Typography, IconButton} from "@mui/material";
import {ChevronRight, ChevronLeft, Star} from '@mui/icons-material';
import {makeStyles} from "@mui/styles";

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
    const [gameDetails, setGameDetails] = useState(game);
    const [openAvailableDownloads, setOpenAvailableDownloads] = useState(false);
    const [screenshots, setScreenshots] = useState([{ "index": 0, "selected": true, "offset": 0}]);
    const [galleryRef, setGalleryRef] = useState(null);
    const [_, setKeys] = useContext(KeyContext);

    useEffect(async () => {
        setKeys(keyEvents);
        try{
            const response = await GameDataService.searchGameDetails(game.name).then(response => response.data);
            if("type" in response && response.type === "success"){
                setGameDetails({...game, ...response.value});
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

    const handleMove = (move) => {
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

    const getSelectedIndex = () => {
        return screenshots.find(screenshot => screenshot.selected).index ?? -1;
    }

    const keyEvents = [
        {
            ...buttons.cross,
            label: "Voir",
            callback: () => {
                console.log('Enter');
            }
        }, {
            ...buttons.circle,
            label: "Retour",
            callback: () => {
                GameDataService.launchGame("C:\\Users\\Guillaume\\Downloads\\bookish-octo-pancake\\server\\public\\games\\ps2\\Need-for-Speed-Carbon\\game.iso");
            }
        },
    ]

    const download = (game) => {
        GameDataService.download(game.url, game.directory, game.name);
    }

    return (
        <div className="container">
            <div className="content">
                <Dialog open={openAvailableDownloads}>
                    <DialogTitle>Téléchargements:</DialogTitle>
                    <List sx={{pt: 0}}>
                        {game.games.map((element) => (
                            <ListItem onClick={() => download(element)} key={element.rawName}>
                                <ListItemText primary={element.rawName}/>
                            </ListItem>
                        ))}
                    </List>
                </Dialog>
                <div style={{display:'flex', alignItems:'center', color:'white', height:"80px", position: 'relative', backgroundColor: "#101010"}}>
                    <Typography sx={{ml: 2, flex: 1, color: "#EAEAEA", fontSize:"28px"}} variant="h6" component="div">
                        {gameDetails?.name}
                    </Typography>
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
                                    <div style={{ display:"flex", alignItems:"center", width:"100%", whiteSpace:"pre-wrap", boxSizing:"border-box", marginBottom:"10px", overflow:"hidden", textOverflow: "ellipsis", color: "#EAEAEA", lineHeight: "1.6"}}>
                                        {gameDetails?.summary}
                                    </div>
                                    <div style={{ display:"block", width:"100%"}}>
                                        <div>
                                            { gameDetails.tags.slice(0,10).map(tag => <Chip key={tag.name} label={tag.name} sx={{ background: "#101010", color:"#fff", borderColor:"#101010"}} variant="outlined" />)}
                                        </div>
                                        <div style={{ display:"flex", flexDirection:"row", height:"50px", margin:"10px 0",width:"100%"}}>
                                            { "involved_companies" in gameDetails && gameDetails["involved_companies"].map(object =>
                                                ("logo" in object.company) && <img key={object.id} src={object.company.logo.url} alt={object.company.name} style={{ display:"block", margin:"0 10px",  objectFit: "contain", height: "100%", width:"auto"}}/>
                                            ) }
                                        </div>
                                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                                            { "total_rating" in gameDetails && <Rating readOnly precision={0.1} value={(gameDetails["total_rating"] / 20).toFixed(1)} emptyIcon={<Star style={{ fill:"rgba(255,255,255,0.1)" }} fontSize="inherit" />}/>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div ref={(el) => setGalleryRef(el)} style={{ position:"relative", width:"100%", overflow:"hidden", minHeight:"50%", maxHeight:"50%", height:"50%", padding:'20px 0'}}>
                                <IconButton onClick={() => handleMove("left")} color="primary" component="span" style={{ position:"absolute", left:0, top:"calc(50% - 20px)", display:"flex", zIndex:"2", height:"40px", width:"40px"}}>
                                    <ChevronLeft />
                                </IconButton>
                                <div style={{ transform:`translateX(${screenshots[getSelectedIndex()].offset}px)`, display:"flex", flexDirection:"row", height:"100%"}}>
                                    { "screenshots" in gameDetails && gameDetails.screenshots.length > 0 &&
                                        gameDetails?.screenshots?.map((image, index) => (
                                            <figure key={index} className={(index === screenshots[getSelectedIndex()].index) ? classes.selectedScreenshot : classes.screenshot} style={{ margin:"0", padding:"0 20px" }}>
                                                <img src={image.url} alt={image.url} style={{ height:"100%", width:"auto", display:"block"}}/>
                                            </figure>
                                        ))
                                    }
                                </div>
                                <IconButton onClick={() => handleMove("right")} color="primary" component="span" style={{ position:"absolute", right:0, top:"calc(50% - 20px)", display:"flex", zIndex:"2", height:"40px", width:"40px"}}>
                                    <ChevronRight />
                                </IconButton>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
}