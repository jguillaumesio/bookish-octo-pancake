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
        padding:"8px 5px",
    },
    "selectedItem":{
        color:"white"
    }
})

export const TextMusicList = (props) => {

    let { musics, offset, limit, isContainerSelected } = props;
    const selectedMusic = musics[offset];

    useEffect(() => {
        console.log(musics);
        console.log(offset);
    },[selectedMusic]);

    const visibleMusics = () => {
        return (offset + limit > musics.length)
            ? [...musics.slice(offset, musics.length), ...musics.slice(0, offset + limit - musics.length)]
            : musics.slice(offset, offset + limit);
    }
    const classes = useStyle();

    return(
        <div style={{ width:"100%", flex:"1", flexDirection:"column", alignItems:"flex-start", height:"100%", display:"flex", boxSizing:'border-box', padding:'0 20px', margin:'0'}}>
            {visibleMusics().map((music, index) => (
                <div key={index} className={`${(isContainerSelected && selectedMusic === music) ? classes.selectedItem : ""} ${classes.item}`}>
                    <img style={{ height:'100%', padding:'5px', width:'auto'}} src={music["cover"]} title={`${music["artist"]} - ${music["title"]}`}/>
                    <span>{music["artist"]} - {music["title"]}</span>
                </div>
            ))}
        </div>
    )
}