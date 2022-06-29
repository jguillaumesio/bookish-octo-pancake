import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomeIndex, GameListIndex, NewGameListIndex, NewGameDetailsIndex} from "./route";
import {StyleProvider} from "./provider/StyleProvider";

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<StyleProvider/>}>
                <Route index element={<HomeIndex breadCrumb={["Home"]}/>}/>
                <Route path="emulators">
                    <Route path="new">
                        <Route index element={<NewGameListIndex breadCrumb={["Home","New Games"]}/>}/>
                        <Route path=":name" element={<NewGameDetailsIndex/>}/>
                    </Route>
                    <Route index element={<GameListIndex breadCrumb={["Home","My Games"]}/>}/>
                </Route>
                <Route path="downloads" element={null}/>
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
);

reportWebVitals();
