import * as React from 'react';
import {Dialog, DialogTitle, AppBar, Toolbar, Typography, Button, List, ListItem, ListItemText, CircularProgress} from '@mui/material';
import Masonry from '@mui/lab/Masonry'


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
                            <ListItem button onClick={() => download(element)} key={element.rawName}>
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
                                <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                                    <img src={game?.cover?.url} alt="cover"
                                         style={{height: "100%", width: "auto", display: "block", margin: "0 auto"}}/>
                                    <div>
                                        <p style={{color: "#EAEAEA", lineHeight: "1.6", padding: "20px"}}>
                                            {game?.summary}
                                        </p>
                                        <Button onClick={() => setOpenAvailableDownloads(true)}>DOWNLOAD</Button>
                                    </div>
                                </div>
                                {game.screenshots && game.screenshots.length > 0 &&
                                    <Masonry columns={2} spacing={2} style={{margin: "20px 0"}}>
                                        {game?.screenshots?.map((image, index) => (
                                            <img key={index} src={image.url}/>
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