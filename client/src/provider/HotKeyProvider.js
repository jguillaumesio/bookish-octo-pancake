import React, {createContext, useEffect} from 'react';
import {makeStyles} from "@mui/styles";

export const KeyContext = createContext([]);

const useStyle = makeStyles({
    root: {
        "&:focus": {
            outline: '0px solid transparent'
        }
    }
});

export const HotKeyProvider = (props) => {

    const classes = useStyle();
    const {keys, setKeys} = props;

    const listener = (e) => {
        const element = keys.find(key => key.keyboard === e.key);
        element?.callback(element?.args);
    }

    //TODO https://developer.mozilla.org/en-US/docs/Games/Techniques/Controls_Gamepad_API
    useEffect(() => {
        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown', listener);
        }
    }, [keys]);

    return (
        <KeyContext.Provider tabIndex="0" className={classes.root} value={[keys, setKeys]}>
            {props.children}
        </KeyContext.Provider>
    )
}