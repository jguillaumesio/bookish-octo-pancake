import {makeStyles} from "@mui/styles";

const useStyle = makeStyles({
    footer: {background:'#333333', color:'white', position:'fixed', bottom:'0', width: '100%', height: 'fit-content', padding: '10px', display: 'flex', justifyContent: 'center'}
})

export const ButtonBottomIndicator = (props) => {

    const classes = useStyle();

    return (
        <div className={classes.footer}>
            OK
        </div>
    )
}