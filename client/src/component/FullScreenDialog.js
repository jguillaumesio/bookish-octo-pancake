import * as React from 'react';
import {Dialog, DialogTitle, AppBar, Toolbar, Typography, Button, List, ListItem, ListItemText, CircularProgress, Chip} from '@mui/material';
import Masonry from '@mui/lab/Masonry'
import {Rating} from "@mui/lab";
import StarIcon from '@mui/icons-material/Star';


export const FullScreenDialog = (props) => {
    const {game, open, handleDialog, download} = props;
    const [openAvailableDownloads, setOpenAvailableDownloads] = React.useState(false);

    return (
        <div>
            {
                (game !== null) &&
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
            }
            <Dialog
                fullScreen
                open={open}
                PaperProps={{style: {backgroundColor: "#121212"}}}
            >
                {
                    (game !== null)
                        ? <div>
                            <AppBar sx={{position: 'relative', backgroundColor: "#101010"}}>
                                <Toolbar>
                                    <Typography sx={{ml: 2, flex: 1, color: "#EAEAEA"}} variant="h6" component="div">
                                        {game?.name}
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                            <div style={{
                                height: "100%",
                                padding: "20px",
                                width: "100%",
                                overflowX: "hidden",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <div style={{display: "flex", flexDirection: "row", alignItems: "center", maxHeight:"50vh"}}>
                                    <img src={game?.cover?.url} alt="cover" style={{maxHeight:"100%", width: "auto", height: "100%", display: "block", margin: "0 auto"}}/>
                                    <div style={{ padding: "0 20px", width: "60%", display: "flex", flexDirection:"column", alignItems:"flex-start", justifyContent:"space-between", height: "100%"}}>
                                        <div style={{ display:"flex", alignItems:"center", width:"100%", whiteSpace:"pre-wrap", minHeight:"50%", maxHeight:"50%", boxSizing:"border-box", marginBottom:"10px", overflow:"hidden", textOverflow: "ellipsis", color: "#EAEAEA", lineHeight: "1.6"}}>
                                            {game?.summary}
                                        </div>
                                        <div style={{ display:"block", width:"100%"}}>
                                            <div>
                                                { game.tags.slice(0,10).map(tag => <Chip key={tag.name} label={tag.name} sx={{ background: "#101010", color:"#fff", borderColor:"#101010"}} variant="outlined" />)}
                                            </div>
                                            <div style={{ display:"flex", flexDirection:"row", height:"50px", margin:"10px 0",width:"100%"}}>
                                                { "involved_companies" in game && game["involved_companies"].map(object =>
                                                    ("logo" in object.company) && <img key={object.id} src={object.company.logo.url} alt={object.company.name} style={{ display:"block", margin:"0 10px",  objectFit: "contain", height: "100%", width:"auto"}}/>
                                                ) }
                                            </div>
                                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                                                { "total_rating" in game && <Rating readOnly precision={0.1} value={(game["total_rating"] / 20).toFixed(2)} emptyIcon={<StarIcon style={{ fill:"rgba(255,255,255,0.1)" }} fontSize="inherit" />}/>}
                                                <Button onClick={() => setOpenAvailableDownloads(true)}>DOWNLOAD</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                { "screenshots" in game && game.screenshots.length > 0 &&
                                    <Masonry columns={2} spacing={2} style={{margin: "20px 0"}}>
                                        {game?.screenshots?.map((image, index) => (
                                            <img key={index} src={image.url} alt={image.url}/>
                                        ))}
                                    </Masonry>
                                }
                            </div>
                        </div>
                        :
                        <div style={{ display:"flex", width: "100%", height:"100%", alignItems:"center", justifyContent:"center"}}>
                            <CircularProgress/>
                        </div>
                }
            </Dialog>
        </div>
    );
}