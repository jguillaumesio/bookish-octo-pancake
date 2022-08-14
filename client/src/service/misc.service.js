import axios from "axios";

class MiscDataService {

    constructor(){
        this.root = `http://127.0.0.1:8080/api/misc`;
    }

    click(x, y){
        return axios.post(`${this.root}/click`, { "x": x, "y": y})
    }
    
}

export default new MiscDataService();