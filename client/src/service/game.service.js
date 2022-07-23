import axios from "axios";
import socketIOClient from "socket.io-client";

class GameDataService {

    constructor(){
        this.socket = null;
        this.root = `http://127.0.0.1:8080/api/games`;
    }

    searchGameDetails(search, directory){
        return axios.post(`${this.root}/details`,{"search": search, "directoryName":directory})
    }

    getGenres(){
        return axios.get(`${this.root}/genres`);
    }

    searchByGenre(genreList){
        return axios.post(`${this.root}/genres`, { "genres": genreList})
    }

    searchByName(search){
        return axios.post(`${this.root}/search`, { "search": search})
    }

    refreshNewGameList(){
        return axios.get(`${this.root}/refresh`);
    }

    getNewGameList(){
        return axios.get(`${this.root}/new`);
    }

    getGames(){
        return axios.get(`${this.root}/`);
    }

    downloadsToResume(){
        return axios.get(`${this.root}/downloadsToResume`);
    }

    download(url, directory, name, callbackOnFirstResponse){
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080',{reconnection: false});
        this.socket.emit('download', {"url":url, "directory":directory, "name":name});
        this.socket.on('downloadResponse', (JSONString) => {
            const args = JSON.parse(JSONString);
            callbackOnFirstResponse(args);
        });
        this.socket.on('disconnect',() => this.socket = null);
    }

    restartDownload(url, directory, name, callbackOnFirstResponse){
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080',{reconnection: false});
        this.socket.emit('restartDownload', {"url":url, "directory":directory, "name":name});
        this.socket.on('restartDownloadResponse', (JSONString) => {
            const args = JSON.parse(JSONString);
            callbackOnFirstResponse(args);
        });
        this.socket.on('disconnect',() => this.socket = null);
    }

    downloadList(setState){
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080',{reconnection: false});
        this.socket.emit('downloadList', {});
        this.socket.on('downloadList',(JSONString) => {
            let args = JSON.parse(JSONString);
            setState(args);
        });
        this.socket.on('disconnect',() => this.socket = null);
    }

    launchGame(gamePath){
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080',{reconnection: false});
        this.socket.emit('launchGame', {"gamePath": gamePath});
        this.socket.on('disconnect',() => this.socket = null);
    }
}

export default new GameDataService();