import axios from "axios";
import socketIOClient from "socket.io-client";

class GameDataService {

    constructor(){
        this.socket = null;
        this.root = `http://127.0.0.1:8080/api/games`;
    }

    getGameDetails(emulator, search){
        return axios.get(`${this.root}/${emulator}/details/${search}`)
    }

    getByEmulator(emulator){
        return axios.get(`${this.root}/${emulator}`);
    }

    download(url, emulator, directory, name){
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080');
        this.socket.emit('download', {"url":url, "emulator":emulator, "directory":directory, "name":name});
        this.socket.on('download',({percentage, name}) => console.log(`${name}: ${percentage}%`));
        this.socket.on('disconnect',() => this.socket = null);
    }

    getNewByEmulator(setGames){
        const games = [];
        const setNewGames = (data) => {
            console.log(games.length);
            games.push(...JSON.parse(data).games);
            setGames([...games]);
        };
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080');
        this.socket.emit('getNewGames', {});
        this.socket.on('getNewGames', setNewGames);
        this.socket.once('endGetNewGames',() => {
            this.socket.off("getNewGames", setNewGames);
            console.log("off");
        });
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