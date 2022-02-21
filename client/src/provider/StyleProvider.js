import React from 'react';
import {GlobalStyles} from "@mui/material";
import {Outlet} from 'react-router-dom';

const style = {
    'body':{
        margin:'0',
        fontFamily:"'Roboto', sans-serif"
    },
    '*':{
        boxSizing:'border-box'
    },
    '.container':{
        background:'#121212',
        display:'flex',
        minHeight:'100vh',
        flexDirection:'column'
    },
    '.content':{
        display:'flex',
        flex:1
    }
};

export const StyleProvider = () => {

    return(
        <React.Fragment>
            <GlobalStyles styles={style} />
            <Outlet/>
        </React.Fragment>
    )
}