import {Menu} from "../component/Menu";
import {ButtonBottomIndicator} from "../component/ButtonBottomIndicator";

export const EmulatorListIndex = () => {

    const emulatorList = [['ps1', 'ps2', 'wii'], ['ds', 'gamecube', 'megadrive']]

    return (
            <div className="container">
                <div className="content">
                    <Menu onBackspace={()=> console.log('back')} emulatorList={emulatorList} />
                    <ButtonBottomIndicator/>
                </div>
            </div>
    )
}