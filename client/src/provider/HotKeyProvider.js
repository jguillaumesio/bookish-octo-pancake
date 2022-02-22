import React, {useEffect, useRef} from 'react';
import { makeStyles} from "@mui/styles";

export const context = React.createContext({setRef: null});

const useStyle = makeStyles({
    root:{
        "&:focus":{
            outline:'0px solid transparent'
        }
    }
});

export const HotKeyProvider = ({children, onKeyPress, ...props}) => {

    const classes = useStyle();

    const listener = (e) => {
        onKeyPress.find(key => key.name === e.key)?.callback();
    }

    useEffect(() => {
        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown',listener);
        }
    }, [onKeyPress]);

    return (
        <div tabIndex="0" className={classes.root} {...props}>
            {children}
        </div>
    )
}