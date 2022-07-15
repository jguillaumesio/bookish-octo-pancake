import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {HomeIndex, GameListIndex, NewGameListIndex, DownloadListIndex, NewGameDetailsIndex} from "./route";
import {GlobalProvider} from "./provider/GlobalProvider";

ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<GlobalProvider/>}>
                <Route index element={<HomeIndex breadCrumb={["Home"]}/>}/>
                <Route path="emulators">
                    <Route index element={<GameListIndex breadCrumb={["Home","My Games"]}/>}/>
                    <Route path="new">
                        <Route index element={<NewGameListIndex breadCrumb={["Home","New Games"]}/>}/>
                        <Route path=":name" element={<NewGameDetailsIndex/>}/>
                    </Route>
                    <Route path="downloads" element={<DownloadListIndex breadCrumb={["Home","Downloads"]}/>}/>
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>,
    document.getElementById('root')
);

reportWebVitals();
