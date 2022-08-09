import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import {HashRouter, Route, Routes} from "react-router-dom";
import {
    HomeIndex,
    MovieIndex,
    EmulatorMenuIndex,
    TVIndex,
    ErrorIndex,
    MusicIndex,
    GameListIndex,
    NewGameListIndex,
    DownloadListIndex,
    NewGameDetailsIndex,
    MoviePlayerIndex, SeriePlayerIndex
} from "./route";
import {GlobalProvider} from "./provider/GlobalProvider";

ReactDOM.render(
    <HashRouter>
        <Routes>
            <Route path="/" element={<GlobalProvider/>}>
                <Route index element={<HomeIndex breadCrumb={["Home"]}/>}/>
                <Route path="emulators">
                    <Route index element={<EmulatorMenuIndex breadCrumb={["Home"]}/>}/>
                    <Route path="library" element={<GameListIndex breadCrumb={["Home","My Games"]}/>}/>
                    <Route path="new">
                        <Route index element={<NewGameListIndex breadCrumb={["Home","New Games"]}/>}/>
                        <Route path=":name" element={<NewGameDetailsIndex/>}/>
                    </Route>
                    <Route path="downloads" element={<DownloadListIndex breadCrumb={["Home","Downloads"]}/>}/>
                </Route>
                <Route path="movies">
                    <Route index element={<MovieIndex breadCrumb={["Film et série"]}/>}/>
                    <Route path="movie" element={<MoviePlayerIndex/>}/>
                    <Route path="serie" element={<SeriePlayerIndex/>}/>
                </Route>
                <Route path="tv" element={<TVIndex breadCrumb={["Télévision"]}/>}/>
                <Route path="music" element={<MusicIndex breadCrumb={["Musique"]}/>}/>
                <Route path="error" element={<ErrorIndex breadCrumb={["Erreur"]}/>}/>
            </Route>
        </Routes>
    </HashRouter>,
    document.getElementById('root')
);

reportWebVitals();
