// Register the datalabels plugin for all charts
Chart.register(ChartDataLabels);

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Elements
    const landingView = document.getElementById('landing-view');
    const loadingView = document.getElementById('loading-view');
    const dashboardView = document.getElementById('dashboard-view');
    const dealRadarView = document.getElementById('deal-radar-view');
    const navDealRadar = document.getElementById('nav-deal-radar');
    const btnDemo = document.getElementById('btn-demo');
    const btnBack = document.getElementById('btn-back');
    const loadingText = document.getElementById('loading-text');

    // Tab Elements
    const tabGlance = document.getElementById('tab-glance');
    const tabInspection = document.getElementById('tab-inspection');
    const viewGlance = document.getElementById('view-glance');
    const viewInspection = document.getElementById('view-inspection');

    // Top Level Metrics & Chart
    const valRehab = document.getElementById('val-rehab');
    const valProfit = document.getElementById('val-profit');
    const metricRehabBox = document.getElementById('metric-rehab');
    const metricProfitBox = document.getElementById('metric-profit');
    const chartStatusBadge = document.getElementById('chart-status-badge');
    
    // Summary Elements
    const sumCosmetic = document.getElementById('sum-cosmetic');
    const sumInspection = document.getElementById('sum-inspection');
    const sumTotal = document.getElementById('sum-total');

    let mainChartInst = null;

    // Gallery Elements
    const mainSubjectImg = document.getElementById('main-subject-image');
    const mainImgContainer = document.getElementById('main-image-container');
    const thumbContainer = document.getElementById('thumbnail-container');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');

    // Helper for Recommendation Score Colors (0=Red, 100=Green)
    const getScoreColor = (score) => {
        return `hsl(${score * 1.2}, 75%, 42%)`;
    };

    // Comprehensive Data
    const cosmeticItems = [
        // Recommended (High ROI)
        { item: "Kitchen Components", icon: "layout-template", status: "Outdated cabinets and counters", action: "Full Remodel required to meet top comps.", cost: 18500, value: 25000, score: 95, recommended: true },
        { item: "Kitchen Appliances", icon: "refrigerator", status: "Mismatched white appliances", action: "Upgrade to matching Stainless Steel package.", cost: 3500, value: 5000, score: 90, recommended: true },
        { item: "Master Bathroom", icon: "bath", status: "Single vanity, old tiling", action: "Add Double Vanity per neighborhood standard.", cost: 4800, value: 7500, score: 88, recommended: true },
        { item: "Interior Paint", icon: "paintbrush", status: "Yellowing walls, dated trim", action: "Repaint full interior (Agreeable Gray).", cost: 4000, value: 6000, score: 82, recommended: true },
        { item: "Exterior Paint & Siding", icon: "home", status: "Peeling paint, dirt buildup", action: "Power wash and repaint exterior siding.", cost: 3800, value: 5500, score: 80, recommended: true },
        { item: "Flooring", icon: "layers", status: "Scratched wood and old carpet", action: "Refinish Hardwood (Dark Walnut), new carpet in beds.", cost: 3200, value: 4000, score: 75, recommended: true },
        { item: "Curb Appeal", icon: "tree-pine", status: "Overgrown bushes, patchy grass", action: "Basic landscaping cleanup, mulch, paint door.", cost: 1500, value: 3000, score: 65, recommended: true },
        
        // Not Recommended (Low/Negative ROI)
        { item: "Secondary Bathrooms", icon: "droplet", status: "Functional but dated laminate", action: "DO NOT upgrade to luxury marble tiling.", cost: 8500, value: 2000, score: 20, recommended: false },
        { item: "Interior Doors & Hardware", icon: "door-open", status: "Hollow core doors, functional knobs", action: "DO NOT replace all with solid wood doors.", cost: 5000, value: 1500, score: 25, recommended: false },
        { item: "Lighting Fixtures", icon: "lightbulb", status: "Standard builder-grade fixtures", action: "DO NOT replace with high-end designer chandeliers.", cost: 4500, value: 1000, score: 15, recommended: false },
        { item: "Deck / Patio", icon: "sun", status: "Basic concrete slab patio", action: "DO NOT add a large multi-level composite deck.", cost: 12000, value: 3000, score: 12, recommended: false },
        { item: "Windows", icon: "layout-grid", status: "Double-pane vinyl, slightly aged frames", action: "DO NOT perform full replacement.", cost: 14000, value: 4000, score: 10, recommended: false },
        { item: "Garage Door", icon: "car", status: "Standard metal door, functional", action: "DO NOT install custom cedar wood carriage door.", cost: 4000, value: 500, score: 5, recommended: false }
    ];

    const structuralItemsGlance = [
        { item: "Roof Integrity", icon: "home", status: "Age unknown from exterior photos" },
        { item: "HVAC System", icon: "fan", status: "Unit condition cannot be visually confirmed" },
        { item: "Foundation Status", icon: "box", status: "Requires basement/crawlspace inspection" },
        { item: "Plumbing & Electrical", icon: "zap", status: "Panel and pipe materials unverified" }
    ];

    const inspectionFindings = [
        { item: "Roof Replacement", icon: "home", condition: "20+ years old. Shingles curling. Immediate replacement.", cost: 8500, value: 8500, score: 100, type: 'danger', action: "Full tear-off and replacement." },
        { item: "HVAC Servicing", icon: "fan", condition: "2018 Install. Good condition.", cost: 250, value: 250, score: 100, type: 'success', action: "Routine maintenance and filter change." },
        { item: "Foundation", icon: "box", condition: "Minor settling noted. Monitor only. No active leaks.", cost: 0, value: 0, score: 100, type: 'success', action: "No action required." },
        { item: "Electrical Panel", icon: "zap", condition: "100 Amp service. Outdated safety.", cost: 2200, value: 3000, score: 100, type: 'danger', action: "Update to 200 Amp service." },
        { item: "Plumbing", icon: "droplet", condition: "Copper supply, PVC waste. All good.", cost: 0, value: 0, score: 100, type: 'success', action: "No action required." }
    ];

    // Calculate Costs
    const baseRehabCost = cosmeticItems.filter(item => item.recommended).reduce((acc, curr) => acc + curr.cost, 0); 
    const inspectionExtraCost = inspectionFindings.reduce((acc, curr) => acc + curr.cost, 0); 
    const totalRehabCost = baseRehabCost + inspectionExtraCost; 

    const ARV = 275000;
    const PurchasePrice = 181000;

    const baseProfit = ARV - PurchasePrice - baseRehabCost; 
    const finalProfit = ARV - PurchasePrice - totalRehabCost; 

    // Render Data into DOM
    const renderLists = () => {
        // Cosmetic
        const ulCosmetic = document.getElementById('glance-cosmetic');
        ulCosmetic.innerHTML = '';
        cosmeticItems.forEach(rec => {
            const color = getScoreColor(rec.score);
            const isRec = rec.recommended;
            const bgClass = isRec ? "bg-slate-50 border-slate-100 shadow-sm hover:shadow-md" : "bg-white border-red-100 opacity-70 hover:opacity-100";
            const iconBg = isRec ? "bg-blue-50 border-blue-100 text-primary" : "bg-red-50 border-red-100 text-red-400";

            const li = document.createElement('li');
            li.className = `flex items-start gap-4 p-5 rounded-xl border transition-all ${bgClass}`;
            li.innerHTML = `
                <div class="${iconBg} p-3 rounded-xl shrink-0 mt-0.5 border">
                    <i data-lucide="${rec.icon}" class="w-6 h-6"></i>
                </div>
                <div class="flex-grow">
                    <div class="flex flex-wrap justify-between items-start mb-2 gap-4">
                        <div class="flex items-center gap-3">
                            <p class="font-bold text-slate-800 text-lg ${!isRec ? 'line-through text-slate-400' : ''}">${rec.item}</p>
                            ${!isRec ? '<span class="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">Not Recommended</span>' : ''}
                        </div>
                        
                        <div class="flex items-center gap-6 bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm ${!isRec ? 'opacity-80' : ''}">
                            <div class="text-right">
                                <p class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">Est. Cost</p>
                                <p class="font-mono font-bold ${!isRec ? 'text-red-500 line-through' : 'text-slate-800'} text-sm">$${rec.cost.toLocaleString()}</p>
                            </div>
                            <div class="w-px h-8 bg-slate-200"></div>
                            <div class="text-right">
                                <p class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">+ ARV Value</p>
                                <p class="font-mono font-bold ${!isRec ? 'text-slate-400' : 'text-success'} text-sm">+$${rec.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-sm text-slate-500 font-medium mb-1"><span class="text-slate-700 font-semibold">Observation:</span> ${rec.status}</p>
                    <p class="text-sm text-slate-600 mb-4"><span class="${isRec ? 'text-primary' : 'text-red-600'} font-semibold">Action:</span> ${rec.action}</p>
                    
                    <!-- Recommendation Score -->
                    <div class="flex items-center gap-3">
                        <span class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-28">Rec. Score</span>
                        <div class="flex-grow h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-1000" style="width: ${rec.score}%; background-color: ${color};"></div>
                        </div>
                        <span class="font-bold text-sm w-12 text-right" style="color: ${color}">${rec.score}/100</span>
                    </div>
                </div>
            `;
            ulCosmetic.appendChild(li);
        });

        // Structural Glance
        const ulStruct = document.getElementById('glance-structural');
        ulStruct.innerHTML = '';
        structuralItemsGlance.forEach(rec => {
            const li = document.createElement('li');
            li.className = "flex items-start gap-4 p-5 rounded-xl bg-white border-2 border-dashed border-slate-200 opacity-80";
            li.innerHTML = `
                <div class="bg-slate-100 p-3 rounded-xl text-slate-400 shrink-0 mt-0.5">
                    <i data-lucide="${rec.icon}" class="w-6 h-6"></i>
                </div>
                <div class="flex-grow">
                    <p class="font-bold text-slate-700 text-lg mb-1">${rec.item}</p>
                    <p class="text-sm text-slate-500 mb-2">${rec.status}</p>
                    <div class="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-1 rounded-md border border-orange-200">
                        <i data-lucide="alert-circle" class="w-3.5 h-3.5"></i> Cannot be assessed from base info
                    </div>
                </div>
            `;
            ulStruct.appendChild(li);
        });

        // Inspection Results
        const ulInsp = document.getElementById('inspection-results');
        ulInsp.innerHTML = '';
        inspectionFindings.forEach(res => {
            const color = getScoreColor(res.score);
            let iconHtml = '';
            let bgClass = '';
            
            if (res.type === 'danger') {
                bgClass = 'bg-red-50 border-red-100';
            } else if (res.type === 'success') {
                bgClass = 'bg-green-50 border-green-100';
            }

            const li = document.createElement('li');
            li.className = `flex items-start gap-4 p-5 rounded-xl border shadow-sm ${bgClass}`;
            li.innerHTML = `
                <div class="bg-white p-3 rounded-xl text-slate-700 shrink-0 mt-0.5 shadow-sm">
                    <i data-lucide="${res.icon}" class="w-6 h-6"></i>
                </div>
                <div class="flex-grow">
                    <div class="flex flex-wrap justify-between items-start mb-2 gap-4">
                        <p class="font-bold text-slate-800 text-lg">${res.item}</p>
                        
                        <div class="flex items-center gap-6 bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                            <div class="text-right">
                                <p class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">Act. Cost</p>
                                <p class="font-mono font-bold ${res.cost > 0 ? 'text-red-600' : 'text-slate-800'} text-sm">$${res.cost.toLocaleString()}</p>
                            </div>
                            <div class="w-px h-8 bg-slate-200"></div>
                            <div class="text-right">
                                <p class="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-0.5">Value Preserved</p>
                                <p class="font-mono font-bold text-slate-600 text-sm">+$${res.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-sm text-slate-600 font-medium mb-1"><span class="text-slate-800 font-semibold">Finding:</span> ${res.condition}</p>
                    <p class="text-sm text-slate-700 mb-4"><span class="text-orange-600 font-semibold">Action:</span> ${res.action}</p>
                    
                    <!-- Recommendation Score -->
                    <div class="flex items-center gap-3">
                        <span class="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider w-28">Mandatory Fix</span>
                        <div class="flex-grow h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div class="h-full rounded-full" style="width: ${res.score}%; background-color: ${color};"></div>
                        </div>
                        <span class="font-bold text-sm w-12 text-right" style="color: ${color}">${res.score}/100</span>
                    </div>
                </div>
            `;
            ulInsp.appendChild(li);
        });

        // Set summary values
        sumCosmetic.textContent = '$' + baseRehabCost.toLocaleString();
        sumInspection.textContent = '+$' + inspectionExtraCost.toLocaleString();
        sumTotal.textContent = '$' + totalRehabCost.toLocaleString();

        lucide.createIcons();
    };

    // Main Chart logic
    const updateChart = (isInspection) => {
        const ctx = document.getElementById('main-chart').getContext('2d');
        const rehab = isInspection ? totalRehabCost : baseRehabCost;
        const profit = isInspection ? finalProfit : baseProfit;

        if (mainChartInst) {
            mainChartInst.destroy();
        }

        mainChartInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Financial Breakdown'],
                datasets: [
                    { label: 'Asking Price', data: [PurchasePrice], backgroundColor: '#94a3b8', borderRadius: 6, barPercentage: 0.9 },
                    { label: 'Rehab Cost', data: [rehab], backgroundColor: isInspection ? '#f97316' : '#ef4444', borderRadius: 6, barPercentage: 0.9 },
                    { label: 'Profit Spread', data: [profit], backgroundColor: '#38a169', borderRadius: 6, barPercentage: 0.9 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 15, font: { family: "'Inter', sans-serif", size: 12, weight: '600' } } },
                    tooltip: { enabled: false }, // Disable tooltip since we have datalabels
                    datalabels: {
                        color: '#ffffff',
                        anchor: 'center',
                        align: 'center',
                        font: {
                            family: "'Inter', sans-serif",
                            weight: 'bold',
                            size: 14
                        },
                        formatter: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 130000, // Adjust max for visual headroom
                        ticks: { display: false }, // Hide Y axis ticks since we have datalabels
                        grid: { display: false, drawBorder: false }, 
                        border: { display: false } 
                    },
                    x: { display: false, grid: { display: false }, border: { display: false } }
                },
                animation: { duration: 800, easing: 'easeOutQuart' }
            }
        });
    };

    const updateTopMetrics = (isInspection) => {
        const rehab = isInspection ? totalRehabCost : baseRehabCost;
        const profit = isInspection ? finalProfit : baseProfit;
        
        valRehab.textContent = '$' + rehab.toLocaleString();
        valProfit.textContent = '$' + profit.toLocaleString();

        if (isInspection) {
            chartStatusBadge.textContent = "Inspection Model (Adjusted)";
            chartStatusBadge.className = "text-xs font-medium text-orange-800 bg-orange-100 px-2 py-1 rounded";
            
            metricRehabBox.classList.add('bg-orange-50', 'border-orange-200');
            metricRehabBox.classList.remove('bg-white', 'border-slate-200');
            
            metricProfitBox.classList.remove('bg-green-50');
            metricProfitBox.classList.add('bg-emerald-100');
            setTimeout(() => {
                metricProfitBox.classList.add('bg-green-50');
                metricProfitBox.classList.remove('bg-emerald-100');
            }, 500);
        } else {
            chartStatusBadge.textContent = "First Glance Model";
            chartStatusBadge.className = "text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded";

            metricRehabBox.classList.remove('bg-orange-50', 'border-orange-200');
            metricRehabBox.classList.add('bg-white', 'border-slate-200');
        }
        
        updateChart(isInspection);
    };

    // Tab Switching
    tabGlance.addEventListener('click', () => {
        tabGlance.className = "pb-4 border-b-4 border-primary text-primary font-bold text-xl transition-colors";
        tabInspection.className = "pb-4 border-b-4 border-transparent text-slate-500 font-medium text-xl hover:text-slate-800 transition-colors flex items-center";
        
        viewGlance.classList.remove('hidden');
        viewInspection.classList.add('hidden');
        
        updateTopMetrics(false);
    });

    tabInspection.addEventListener('click', () => {
        tabInspection.className = "pb-4 border-b-4 border-primary text-primary font-bold text-xl transition-colors flex items-center";
        tabGlance.className = "pb-4 border-b-4 border-transparent text-slate-500 font-medium text-xl hover:text-slate-800 transition-colors";
        
        viewInspection.classList.remove('hidden');
        viewGlance.classList.add('hidden');
        
        updateTopMetrics(true);
    });

    // Navigation Transitions
    btnDemo.addEventListener('click', () => {
        landingView.classList.add('opacity-0');
        
        setTimeout(() => {
            landingView.classList.add('hidden');
            loadingView.classList.remove('hidden');
            void loadingView.offsetWidth;
            loadingView.classList.remove('opacity-0');
            loadingView.classList.add('opacity-100');

            const loadingMessages = [
                "Evaluating photos and descriptions...",
                "Running neighborhood comps...",
                "Drafting baseline financials...",
                "Finalizing First Glance scope..."
            ];
            
            let msgIdx = 0;
            const msgInterval = setInterval(() => {
                msgIdx++;
                if(msgIdx < loadingMessages.length) {
                    loadingText.style.opacity = "0";
                    setTimeout(() => {
                        loadingText.textContent = loadingMessages[msgIdx];
                        loadingText.style.opacity = "1";
                    }, 150);
                }
            }, 600);

            setTimeout(() => {
                clearInterval(msgInterval);
                loadingView.classList.remove('opacity-100');
                loadingView.classList.add('opacity-0');
                
                setTimeout(() => {
                    loadingView.classList.add('hidden');
                    dashboardView.classList.remove('hidden');
                    void dashboardView.offsetWidth;
                    dashboardView.classList.remove('opacity-0');
                    dashboardView.classList.add('opacity-100');
                    
                    renderLists();
                    updateTopMetrics(false);
                }, 300);
            }, 2500);

        }, 500);
    });

    btnBack.addEventListener('click', () => {
        dashboardView.classList.remove('opacity-100');
        dashboardView.classList.add('opacity-0');
        
        setTimeout(() => {
            dashboardView.classList.add('hidden');
            
            // reset tabs state
            tabGlance.click();

            landingView.classList.remove('hidden');
            void landingView.offsetWidth;
            landingView.classList.remove('opacity-0');
            landingView.classList.add('opacity-100');
        }, 500);
    });

    navDealRadar.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Hide other views
        landingView.classList.add('hidden', 'opacity-0');
        landingView.classList.remove('opacity-100');
        dashboardView.classList.add('hidden', 'opacity-0');
        dashboardView.classList.remove('opacity-100');
        
        // Show Deal Radar View
        dealRadarView.classList.remove('hidden');
        void dealRadarView.offsetWidth;
        dealRadarView.classList.remove('opacity-0');
        dealRadarView.classList.add('opacity-100');
    });

    // Optional: Clicking the logo returns to landing
    const logoArea = document.querySelector('header .gap-2');
    if (logoArea) {
        logoArea.classList.add('cursor-pointer');
        logoArea.addEventListener('click', () => {
            dealRadarView.classList.add('hidden', 'opacity-0');
            dealRadarView.classList.remove('opacity-100');
            dashboardView.classList.add('hidden', 'opacity-0');
            dashboardView.classList.remove('opacity-100');
            
            landingView.classList.remove('hidden');
            void landingView.offsetWidth;
            landingView.classList.remove('opacity-0');
            landingView.classList.add('opacity-100');
        });
    }

    // Comps Data & Logic
    const compsData = [
        { address: "2604 Valdez St", image: "images/comp_1.png", distance: "0.2 mi", sqft: "1,210", beds: 3, baths: 2, price: "$280,000", match: "96% Match" },
        { address: "6009 Clovis St", image: "images/comp_2.png", distance: "0.1 mi", sqft: "1,180", beds: 3, baths: 2, price: "$272,500", match: "94% Match" },
        { address: "2707 Kemp St", image: "images/comp_3.png", distance: "0.3 mi", sqft: "1,240", beds: 3, baths: 1.5, price: "$265,000", match: "88% Match" }
    ];

    const compsList = document.getElementById('comps-list');
    compsData.forEach(comp => {
        const div = document.createElement('div');
        div.className = "w-64 md:w-72 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0 group hover:shadow-md transition-shadow";
        div.innerHTML = `
            <div class="h-40 w-full relative overflow-hidden">
                <img src="${comp.image}" alt="Comp Property" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                <div class="absolute top-2 right-2 bg-success text-white text-[10px] font-extrabold px-2 py-1 rounded shadow-sm">
                    ${comp.match}
                </div>
            </div>
            <div class="p-4">
                <h4 class="font-bold text-slate-800 text-lg mb-1">${comp.address}</h4>
                <div class="flex items-center text-xs text-slate-500 font-medium mb-4 gap-1">
                    <i data-lucide="navigation" class="w-3 h-3 text-primary"></i> ${comp.distance} from subject
                </div>
                
                <div class="grid grid-cols-2 gap-2 mb-4">
                    <div class="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                        <p class="text-[10px] text-slate-400 uppercase font-bold">SQFT</p>
                        <p class="font-semibold text-slate-700 text-sm">${comp.sqft}</p>
                    </div>
                    <div class="bg-slate-50 p-2 rounded border border-slate-100 text-center">
                        <p class="text-[10px] text-slate-400 uppercase font-bold">Beds/Baths</p>
                        <p class="font-semibold text-slate-700 text-sm">${comp.beds} / ${comp.baths}</p>
                    </div>
                </div>
                
                <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span class="text-xs font-bold text-slate-400 uppercase">Sold Price</span>
                    <span class="text-lg font-extrabold text-slate-800">${comp.price}</span>
                </div>
            </div>
        `;
        compsList.appendChild(div);
    });

    const btnCompsToggle = document.getElementById('btn-comps-toggle');
    const compsContent = document.getElementById('comps-content');
    const compsChevron = document.getElementById('comps-chevron');

    btnCompsToggle.addEventListener('click', () => {
        compsContent.classList.toggle('hidden');
        compsChevron.classList.toggle('rotate-180');
    });

    // Gallery Logic
    const subjectImages = [
        "images/subject main.webp",
        "images/subject 2.webp",
        "images/subject 3.webp",
        "images/subject 4.webp",
        "images/subject 5.webp",
        "images/subject 6.webp",
        "images/subject 7.webp",
        "images/subject 8.webp",
        "images/subject 9.webp",
        "images/subject 10.webp",
        "images/subjcet 11.webp",
        "images/subjcet 12.webp"
    ];
    let currentGalleryIndex = 0;

    // Initialize Thumbnails
    subjectImages.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${idx === 0 ? 'border-primary shadow-sm scale-100 opacity-100' : 'border-transparent hover:border-primary/50 opacity-70 hover:opacity-100'}`;
        thumb.innerHTML = `<img src="${src}" class="w-full h-full object-cover pointer-events-none">`;
        thumb.addEventListener('click', () => {
            currentGalleryIndex = idx;
            updateGallery();
        });
        thumbContainer.appendChild(thumb);
    });

    const updateGallery = () => {
        mainSubjectImg.src = subjectImages[currentGalleryIndex];
        // Update thumbnail borders visually
        Array.from(thumbContainer.children).forEach((thumb, idx) => {
            if(idx === currentGalleryIndex) {
                thumb.className = "aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all border-primary shadow-sm scale-100 opacity-100";
            } else {
                thumb.className = "aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all border-transparent hover:border-primary/50 opacity-70 hover:opacity-100";
            }
        });
    };

    const openLightbox = () => {
        lightboxImg.src = subjectImages[currentGalleryIndex];
        lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${subjectImages.length}`;
        lightboxModal.classList.remove('hidden');
        void lightboxModal.offsetWidth; // trigger reflow
        lightboxModal.classList.remove('opacity-0');
        // Initialize lucide icons for the new modal if needed
        lucide.createIcons();
    };

    const closeLightbox = () => {
        lightboxModal.classList.add('opacity-0');
        setTimeout(() => lightboxModal.classList.add('hidden'), 300);
    };

    const nextLightbox = () => {
        currentGalleryIndex = (currentGalleryIndex + 1) % subjectImages.length;
        lightboxImg.src = subjectImages[currentGalleryIndex];
        lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${subjectImages.length}`;
        updateGallery();
    };

    const prevLightbox = () => {
        currentGalleryIndex = (currentGalleryIndex - 1 + subjectImages.length) % subjectImages.length;
        lightboxImg.src = subjectImages[currentGalleryIndex];
        lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${subjectImages.length}`;
        updateGallery();
    };

    mainImgContainer.addEventListener('click', openLightbox);
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextLightbox(); });
    lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevLightbox(); });
    
    // Close on background click
    lightboxModal.addEventListener('click', (e) => {
        if(e.target === lightboxModal || (e.target.parentElement === lightboxModal && e.target.tagName !== 'BUTTON')) {
            closeLightbox();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('hidden')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextLightbox();
            if (e.key === 'ArrowLeft') prevLightbox();
        }
    });

    // Initial load setup (don't render chart until visible to avoid size issues)
    renderLists();
});
