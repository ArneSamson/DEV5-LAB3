class App{
    constructor(){
        console.log("App initialized");
        this.getLocation();
        this.getOccupation();
        // this.getNearestBikeStall();
        this.myLat;
        this.myLng;
        this.occupationNumber = document.querySelector("#occupation");
        this.bikeStallDistance = document.querySelector("#distance");
        this.bikeStallName = document.querySelector("#bikeStallName");
        this.getBikeStalls();
        this.bikeStalls = [];
        this.closestBikeStall;
    }

    getLocation() {
        navigator.geolocation.getCurrentPosition(
            this.gotLocation.bind(this),
            this.errorLocation.bind(this)
            );
    }

    getBikeStalls(){
        let url1 = "https://data.stad.gent/api/explore/v2.1/catalog/datasets/blue-bike-deelfietsen-gent-dampoort/records?limit=20";
        let url2 = "https://data.stad.gent/api/explore/v2.1/catalog/datasets/blue-bike-deelfietsen-gent-sint-pieters-m-hendrikaplein/records?limit=20";
        let url3 = "https://data.stad.gent/api/explore/v2.1/catalog/datasets/blue-bike-deelfietsen-gent-sint-pieters-st-denijslaan/records?limit=20";

        const fetchPromises = [
            fetch(url1).then(response => response.json()),
            fetch(url2).then(response => response.json()),
            fetch(url3).then(response => response.json())
        ];
    
        // Use Promise.all to fetch data from all URLs concurrently
        Promise.all(fetchPromises)
            .then(dataArray => {
                this.bikeStalls = dataArray.reduce((accumulator, data) => {
                    return accumulator.concat(data.results);
                }, []);
    
                console.log(this.bikeStalls);
    
                this.calculateDistances();
            })
            .catch(error => {
                console.error("Error fetching bike stalls data:", error);
            });
    }

    gotLocation(result) {
        this.myLat = result.coords.latitude;
        this.myLng = result.coords.longitude;
        this.calculateDistances();
    }

    calculateDistances() {

        if (this.bikeStalls.length === 0) {
            console.log("No bike stall data available yet.");
            return;
        }

        const distances = this.bikeStalls.map(stall => {
            const distance = this.getDistanceFromLatLonInKm(
                this.myLat,
                this.myLng,
                stall.latitude,
                stall.longitude
            );
            return { name: stall.name, distance };
        });

        this.closestBikeStall = distances.reduce((prev, curr) =>
            prev.distance < curr.distance ? prev : curr
        );

        console.log(`Closest bike stall: ${this.closestBikeStall.name}, Distance: ${this.closestBikeStall.distance} km`);
    }

    getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = this.deg2rad(lat2-lat1);  // deg2rad below
        var dLon = this.deg2rad(lon2-lon1); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
            ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }
      
    deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    getOccupation(){

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
        let totalOccupied = 0;
        for(let i = 0; i < data.results.length; i++){
            totalOccupied += data.results[i].occupation;
        }
        // console.log(totalOccupied);
        this.occupationNumber.innerHTML = totalOccupied;
    }

    errorLocation(error) {
        console.log(error);
    }

}

let app = new App();