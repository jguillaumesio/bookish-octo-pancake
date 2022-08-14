import axios from "axios";
import socketIOClient from "socket.io-client";

class MusicDataService {

    constructor(){
        this.socket = null;
        this.root = `http://127.0.0.1:8080/api/musics`;
    }

    search(search, type){
        return axios.post(`${this.root}/search`, { "search": search, "type": type})
    }

    getMp3Link(title, artist){
        return axios.post(`${this.root}/`, { "title": title, "artist": artist})
    }

    download(url, onDataReceive){
        this.socket = this.socket ?? socketIOClient('http://127.0.0.1:8080',{reconnection: false});
        this.socket.on('downloadMusic', (data) => {
            onDataReceive(data);
        });
        this.socket.emit('downloadMusic', {"url":url});
        this.socket.on('disconnect',() => this.socket = null);
    }
}

export default new MusicDataService();