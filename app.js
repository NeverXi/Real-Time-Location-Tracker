// Initialize variables
let map;
let marker;
let watchId;
let isTracking = false;

// Initialize the map
function initMap() {
    try {
        // Create map centered at a default location
        map = L.map('map').setView([0, 0], 2);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Create a custom icon for the marker
        const customIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        // Create marker with custom icon
        marker = L.marker([0, 0], {icon: customIcon}).addTo(map);

        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
        alert('Error initializing map. Please try refreshing the page.');
    }
}

// Start tracking location
function startTracking() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser. Please try a different browser.');
        return;
    }

    console.log('Starting location tracking...');
    isTracking = true;
    document.getElementById('trackingStatus').textContent = 'Requesting permission...';
    document.getElementById('startTracking').disabled = true;
    document.getElementById('stopTracking').disabled = false;

    // First try to get current position
    navigator.geolocation.getCurrentPosition(
        (position) => {
            console.log('Initial position obtained:', position);
            document.getElementById('trackingStatus').textContent = 'Tracking';
            startWatchingPosition();
        },
        (error) => {
            console.error('Error getting initial position:', error);
            let errorMessage = 'Error getting location: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Location permission denied. Please allow location access in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += error.message;
            }
            document.getElementById('trackingStatus').textContent = errorMessage;
            document.getElementById('startTracking').disabled = false;
            document.getElementById('stopTracking').disabled = true;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function startWatchingPosition() {
    watchId = navigator.geolocation.watchPosition(
        (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            console.log('New position:', pos);

            // Update marker position
            marker.setLatLng([pos.lat, pos.lng]);
            map.setView([pos.lat, pos.lng], 15);

            // Update last update time
            const now = new Date();
            document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
        },
        (error) => {
            console.error('Error watching position:', error);
            let errorMessage = 'Error tracking location: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Location permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out';
                    break;
                default:
                    errorMessage += error.message;
            }
            document.getElementById('trackingStatus').textContent = errorMessage;
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
}

// Stop tracking location
function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        isTracking = false;
        document.getElementById('trackingStatus').textContent = 'Not Tracking';
        document.getElementById('startTracking').disabled = false;
        document.getElementById('stopTracking').disabled = true;
        console.log('Location tracking stopped');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, initializing...');
    initMap();
    
    document.getElementById('startTracking').addEventListener('click', startTracking);
    document.getElementById('stopTracking').addEventListener('click', stopTracking);
    
    // Initially disable stop button
    document.getElementById('stopTracking').disabled = true;
}); 