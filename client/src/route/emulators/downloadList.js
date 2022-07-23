import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import * as React from "react";
import {KeyContext} from '../../provider/HotKeyProvider';
import {buttons} from "../../utils/pad";
import {makeStyles} from "@mui/styles";
import {TopBar} from "../../component/TopBar";
import GameService from "../../service/game.service";

const useStyle = makeStyles({
    'container':{
        flexDirection:"column",
        display:"flex",
        flex:1,
        margin:"8px 0 0 0",
    },
    'selectedContainer':{
        margin:"4px 4px 0 4px !important",
        border:"1px solid #485e6d",
    },
    'gamesContainer':{
        width:"100%",
        flex:"1",
        backgroundColor:"#131313",
        flexDirection:"column",
        justifyContent:"flex-start",
        display:"flex",
        boxSizing:'border-box',
        margin:'10px 0'}
})

export const DownloadListIndex = ({breadCrumb}) => {

    const classes = useStyle();
    //const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [downloadsToResume, _setDownloadsToResume] = useState([]);
    const [selectedGameIndex, setSelectedGameIndex] = useState(null);
    const [setKeys] = React.useContext(KeyContext);

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "down") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => {
            return modulo(index + shift, length)
        });
    }

    const setDownloadsToResume = games => {
        console.log(games);
        if(selectedGameIndex === null && games.length > 0){
            setSelectedGameIndex(0);
        }
        else if(selectedGameIndex > games.length - 1){
            let index = downloadsToResume.findIndex(g => g.name === downloadsToResume[selectedGameIndex]);
            index = (index === -1) ? 0 : index;
            setSelectedGameIndex(index);
        }
        _setDownloadsToResume(games);
    }

    const restartDownload = (url, directory, name) => {
        GameService.restartDownload(url, directory, name, console.log);
        const game = downloadsToResume.find(e => e.name === name);
        setDownloadsToResume(downloadsToResume.filter(e => e !== game));
    }

    useEffect(async () => {
        setKeys(keyEvents);
        await GameService.downloadList(setGames);
        const result = await GameService.downloadsToResume().then(res => res.data);
        if("type" in result && result.type === "success"){
            setDownloadsToResume(result.value);
        }
    },[]);

    useEffect(() => {
        setKeys(keyEvents);
    },[downloadsToResume, selectedGameIndex])

    const keyEvents = [
        {
            ...buttons.bottom,
            display: false,
            args: {"move": "down", "setter": setSelectedGameIndex, "length": downloadsToResume.length},
            callback: handleIndexSelection
        },
        {
            ...buttons.top,
            display: false,
            args: {"move": "up", "setter": setSelectedGameIndex, "length": downloadsToResume.length},
            callback: handleIndexSelection
        },
        ... (downloadsToResume.length > 0 && selectedGameIndex !== null) ?
            [{
            ...buttons.cross,
                label: "Reprendre le téléchargement",
                args:{"url":downloadsToResume[selectedGameIndex]?.games[0]?.url,"directory":downloadsToResume[selectedGameIndex]?.directory, "name":downloadsToResume[selectedGameIndex]?.name},
                callback: ({url, directory, name}) => restartDownload(url, directory, name)
            }] : []
    ]

    return (
        <div className="container" style={{ maxHeight:"100%", minHeight:"100%", display:"flex"}}>
            <div className="content" style={{ backgroundColor:"#101010", zIndex:2, padding:"16px"}}>
                <div style={{ margin:"0 0 8px 0"}}>
                    <TopBar links={[]} breadCrumb={breadCrumb}/>
                </div>
                <div className={classes.container}>
                    <h3 style={{ color:"grey"}}>Téléchargement(s) en cours</h3>
                    <div className={classes.gamesContainer}>
                        {games.map((e, index) =>
                            <div key={index} style={{ display:'flex', height:'20%', color:'grey', flexDirection:'row', justifyContent:"space-between", alignItems:'center', padding:'10px'}}>
                                <div style={{ height:'100%', display:'flex', flexDirection:'row', alignItems:'center'}}>
                                    <img src={e.picture.url} alt={e.name} style={{ maxHeight:"100%", minHeight:"100%", overflow:'hidden', borderRadius:'10px'}}/>
                                    <h3 style={{ padding:'20px' }}>{e.name}</h3>
                                </div>
                                <h2 style={{ padding:'10px' }}>{e?.percentage ?? 0}%</h2>
                            </div>
                        )}
                    </div>
                    { downloadsToResume.length > 0 &&
                        <div>
                            <h3 style={{ color:"grey"}}>Téléchargement(s) en pause</h3>
                            <div className={classes.gamesContainer}>
                                {downloadsToResume.map((e, index) =>
                                    <div key={index} style={{ display:'flex', height:'20%', color:'grey', flexDirection:'row', justifyContent:"space-between", alignItems:'center', padding:'10px'}}>
                                        <div style={{ height:'100%', display:'flex', flexDirection:'row', alignItems:'center'}}>
                                            <img src={e.picture.url} alt={e.name} style={{ border:`${(index === selectedGameIndex) ? "2px solid white" : "none"}`, maxHeight:"100%", minHeight:"100%", overflow:'hidden', borderRadius:'10px'}}/>
                                            <h3 style={{ padding:'20px' }}>{e.name}</h3>
                                        </div>
                                        {/*<h2 style={{ padding:'10px' }}>{e.percentage}%</h2>*/}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}