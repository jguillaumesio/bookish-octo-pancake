import {makeStyles} from "@mui/styles";
import images from "./../utils/images";
import {buttons} from "../utils/pad";
import {useEffect, useState} from "react";
import * as React from "react";
import {KeyContext} from "../provider/HotKeyProvider";
import {SportsEsports as SportsEsportsIcon, Audiotrack as AudiotrackIcon, Movie as MovieIcon, LiveTv as LiveTvIcon} from '@mui/icons-material';
import {useNavigate} from "react-router-dom";
import "./../assets/css/slideFromTopAnimation.css";
import {ImageMenu} from "../component/ImageMenu";

export const HomeIndex = () => {

    const navigate = useNavigate();

    const onValidate = (selectedIndex) => {
        switch(selectedIndex){
            case 0:
                navigate("emulators");
                break;
            case 1:
                navigate("movie");
                break;
            case 2:
                navigate("music");
                break;
            case 3:
                navigate("tv");
                break;
        }
    }

    return (
        <div className='container' >
            <div className='content'>
                <ImageMenu
                    onValidate={onValidate}
                    style={{ display:"flex", height:"100%", flex:1, justifyContent:"center", alignItems:"center" }}
                    items={[
                        {name: "Jeu", image: images.game, Icon: SportsEsportsIcon},
                        {name: "Film", image: images.tv, Icon: LiveTvIcon},
                        {name: "Musique", image: images.music, Icon: AudiotrackIcon},
                        {name: "Télévision", image: images.tv, Icon: MovieIcon}
                    ]}
                />
            </div>
        </div>
    )
}