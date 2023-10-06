class App{
    constructor(){
        console.log("App initialized");
        this.getOccupation();
    }


    getOccupation(){
        //https://data.stad.gent/api/explore/v2.1/catalog/datasets/bezetting-parkeergarages-real-time/records?limit=20

        let url = "https://data.stad.gent/api/explore/v2.1/catalog/datasets/bezetting-parkeergarages-real-time/records?limit=20";

        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                // console.log(data);
                this.showOccupation(data);
            })
        }

    showOccupation(data){
        
    }
}

let app = new App();