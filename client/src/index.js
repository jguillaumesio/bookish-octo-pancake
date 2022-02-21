import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomeIndex, EmulatorListIndex, GameListIndex, NewGameListIndex} from "./route";
import {StyleProvider} from "./provider/StyleProvider";

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<StyleProvider/>}>
                <Route index element={<HomeIndex/>}/>
                <Route path="emulators">
                    <Route index element={<EmulatorListIndex/>}/>
                    <Route path=":emulator">
                        <Route path="new" element={<NewGameListIndex/>}/>
                        <Route index element={<GameListIndex/>}/>
                    </Route>
                </Route>
                <Route path="downloads" element={null}/>
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
