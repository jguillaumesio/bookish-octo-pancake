import React, {createContext, useEffect, useState} from 'react';
import {makeStyles} from "@mui/styles";
import Gamepad from 'react-gamepad'


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

    const listener = async e => {
        const element = keys.find(key => key.keyboard === e.key);
        await element?.callback(element?.args);
    }

    useEffect(() => {
        window.addEventListener('keydown', listener);
        return () => {
            window.removeEventListener('keydown', listener);
        }
    }, [keys]);

    const handleButtonPress = async (buttonName, keys) => {
        const element = keys.find(key => key.buttonName === buttonName);
        if(element !== null){
            await element?.callback(element?.args)
        }
    }

    return (
        <KeyContext.Provider tabIndex="0" className={classes.root} value={[setKeys]}>
            <Gamepad
                onButtonDown={(buttonName) => handleButtonPress(buttonName, keys)}
            >
            {props.children}
            </Gamepad>
        </KeyContext.Provider>
    )
}