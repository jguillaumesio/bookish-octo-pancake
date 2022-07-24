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
    const [ buttonIntervals, setButtonIntervals ] = useState({});

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
            if("continuous" in element && element.continuous){
                setButtonIntervals(e => {
                    e[element.buttonName] = {
                        "type": "timeout",
                        "function": setTimeout(() => {
                            setButtonIntervals(e => {
                                e[element.buttonName] = {
                                    "type": "interval",
                                    "function": setInterval(async () => {
                                        await element?.callback(element?.args)
                                    }, 80)
                                }
                                return e;
                            });
                        }, 500)
                    }
                    return e;
                })
                await element?.callback(element?.args)
            }
            else{
                await element?.callback(element?.args)
            }
        }
    }

    const handleButtonStopPressing = async (buttonName, keys) => {
        const element = keys.find(key => key.buttonName === buttonName);
        if(element !== null){
            if("continuous" in element && element.continuous){
                if(buttonIntervals[element.buttonName].type === "interval"){
                    clearInterval(buttonIntervals[element.buttonName].function);
                }else{
                    clearTimeout(buttonIntervals[element.buttonName].function);
                }
                setButtonIntervals(e => {
                    delete e[element.buttonName];
                    return e;
                });
            }
        }
    }

    return (
        <KeyContext.Provider tabIndex="0" className={classes.root} value={[setKeys]}>
            <Gamepad
                onButtonDown={(buttonName) => handleButtonPress(buttonName, keys)}
                onButtonUp={(buttonName) => handleButtonStopPressing(buttonName, keys)}
            >
            {props.children}
            </Gamepad>
        </KeyContext.Provider>
    )
}