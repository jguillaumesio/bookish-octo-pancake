import {makeStyles} from "@mui/styles";
import {useEffect} from "react";

const useStyle = makeStyles({
    footer: {
        background: '#333333',
        color: 'white',
        justifyContent: 'flex-end',
        minHeight: '50px',
        maxHeight: '50px',
        width: '100%',
        height: 'fit-content',
        padding: '10px',
        display: 'flex',
        zIndex: 1
    }
})

export const ButtonBottomIndicator = (props) => {

    const {buttons} = props;
    const classes = useStyle();

    useEffect(() => {
    },[buttons]);

    return (
        <div className={classes.footer}>
            {
                (buttons ?? []).map(button =>
                    <div key={button.keyboard} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin:'0 5px'}}>
                        <img src={button.icon} alt={'back'} style={{display: 'block', height: '30px', width: '30px', filter: "drop-shadow(0px 0px 2px rgba(0,0,0,0.2))"}}/>
                        <span style={{padding: '5px'}}>{button.label ?? ""}</span>
                    </div>
                )
            }
        </div>
    )
}