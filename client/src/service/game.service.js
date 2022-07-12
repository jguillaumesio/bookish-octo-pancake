import axios from "axios";
import socketIOClient from "socket.io-client";

class GameDataService {

    constructor(){
        this.socket = null;
        this.root = `http://127.0.0.1:8080/api/games`;
    }

    //TODO use
    async parseResponse(request) {
        const response = await request;
        if("type" in response.data && response.data.type === "success"){
            return response.data.value;
        }
        else{
            throw new Error(response.data.value);
        }
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

    refreshNewGameList(){
        return axios.get(`${this.root}/refresh`);
    }

    getNewGameList(){
        return axios.get(`${this.root}/new`);
    }

    getGames(){
        return axios.get(`${this.root}/`);
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
        this.socket.emit('restartDownload', {"url":"https://archive.org/download/PS2_COLLECTION_PART1/10%20Pin%20-%20Champions%20Alley%20%28Europe%29%20%28En%2CFr%2CDe%2CEs%2CIt%2CNl%29.zip", "directory":"C:/Users/Guillaume/Downloads/bookish-octo-pancake/server/public/games/10-Pin-_-Champions-Alley", "name":"187 - Ride or die"});
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