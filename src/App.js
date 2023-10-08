class App{
    constructor(){
        // console.log("App initialized");
        this.getLocation();
        this.myLat;
        this.myLng;
        this.occupationNumber = document.querySelector("#occupation");
        this.bikeStallDistance = document.querySelector("#distance");
        this.bikeStallName = document.querySelector("#bikeStallName");
        this.bikeStallAvailable = document.querySelector("#availability");
        this.bikeStalls = [];
        this.occupationCount = 0;
        this.closestBikeStall;
        this.fetchDataFromLocal();
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
                this.storeDataInLocalStorage(this.bikeStalls);
                this.calculateDistances();
            })
            .catch(error => {
                console.error("Error fetching bike stalls data:", error);
            });
    }

    showBikeStall(name, distance, bikesAvailable){
        distance = Math.round(distance * 1000);

        this.bikeStallDistance.innerHTML = distance;
        this.bikeStallName.innerHTML = name;
        this.bikeStallAvailable.innerHTML = bikesAvailable;
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
            return { name: stall.name, bikesAvailable: stall.bikes_available, distance };
        });

        this.closestBikeStall = distances.reduce((prev, curr) =>
            prev.distance < curr.distance ? prev : curr
        );

        this.showBikeStall(this.closestBikeStall.name, this.closestBikeStall.distance, this.closestBikeStall.bikesAvailable);
        // console.log(`Closest bike stall: ${this.closestBikeStall.name}, Distance: ${this.closestBikeStall.distance} km and ${this.closestBikeStall.bikesAvailable} bikes available`);
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
                this.occupationCount = this.calculateoccupation(data);
                this.storeDataInLocalStorage(this.bikeStalls, this.occupationCount);
                this.showOccupation(this.occupationCount);
            })
    }

    calculateoccupation(data){
        let totalOccupied = 0;
        for(let i = 0; i < data.results.length; i++){
            totalOccupied += data.results[i].occupation;
        }
        return totalOccupied;
    }

    showOccupation(totalOccupied){
        this.occupationNumber.innerHTML = totalOccupied;
    }

    fetchDataFromLocal(){
        const storedData = localStorage.getItem("bikeStallsData");
        if (storedData) {
            const { timestamp, data, occupationNumber } = JSON.parse(storedData);
            const now = new Date().getTime();
            if (now - timestamp < 60000) {
                this.bikeStalls = data;
                this.occupationNumber.innerHTML = occupationNumber;
                this.calculateDistances();
                console.log("Data loaded from local storage");
                console.log(data);
                return;
            }
        }

        this.getBikeStalls();
        this.getOccupation();
        console.log("Data loaded from API");
    }

    storeDataInLocalStorage(data, occupationNumber) {
        const timestamp = new Date().getTime();
        const storedData = JSON.stringify({ timestamp, data, occupationNumber });
        localStorage.setItem("bikeStallsData", storedData);
    }

    errorLocation(error) {
        console.log(error);
    }

}

let app = new App();