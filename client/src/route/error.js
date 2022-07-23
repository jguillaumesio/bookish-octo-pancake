import {VisualKeyboard} from "../component/VisualKeyboard";
import {useLocation} from "react-router-dom";


export const ErrorIndex = () => {

    const {state} = useLocation();

    return (
        <div className='container' >
            <div className='content'>
                <VisualKeyboard/>
            </div>
        </div>
    )
}