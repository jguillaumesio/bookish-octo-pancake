import {makeStyles} from "@mui/styles";
import {useEffect} from "react";

const useStyle = makeStyles({
    "item": {
        display: 'flex',
        flexDirection: 'row',
        alignItems:'center',
        color: 'grey',
        cursor: 'pointer',
        fontWeight:"bold",
        fontSize:"medium",
        margin:"0",
        height:"55px",
        width:"100%",
        padding:"8px 5px",
        maxHeight:'120px',
        minHeight:'120px'
    },
    "selectedItem":{
        color:"white"
    }
})

export const TextMusicList = (props) => {

    let { musics, offset, limit, isContainerSelected } = props;
    const selectedMusic = musics[offset];

    const visibleMusics = () => {
        return (offset + limit > musics.length)
            ? [...musics.slice(offset, musics.length), ...musics.slice(0, offset + limit - musics.length)]
            : musics.slice(offset, offset + limit);
    }
    const classes = useStyle();

    return(
        <div style={{ width:"100%", flex:"1", flexDirection:"column", alignItems:"flex-start", height:"100%", display:"flex", boxSizing:'border-box', padding:'0 20px', margin:'0'}}>
            {(visibleMusics().length > 0)
                ?
                visibleMusics().map((music, index) => (
                    <div key={index} className={`${(isContainerSelected && selectedMusic === music) ? classes.selectedItem : ""} ${classes.item}`}>
                        <img style={{ maxHeight:'120px', maxWidth:'160px', minHeight:'120px', minWidth:'160px'}} src={music["thumbnail"]} title={music["title"]}/>
                        <span style={{ display:"block", width:"100%", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{music["title"]}</span>
                    </div>
                ))
                :
                <div className={`${classes.item}`}>
                    Faites une recherche pour afficher des musiques !
                </div>
            }
        </div>
    )
}