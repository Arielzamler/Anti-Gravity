document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("leaflet-map-container");
    if (!container) return;

    // Initialize Leaflet map
    const map = L.map('leaflet-map-container', {
        zoomControl: false,
        attributionControl: false
    }).setView([39.8283, -98.5795], 4); // Center of US

    window.radarMap = map; // Expose to global scope for invalidateSize in app.js

    // Base Tile Layer - CartoDB Dark Matter for futuristic, realistic look
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Map controls binding
    document.getElementById("map-zoom-in").addEventListener("click", () => map.zoomIn());
    document.getElementById("map-zoom-out").addEventListener("click", () => map.zoomOut());
    document.getElementById("map-reset").addEventListener("click", () => {
        map.setView([39.8283, -98.5795], 4);
        document.getElementById("state-focus-overlay").style.opacity = "0";
        if (geojsonLayer) geojsonLayer.resetStyle();
        activeLayer = null;
    });

    // Opportunities data (Lat, Lng)
    let opportunities = [
        { id: "tx-1", state: "Texas", coords: [30.2672, -97.7431], profit: "+$43k | 19% ROI", price: "$192,700", rehab: "$39,300", arv: "$275,000", beds: 3, baths: 2, sqft: "1,210", address: "1248 Maple Ave", city: "Austin, TX", img: "images/comp_1.png" },
        { id: "tx-2", state: "Texas", coords: [32.7767, -96.7970], profit: "+$28k | 13% ROI", price: "$167,000", rehab: "$45,000", arv: "$240,000", beds: 4, baths: 2, sqft: "1,450", address: "802 Elm St", city: "Dallas, TX", img: "images/comp_2.png" },
        { id: "tx-3", state: "Texas", coords: [29.7604, -95.3698], profit: "+$19k | 8% ROI", price: "$191,000", rehab: "$55,000", arv: "$265,000", beds: 3, baths: 2, sqft: "1,310", address: "405 Main St", city: "Houston, TX", img: "images/comp_3.png" },
        { id: "oh-1", state: "Ohio", coords: [39.9612, -82.9988], profit: "+$35k | 17% ROI", price: "$170,000", rehab: "$35,000", arv: "$240,000", beds: 3, baths: 1.5, sqft: "1,180", address: "1302 Oak St", city: "Columbus, OH", img: "images/comp_2.png" },
        { id: "fl-1", state: "Florida", coords: [28.5383, -81.3792], profit: "+$21k | 9% ROI", price: "$196,000", rehab: "$48,000", arv: "$265,000", beds: 3, baths: 2, sqft: "1,340", address: "1190 Pine Rd", city: "Orlando, FL", img: "images/comp_3.png" }
    ];

    let markers = [];
    const modal = document.getElementById("property-details-modal");
    document.getElementById("close-property-modal").addEventListener("click", () => {
        modal.classList.add("translate-y-[120%]");
    });

    function openModal(d) {
        document.getElementById("prop-modal-img").src = d.img;
        document.getElementById("prop-modal-profit").textContent = d.profit;
        document.getElementById("prop-modal-address").textContent = d.address;
        document.getElementById("prop-modal-city").textContent = d.city;
        document.getElementById("prop-modal-beds").textContent = d.beds;
        document.getElementById("prop-modal-baths").textContent = d.baths;
        document.getElementById("prop-modal-sqft").textContent = d.sqft;
        document.getElementById("prop-modal-price").textContent = d.price;
        document.getElementById("prop-modal-rehab").textContent = d.rehab;
        document.getElementById("prop-modal-arv").textContent = d.arv;

        modal.classList.remove("translate-y-[120%]");
    }

    // Add Custom Markers
    opportunities.forEach(opp => {
        const customIcon = L.divIcon({
            className: 'custom-leaflet-pin',
            html: `
                <div class="flex flex-col items-center cursor-pointer group" style="margin-top: -30px; margin-left: -50px; width: 100px;">
                    <div class="bg-slate-900/95 backdrop-blur text-green-400 font-bold px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.5)] border border-green-500/50 flex items-center justify-center gap-1 group-hover:scale-110 transition-transform text-[11px] whitespace-nowrap">
                        <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>
                        ${opp.profit}
                    </div>
                    <div class="w-px h-3 bg-green-500/50"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></div>
                </div>
            `,
            iconSize: [0, 0]
        });

        const marker = L.marker(opp.coords, { icon: customIcon }).addTo(map);
        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            openModal(opp);
        });
        markers.push(marker);
    });

    let geojsonLayer;
    let activeLayer = null;

    // Fetch US States GeoJSON to add interactive borders and click-to-zoom
    fetch("https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json")
        .then(res => res.json())
        .then(data => {
            // Setup custom pane so borders sit underneath our interactive markers
            map.createPane('statesPane');
            map.getPane('statesPane').style.zIndex = 350;

            const stateFipsToAbbr = {
                "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
                "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
                "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
                "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
                "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI",
                "56": "WY"
            };

            const defaultStyle = {
                color: "#22d3ee",
                weight: 1,
                opacity: 0.3,
                fillColor: "transparent",
                fillOpacity: 0
            };

            const highlightStyle = {
                color: "#22d3ee",
                weight: 2,
                opacity: 0.8,
                fillColor: "#06b6d4",
                fillOpacity: 0.1
            };

            geojsonLayer = L.geoJSON(data, {
                pane: 'statesPane',
                style: defaultStyle,
                onEachFeature: function (feature, layer) {
                    const fips = feature.id;
                    const abbr = stateFipsToAbbr[fips] || feature.properties.name;

                    // Add state initials as a tooltip in the center
                    layer.bindTooltip(abbr, {
                        permanent: true,
                        direction: 'center',
                        className: 'state-label-tooltip'
                    });

                    layer.on({
                        mouseover: (e) => {
                            if (e.target !== activeLayer) {
                                e.target.setStyle({ fillOpacity: 0.05, opacity: 0.6, weight: 1.5 });
                            }
                        },
                        mouseout: (e) => {
                            if (e.target !== activeLayer) {
                                geojsonLayer.resetStyle(e.target);
                            }
                        },
                        click: (e) => {
                            // Reset style
                            if (activeLayer) geojsonLayer.resetStyle(activeLayer);
                            activeLayer = e.target;
                            
                            // Highlight selected state
                            e.target.setStyle(highlightStyle);

                            // Zoom to state bounds
                            map.fitBounds(e.target.getBounds(), { padding: [50, 50], animate: true, duration: 1 });

                            // Update overlay
                            document.getElementById("focus-state-name").textContent = feature.properties.name;
                            document.getElementById("state-focus-overlay").style.opacity = "1";
                            
                            // Close any open modal
                            modal.classList.add("translate-y-[120%]");
                        }
                    });
                }
            }).addTo(map);
        });
});
