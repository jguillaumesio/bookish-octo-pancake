import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {HashRouter, Route, Routes} from "react-router-dom";
import {HomeIndex, ErrorIndex, MusicIndex, GameListIndex, NewGameListIndex, DownloadListIndex, NewGameDetailsIndex} from "./route";
import {GlobalProvider} from "./provider/GlobalProvider";

ReactDOM.render(
    <HashRouter>
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
                <Route path="music" element={<MusicIndex breadCrumb={["Musique"]}/>}/>
                <Route path="error" element={<ErrorIndex breadCrumb={["Erreur"]}/>}/>
            </Route>
        </Routes>
    </HashRouter>,
    document.getElementById('root')
);

reportWebVitals();
