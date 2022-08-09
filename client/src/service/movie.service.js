import axios from "axios";

class MovieDataService {

    constructor(){
        this.socket = null;
        this.root = `http://127.0.0.1:8080/api/movies`;
    }

    getNewMovies(){
        return axios.get(`${this.root}/new`);
    }

    getPlayerSrc(link, type){
        return axios.post(`${this.root}/getLinks`, { "link": link, "type": type });
    }

    search(search){
        return axios.post(`${this.root}/search`, { "search": search });
    }
}

export default new MovieDataService();