import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import * as React from "react";
import {KeyContext} from '../provider/HotKeyProvider';
import {buttons} from "../utils/pad";
import {makeStyles} from "@mui/styles";
import {TopBar} from "../component/TopBar";
import GameService from "../service/game.service";

const useStyle = makeStyles({
    'container':{
        display:"flex",
        flex:1,
        margin:"8px 0 0 0",
        backgroundColor:"#131313",
        borderRadius:"20px",
        overflow:"hidden"
    },
    'selectedContainer':{
        margin:"4px 4px 0 4px !important",
        border:"1px solid #485e6d",
    }
})

export const DownloadListIndex = ({breadCrumb}) => {

    const classes = useStyle();
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [setKeys] = React.useContext(KeyContext);

    const handleIndexSelection = ({setter, length, move}) => {
        const shift = (move === "down") ? 1 : -1;
        const modulo = (n, m) => ((n % m) + m) % m;
        setter(index => {
            return modulo(index + shift, length)
        });
    }

    useEffect(() => {
        setKeys(keyEvents);
        GameService.downloadList(setGames);
    },[]);

    const keyEvents = [
        {
            ...buttons.bottom,
            label:"Se déplacer",
            args: {"move": "down"},
            callback: () => {}
        },
        {
            ...buttons.top,
            label:"Se déplacer",
            args: {"move": "up"},
            callback: () => {}
        },
        {
            ...buttons.cross,
            label: "Voir",
            args:{},
            callback: () => {}
        }
    ]

    return (
        <div className="container" style={{ maxHeight:"100%", minHeight:"100%", display:"flex"}}>
            <div className="content" style={{ backgroundColor:"#101010", zIndex:2, padding:"16px"}}>
                <div style={{ margin:"0 0 8px 0"}}>
                    <TopBar links={[]} breadCrumb={breadCrumb}/>
                </div>
                <div className={classes.container}>
                    <div style={{ width:"100%", flex:"1", flexDirection:"column", justifyContent:"flex-start", display:"flex", boxSizing:'border-box', margin:'0'}}>
                        {games.map(e =>
                            <div style={{ display:'flex', height:'20%', color:'grey', flexDirection:'row', justifyContent:"space-between", alignItems:'center', padding:'10px'}}>
                                <div style={{ height:'100%', display:'flex', flexDirection:'row', alignItems:'center'}}>
                                    <img src={e.picture.url} alt={e.name} style={{ maxHeight:"100%", minHeight:"100%", overflow:'hidden', borderRadius:'10px'}}/>
                                    <h3 style={{ padding:'20px' }}>{e.name}</h3>
                                </div>
                                <h2 style={{ padding:'10px' }}>{parseFloat(e.downloadedChunksSize.reduce((a,b) => a+b,0)/e.totalSize).toFixed(2)*100}%</h2>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}