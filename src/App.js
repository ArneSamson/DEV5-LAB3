class App{
    constructor(){
        console.log("App initialized");
        this.getOccupation();
        this.occupationNumber = document.querySelector("#occupation");
    }


    getOccupation(){

        let url = "https://data.stad.gent/api/explore/v2.1/catalog/datasets/bezetting-parkeergarages-real-time/records?limit=20";

        fetch(url)
            .then(response => {
                return response.json();
            })
            .then(data => {
                console.log(data);
                this.showOccupation(data);
            })
        }

    showOccupation(data){
        let totalOccupied = 0;
        for(let i = 0; i < data.results.length; i++){
            totalOccupied += data.results[i].occupation;
        }
        console.log(totalOccupied);
        this.occupationNumber.innerHTML = totalOccupied;
        }
}

let app = new App();