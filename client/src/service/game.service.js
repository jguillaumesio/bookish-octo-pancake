import axios from "axios";
import socketIOClient from "socket.io-client";

class GameDataService {

    constructor(){
        this.socket = null;
        this.root = `http://127.0.0.1:8080/api/games`;
    }

    searchGameDetails(search){
        return axios.get(`${this.root}/details/${search}`)
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

    download(url, directory, name){
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080');
        this.socket.emit('download', {"url":url, "directory":directory, "name":name});
        this.socket.on('download',({percentage, name}) => console.log(`${name}: ${percentage}%`));
        this.socket.on('disconnect',() => this.socket = null);
    }

    launchGame(gamePath){
        console.log(gamePath);
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080');
        this.socket.emit('launchGame', {"gamePath": gamePath});
        this.socket.on('disconnect',() => this.socket = null);
    }
}

export default new GameDataService();