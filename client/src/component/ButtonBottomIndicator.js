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
        display: 'flex'
    }
})

export const ButtonBottomIndicator = (props) => {

    const {buttons} = props;
    const classes = useStyle();

    useEffect(() => {
        console.log("voici les touches");
        console.log(buttons);
    },[buttons]);

    return (
        <div className={classes.footer}>
            {
                (buttons ?? []).map(button =>
                    <div key={button.keyboard} style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <img src={button.icon} alt={'back'} style={{display: 'block', height: '30px', width: '30px'}}/>
                        <span style={{padding: '5px'}}>{button.label ?? ""}</span>
                    </div>
                )
            }
        </div>
    )
}