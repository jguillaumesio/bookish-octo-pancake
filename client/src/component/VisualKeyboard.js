import * as React from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import {Dialog, DialogContent, Slide} from "@mui/material";
import {createContext, useEffect, useState} from "react";
import {buttons} from "../utils/pad";
import {makeStyles} from "@mui/styles";
import {KeyContext} from "../provider/HotKeyProvider";

export const KeyboardContext = createContext([]);

const useStyle = makeStyles({
    highlight: {
        boxShadow:"0 0 3px 1px rgba(90, 120, 120, 0.95) !important",
        zIndex: "1"
    }
});


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props}>{props.children}</Slide>;
});

const keyboardLayout = {
    'default': [
        '1 2 3 4 5 6 7 8 9 0 @ {bksp}',
        'a z e r t y u i o p [ ] {enter}',
        '{lock} q s d f g h j k l ; \'',
        '{shift} w x c v b n m , . / \\',
        '{space}'
    ],
    'shift': [
        '! # $ % ^ & * ( ) _ + - = {bksp}',
        'A Z E R T Y U I O P { } {enter}',
        '{lock} Q S D F G H J K L :',
        '{shift} W X C V B N M < > ?',
        '{space}'
    ]
}

export const VisualKeyboard = (props) => {

    const classes = useStyle();
    const {isOpen, setIsOpen, keyboardCallback, setKeyboardCallback, keyboardCloseCallback, setKeyboardCloseCallback} = props;
    const [value, setValue] = useState("");
    const [layoutName, setLayoutName] = useState("default");
    const [selectedKey, setSelectedKey] = useState("a");
    const [keys, _setKeys] = useState(keyboardLayout[layoutName].map(e => e.split(" ")));
    const [setKeys] = React.useContext(KeyContext);

    useEffect(() => {
        console.log(isOpen);
        if(isOpen){
            setKeys(keyEvents);
        }
    },[isOpen, layoutName, keyboardCallback, setSelectedKey, setLayoutName, selectedKey, value])

    useEffect(() => {
        console.log("setKeyboard");
        _setKeys(keyboardLayout[layoutName].map(e => e.split(" ")));
    },[layoutName]);

    const onKeyPress = (button) => {
        if (button === "{shift}" || button === "{maj}"){
            handleShift();
        }
    };

    const handleShift = () => {
        setLayoutName(layoutName => layoutName === "shift" ? "default" : "shift")
    };

    const handleMove = ({move}) => {
        const modulo = (n, m) => ((n % m) + m) % m;
        const type = (["top","bottom"].includes(move) ? "row" : "column");

        let rowIndex = keys.findIndex(e => e.includes(selectedKey));
        let columnIndex = keys[rowIndex].findIndex(e => e === selectedKey);
        const shift = (["top","left"].includes(move)) ? -1 : 1;

        if(type === "row"){
            const newIndex = modulo(rowIndex+shift, keys.length);
            columnIndex = (keys[newIndex].length <= columnIndex) ? keys[newIndex].length - 1 : columnIndex;
            setSelectedKey(_ => keys[newIndex][columnIndex]);
        }
        else{
            const newIndex = modulo(columnIndex+shift, keys[rowIndex].length);
            setSelectedKey(_ => keys[rowIndex][newIndex]);
        }
    }

    const buttonTheme = () => {
        return [
            {
                class: classes.highlight,
                buttons: selectedKey
            }]
    }

    const keyEvents = [
        {
            ...buttons.right,
            continuous: true,
            display: false,
            args: {"move": "right"},
            callback: handleMove
        },
        {
            ...buttons.left,
            continuous: true,
            display: false,
            args: {"move": "left"},
            callback: handleMove
        },
        {
            ...buttons.top,
            continuous: true,
            display: false,
            args: {"move": "top"},
            callback: handleMove
        },{
            ...buttons.bottom,
            continuous: true,
            display: false,
            args: {"move": "bottom"},
            callback: handleMove
        }, {
            ...buttons.start,
            label: "Valider",
            args:{},
            callback: async () => {
                await keyboardCallback(value);
                keyboardCloseCallback();
                setIsOpen(false);
                setValue("");
            }
        },
        {
          ...buttons.square,
          label:"Effacer",
          callback: () => setValue(e => e.slice(0, -1))
        },
        {
            ...buttons.cross,
            label: "Sélectionner",
            args: {"key": selectedKey},
            callback: async ({key}) => {
                const regex = new RegExp(/{(.*?)}/);
                if (regex.test(key)) {
                    switch (key) {
                        case "{enter}":
                            await keyboardCallback(value);
                            keyboardCloseCallback();
                            setValue("");
                            setIsOpen(false);
                            break;
                        case "{bksp}":
                            setValue(value.slice(0, value.length - 1));
                            break;
                        case "{space}":
                            setValue(`${value} `)
                            break;
                    }
                } else {
                    setValue(`${value}${key}`)
                }
            }
        }, {
            ...buttons.circle,
            label: "Fermer",
            args: {"state": false},
            callback: ({state}) => {
                keyboardCloseCallback();
                setValue("");
                setIsOpen(state)
            }
        },
    ];

    return <KeyboardContext.Provider value={[setIsOpen, setKeyboardCallback, setKeyboardCloseCallback]}>
        <Dialog
                open={isOpen}
                keepMounted
                PaperProps={{style: {margin:"0", backgroundColor: 'transparent', boxShadow: 'none', width: "calc(100% - 50px)"},}}
                TransitionComponent={Transition}
            >
                <DialogContent style={{ padding:0 }}>
                    <div style={{ display:"flex", color:"white", alignItems:"center", minHeight:"40px", background:"#101010", borderRadius:"15px 15px 0 0", borderRight:"5px solid #202020", borderLeft:"5px solid #202020", borderTop:"5px solid #202020",padding: "5px 10px"}}>
                        {value}
                    </div>
                    <Keyboard
                        layout={keyboardLayout}
                        layoutName={layoutName}
                        onKeyPress={onKeyPress}
                        display={{'{bksp}': 'retour', '{lock}': 'maj', '{shift}': 'shift', '{enter}': 'entrée', '{tab}': 'tab', '{space}': ' '}}
                        buttonTheme={buttonTheme()}
                    />
                </DialogContent>
            </Dialog>
        {props.children}
    </KeyboardContext.Provider>

}