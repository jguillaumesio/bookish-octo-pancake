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

    searchGameDetails(search){
        return axios.get(`${this.root}/details/${search}`)
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
        this.socket.on('download',({percentage, name}) => console.log(`${name}: ${percentage}%`));
        this.socket.on('downloadResponse', (JSONString) => {
            const args = JSON.parse(JSONString);
            callbackOnFirstResponse(args);
        });
        this.socket.on('disconnect',() => this.socket = null);
    }

    launchGame(gamePath){
        console.log(gamePath);
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080',{reconnection: false});
        this.socket.emit('launchGame', {"gamePath": gamePath});
        this.socket.on('disconnect',() => this.socket = null);
    }
}

export default new GameDataService();