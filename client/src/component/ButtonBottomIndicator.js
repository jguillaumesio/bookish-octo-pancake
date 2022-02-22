import {makeStyles} from "@mui/styles";

const useStyle = makeStyles({
    footer: {background:'#333333', color:'white', position:'fixed', justifyContent:'center', maxHeight:'50px', bottom:'0', width: '100%', height: 'fit-content', padding: '10px', display: 'flex'}
})

export const ButtonBottomIndicator = (props) => {

    const classes = useStyle();

    return (
        <div className={classes.footer}>
            <div style={{ display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center' }}>
                <img src={'/pad/cross.png'} alt={'back'} style={{ display:'block', height:'30px', width:'30px'}}/>
                <span style={{ padding:'5px'}}>Valider</span>
            </div>
            <div style={{ display:'flex', flexDirection:'row', justifyContent:'center', alignItems:'center', marginLeft:'auto' }}>
                <img src={'/pad/circle.png'} alt={'back'} style={{ display:'block', height:'30px', width:'30px'}}/>
                <span style={{ padding:'5px'}}>Retour</span>
            </div>
        </div>
    )
}