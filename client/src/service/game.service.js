import axios from "axios";
import socketIOClient from "socket.io-client";

class GameDataService {

    constructor(){
        this.socket = null;
        this.root = `http://127.0.0.1:8080/api/games`;
    }

    getNewByEmulator(emulator){
        return axios.get(`${this.root}/${emulator}/new`);
    }

    getByEmulator(emulator){
        return axios.get(`${this.root}/${emulator}`);
    }

    downloadNewGame(url, emulator, data){
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080');
        this.socket.emit('downloadGame', {url:url, emulator:emulator, data:data});
        this.socket.on('downloadTracking',({percentage}) => console.log(percentage));
        this.socket.on('disconnect',() => this.socket = null);
    }
}

export default new GameDataService();