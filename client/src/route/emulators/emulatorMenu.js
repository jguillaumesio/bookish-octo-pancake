import images from "./../../utils/images";
import * as React from "react";
import {SportsEsports as SportsEsportsIcon, CloudDownload as CloudDownloadIcon, AddCircle as AddCircleIcon} from '@mui/icons-material';
import {useNavigate} from "react-router-dom";
import {ImageMenu} from "../../component/ImageMenu";

export const EmulatorMenuIndex = () => {

    const navigate = useNavigate();

    const onValidate = (selectedIndex) => {
        switch(selectedIndex){
            case 0:
                navigate("/emulators/library");
                break;
            case 1:
                navigate("/emulators/new");
                break;
            case 2:
                navigate("/emulators/downloads");
                break;
        }
    }

    return (
        <div className='container' >
            <div className='content'>
                <ImageMenu
                    onLeave={() => navigate("/")}
                    onValidate={onValidate}
                    style={{ display:"flex", height:"100%", flex:1, justifyContent:"center", alignItems:"center" }}
                    items={[
                        {name: "Mes jeux", image: images.game, Icon: SportsEsportsIcon},
                        {name: "Nouveaux jeux", image: images.tv, Icon: AddCircleIcon},
                        {name: "Téléchargements", image: images.music, Icon: CloudDownloadIcon}
                    ]}
                />
            </div>
        </div>
    )
}