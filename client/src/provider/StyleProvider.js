import React, {useState} from 'react';
import {GlobalStyles} from "@mui/material";
import {Outlet} from 'react-router-dom';
import {ButtonBottomIndicator} from "../component/ButtonBottomIndicator";
import {HotKeyProvider} from "./HotKeyProvider";
import {makeStyles} from "@mui/styles";

const useStyle = makeStyles({
    'customScrollbar':{
        '&::-webkit-scrollbar': {
            background: 'rgba(0,0,0,0.5)',
            width:'25px',
        },
        '&::-webkit-scrollbar-track': {
            margin:'5px'
        },
        '&::-webkit-scrollbar-thumb': {
            'backgroundClip': 'padding-box',
            backgroundColor: '#121212',
            'borderRight':'5px solid transparent',
            'borderLeft':'5px solid transparent',
        }
    },
})

const style = {
    'body': {
        overflow: 'overlay',
        margin: '0',
        fontFamily: "'Roboto', sans-serif",
    },
    '*': {
        boxSizing: 'border-box'
    },
    '.container': {
        background: '#121212',
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column'
    },
    '.content': {
        display: 'flex',
        flex: 1
    }
};

export const StyleProvider = () => {

    const classes = useStyle();
    const [keys, setKeys] = useState([]);

    return (
        <React.Fragment>
            <HotKeyProvider keys={keys} setKeys={setKeys}>
                <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:"hidden"}}>
                    <div className={ classes.customScrollbar } style={{ height:'calc(100% - 50px)', overflowY:"overlay"}}>
                        <GlobalStyles styles={style}/>
                        <Outlet/>
                    </div>
                    <ButtonBottomIndicator buttons={keys}/>
                </div>
            </HotKeyProvider>
        </React.Fragment>
    )
}