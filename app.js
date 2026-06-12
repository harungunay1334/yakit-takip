// State Management
const STATE_KEY = 'yakit_takip_logs';
let state = {
    logs: []
};

// Chart references
let monthlyCostChartInstance = null;
let priceTrendChartInstance = null;

let selectedMonthYear = 'current';

// DOM Elements
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    tabContents: document.querySelectorAll('.tab-content'),
    globalVehicleFilter: document.getElementById('global-vehicle-filter'),
    pageTitle: document.getElementById('page-title'),
    pageSubtitle: document.getElementById('page-subtitle'),
    
    // KPI Cards
    valTotalDistance: document.getElementById('val-total-distance'),
    valTotalCost: document.getElementById('val-total-cost'),
    valAvgConsumption: document.getElementById('val-avg-consumption'),
    valCostPerKm: document.getElementById('val-cost-per-km'),
    monthSelector: document.getElementById('month-selector'),
    
    // Car Breakdown
    carBreakdownSection: document.getElementById('car-breakdown-section'),
    carGasTotal: document.getElementById('car-gas-total'),
    carGasProgress: document.getElementById('car-gas-progress'),
    carLpgTotal: document.getElementById('car-lpg-total'),
    carLpgProgress: document.getElementById('car-lpg-progress'),
    
    // Form Elements
    logForm: document.getElementById('fuel-log-form'),
    logIdInput: document.getElementById('log-id'),
    formVehicle: document.getElementById('form-vehicle'),
    formFuelType: document.getElementById('form-fuel-type'),
    formDate: document.getElementById('form-date'),
    formOdometer: document.getElementById('form-odometer'),
    lastOdometerVal: document.getElementById('last-odometer-val'),
    formAmount: document.getElementById('form-amount'),
    formUnitPrice: document.getElementById('form-unit-price'),
    formTotalPrice: document.getElementById('form-total-price'),
    formFullTank: document.getElementById('form-full-tank'),
    formNotes: document.getElementById('form-notes'),
    btnCancelEdit: document.getElementById('btn-cancel-edit'),
    submitBtnText: document.getElementById('submit-btn-text'),
    
    // History Table
    historyTableBody: document.getElementById('history-table-body'),
    historyEmptyState: document.getElementById('history-empty-state'),
    filterVehicle: document.getElementById('filter-vehicle'),
    filterFuelType: document.getElementById('filter-fuel-type'),
    
    // Settings & Backup
    btnExport: document.getElementById('btn-export'),
    btnImport: document.getElementById('btn-import'),
    importFileInput: document.getElementById('import-file-input'),
    fileNameText: document.getElementById('file-name-text'),
    btnClearData: document.getElementById('btn-clear-data'),
    btnDemoData: document.getElementById('btn-demo-data'),
    toastContainer: document.getElementById('toast-container')
};

// Realistic Demo Data
const DEMO_DATA = [
    // Motosiklet (Benzin) - April to June 2026
    { id: 'm1', vehicle: 'motorcycle', fuelType: 'gasoline', date: '2026-04-10', odometer: 12000, amount: 12.5, unitPrice: 42.10, totalPrice: 526.25, fullTank: true, notes: 'İlk kayıt' },
    { id: 'm2', vehicle: 'motorcycle', fuelType: 'gasoline', date: '2026-04-28', odometer: 12350, amount: 11.2, unitPrice: 42.80, totalPrice: 479.36, fullTank: true, notes: 'Opet' },
    { id: 'm3', vehicle: 'motorcycle', fuelType: 'gasoline', date: '2026-05-15', odometer: 12710, amount: 11.8, unitPrice: 43.15, totalPrice: 509.17, fullTank: true, notes: 'Shell Nitro' },
    { id: 'm4', vehicle: 'motorcycle', fuelType: 'gasoline', date: '2026-06-01', odometer: 13080, amount: 12.1, unitPrice: 43.50, totalPrice: 526.35, fullTank: true, notes: 'Petrol Ofisi' },
    { id: 'm5', vehicle: 'motorcycle', fuelType: 'gasoline', date: '2026-06-10', odometer: 13420, amount: 10.9, unitPrice: 43.90, totalPrice: 478.51, fullTank: true, notes: 'Şehir içi kullanım' },

    // Otomobil (Benzin & LPG) - April to June 2026
    // LPG logs
    { id: 'c1', vehicle: 'car', fuelType: 'lpg', date: '2026-04-05', odometer: 84000, amount: 32.0, unitPrice: 20.10, totalPrice: 643.20, fullTank: true, notes: 'BP Otogaz' },
    { id: 'c2', vehicle: 'car', fuelType: 'lpg', date: '2026-04-18', odometer: 84410, amount: 33.5, unitPrice: 20.30, totalPrice: 680.05, fullTank: true, notes: 'Aygaz' },
    { id: 'c3', vehicle: 'car', fuelType: 'lpg', date: '2026-05-02', odometer: 84830, amount: 31.8, unitPrice: 20.80, totalPrice: 661.44, fullTank: true, notes: 'Milangaz' },
    { id: 'c4', vehicle: 'car', fuelType: 'lpg', date: '2026-05-20', odometer: 85250, amount: 34.2, unitPrice: 21.00, totalPrice: 718.20, fullTank: true, notes: 'Aygaz' },
    { id: 'c5', vehicle: 'car', fuelType: 'lpg', date: '2026-06-03', odometer: 85680, amount: 32.9, unitPrice: 21.20, totalPrice: 697.48, fullTank: true, notes: 'BP Otogaz' },
    // Gasoline logs for starting/heating
    { id: 'c6', vehicle: 'car', fuelType: 'gasoline', date: '2026-04-06', odometer: 84010, amount: 15.0, unitPrice: 42.10, totalPrice: 631.50, fullTank: true, notes: 'İlk benzin fulleme' },
    { id: 'c7', vehicle: 'car', fuelType: 'lpg', date: '2026-06-11', odometer: 86100, amount: 33.1, unitPrice: 21.50, totalPrice: 711.65, fullTank: true, notes: 'Son lpg dolumu' },
    { id: 'c8', vehicle: 'car', fuelType: 'gasoline', date: '2026-05-25', odometer: 85500, amount: 12.0, unitPrice: 43.10, totalPrice: 517.20, fullTank: true, notes: 'İkinci benzin fulleme' },
];

// App Initialization
const app = {
    init: function() {
        this.loadState();
        this.bindEvents();
        this.setDefaultDate();
        this.switchTab('dashboard');
        this.updateDashboard();
        this.renderHistoryTable();
        lucide.createIcons();
    },

    loadState: function() {
        const stored = localStorage.getItem(STATE_KEY);
        if (stored) {
            try {
                state = JSON.parse(stored);
            } catch (e) {
                console.error("State load error:", e);
                state = { logs: [] };
            }
        } else {
            state = { logs: [] };
        }
    },

    saveState: function() {
        localStorage.setItem(STATE_KEY, JSON.stringify(state));
    },

    bindEvents: function() {
        // Tab switching
        elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Global vehicle filter
        elements.globalVehicleFilter.addEventListener('change', () => {
            this.updateDashboard();
        });

        // Month selector filter
        elements.monthSelector.addEventListener('change', (e) => {
            selectedMonthYear = e.target.value;
            this.updateDashboard();
        });

        // Form: Vehicle change dependencies
        elements.formVehicle.addEventListener('change', (e) => {
            const vehicle = e.target.value;
            this.handleVehicleChange(vehicle);
            this.updateLastOdometerHelp(vehicle);
        });

        // Form: Auto calculations
        const recalculateTotal = () => {
            const amount = parseFloat(elements.formAmount.value);
            const unitPrice = parseFloat(elements.formUnitPrice.value);
            if (!isNaN(amount) && !isNaN(unitPrice)) {
                elements.formTotalPrice.value = (amount * unitPrice).toFixed(2);
            }
        };

        const recalculateAmount = () => {
            const total = parseFloat(elements.formTotalPrice.value);
            const unitPrice = parseFloat(elements.formUnitPrice.value);
            if (!isNaN(total) && !isNaN(unitPrice) && unitPrice > 0) {
                elements.formAmount.value = (total / unitPrice).toFixed(2);
            }
        };

        elements.formAmount.addEventListener('input', recalculateTotal);
        elements.formUnitPrice.addEventListener('input', recalculateTotal);
        elements.formTotalPrice.addEventListener('input', recalculateAmount);

        // Form: Submit handler
        elements.logForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Form: Cancel Edit
        elements.btnCancelEdit.addEventListener('click', () => {
            this.resetForm();
            this.switchTab('history');
        });

        // History: Filters
        elements.filterVehicle.addEventListener('change', () => this.renderHistoryTable());
        elements.filterFuelType.addEventListener('change', () => this.renderHistoryTable());

        // Settings actions
        elements.btnExport.addEventListener('click', () => this.exportData());
        
        elements.importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                elements.fileNameText.textContent = file.name;
                elements.btnImport.removeAttribute('disabled');
            } else {
                elements.fileNameText.textContent = "Dosya seçilmedi";
                elements.btnImport.setAttribute('disabled', 'true');
            }
        });

        elements.btnImport.addEventListener('click', () => this.importData());
        elements.btnClearData.addEventListener('click', () => this.clearAllData());
        elements.btnDemoData.addEventListener('click', () => this.loadDemoData());

        // File trigger helper styling
        const triggerBtn = document.querySelector('.btn-file-trigger');
        if (triggerBtn) {
            triggerBtn.addEventListener('click', () => elements.importFileInput.click());
        }
    },

    switchTab: function(tabId) {
        elements.navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        elements.tabContents.forEach(content => {
            if (content.id === `tab-${tabId}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        // Page title customization
        if (tabId === 'dashboard') {
            elements.pageTitle.textContent = "Gösterge Paneli";
            elements.pageSubtitle.textContent = "Yakıt tüketimi ve maliyet analizleriniz";
            elements.globalVehicleFilter.parentElement.style.display = 'block';
            this.updateDashboard();
        } else if (tabId === 'add-log') {
            elements.pageTitle.textContent = elements.logIdInput.value ? "Kaydı Düzenle" : "Yeni Kayıt Ekle";
            elements.pageSubtitle.textContent = "Yakıt dolum verilerinizi giriniz";
            elements.globalVehicleFilter.parentElement.style.display = 'none';
            this.updateLastOdometerHelp(elements.formVehicle.value);
        } else if (tabId === 'history') {
            elements.pageTitle.textContent = "Geçmiş Kayıtlar";
            elements.pageSubtitle.textContent = "Tüm yakıt alım geçmişiniz";
            elements.globalVehicleFilter.parentElement.style.display = 'none';
            this.renderHistoryTable();
        } else if (tabId === 'settings') {
            elements.pageTitle.textContent = "Ayarlar & Yedek";
            elements.pageSubtitle.textContent = "Verilerinizi yönetin veya yedekleyin";
            elements.globalVehicleFilter.parentElement.style.display = 'none';
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setDefaultDate: function() {
        const today = new Date().toISOString().split('T')[0];
        elements.formDate.value = today;
    },

    handleVehicleChange: function(vehicle) {
        const fuelSelect = elements.formFuelType;
        fuelSelect.innerHTML = '';

        if (vehicle === 'motorcycle') {
            // Motorcycle is gasoline only
            const opt = document.createElement('option');
            opt.value = 'gasoline';
            opt.textContent = 'Benzin';
            fuelSelect.appendChild(opt);
            fuelSelect.removeAttribute('disabled');
        } else if (vehicle === 'car') {
            // Car is Gasoline or LPG
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Yakıt türü seçin...';
            placeholder.disabled = true;
            placeholder.selected = true;
            
            const optGas = document.createElement('option');
            optGas.value = 'gasoline';
            optGas.textContent = 'Benzin';

            const optLpg = document.createElement('option');
            optLpg.value = 'lpg';
            optLpg.textContent = 'LPG';

            fuelSelect.appendChild(placeholder);
            fuelSelect.appendChild(optGas);
            fuelSelect.appendChild(optLpg);
            fuelSelect.removeAttribute('disabled');
        } else {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Önce aracı seçin...';
            placeholder.disabled = true;
            placeholder.selected = true;
            fuelSelect.appendChild(placeholder);
            fuelSelect.setAttribute('disabled', 'true');
        }
    },

    updateLastOdometerHelp: function(vehicle) {
        if (!vehicle) {
            elements.lastOdometerVal.textContent = '-';
            return;
        }

        const vehicleLogs = state.logs
            .filter(l => l.vehicle === vehicle)
            .sort((a, b) => b.odometer - a.odometer); // Descending

        if (vehicleLogs.length > 0) {
            elements.lastOdometerVal.textContent = vehicleLogs[0].odometer + " km";
        } else {
            elements.lastOdometerVal.textContent = "Kaydedilmemiş";
        }
    },

    resetForm: function() {
        elements.logForm.reset();
        elements.logIdInput.value = '';
        elements.submitBtnText.textContent = "Kaydet";
        elements.btnCancelEdit.classList.add('style-hidden');
        this.setDefaultDate();
        this.handleVehicleChange('');
        elements.lastOdometerVal.textContent = '-';
    },

    handleFormSubmit: function() {
        const id = elements.logIdInput.value;
        const vehicle = elements.formVehicle.value;
        const fuelType = elements.formFuelType.value;
        const date = elements.formDate.value;
        const odometer = parseInt(elements.formOdometer.value);
        const amount = parseFloat(elements.formAmount.value);
        const unitPrice = parseFloat(elements.formUnitPrice.value);
        const totalPrice = parseFloat(elements.formTotalPrice.value);
        const fullTank = elements.formFullTank.checked;
        const notes = elements.formNotes.value.trim();

        // Basic validation
        if (!vehicle || !fuelType || isNaN(odometer) || isNaN(amount) || isNaN(unitPrice) || isNaN(totalPrice)) {
            this.showToast('Lütfen tüm zorunlu alanları doldurun.', 'error');
            return;
        }

        // Odometer check: warn if it's lower than the previous odometer for the same vehicle
        const sameVehicleLogs = state.logs.filter(l => l.vehicle === vehicle && l.id !== id);
        if (sameVehicleLogs.length > 0) {
            const maxOdometer = Math.max(...sameVehicleLogs.map(l => l.odometer));
            if (odometer < maxOdometer) {
                const proceed = confirm(`Girdiğiniz kilometre (${odometer} km), bu araca ait en yüksek kilometreden (${maxOdometer} km) daha düşüktür. Yine de kaydetmek istiyor musunuz?`);
                if (!proceed) return;
            }
        }

        const logData = {
            id: id || 'id_' + Date.now(),
            vehicle,
            fuelType,
            date,
            odometer,
            amount,
            unitPrice,
            totalPrice,
            fullTank,
            notes
        };

        if (id) {
            // Update
            const index = state.logs.findIndex(l => l.id === id);
            if (index !== -1) {
                state.logs[index] = logData;
                this.showToast('Kayıt başarıyla güncellendi.', 'success');
            }
        } else {
            // Add
            state.logs.push(logData);
            this.showToast('Yeni yakıt kaydı eklendi.', 'success');
        }

        // Sort state.logs by date ascending
        state.logs.sort((a, b) => new Date(a.date) - new Date(b.date));

        this.saveState();
        this.resetForm();
        this.switchTab('history');
    },

    editLog: function(id) {
        const log = state.logs.find(l => l.id === id);
        if (!log) return;

        // Switch to add log tab and populate
        this.switchTab('add-log');
        
        elements.logIdInput.value = log.id;
        elements.formVehicle.value = log.vehicle;
        
        // Re-populate fuel type select based on vehicle
        this.handleVehicleChange(log.vehicle);
        elements.formFuelType.value = log.fuelType;
        
        elements.formDate.value = log.date;
        elements.formOdometer.value = log.odometer;
        elements.formAmount.value = log.amount;
        elements.formUnitPrice.value = log.unitPrice;
        elements.formTotalPrice.value = log.totalPrice;
        elements.formFullTank.checked = log.fullTank;
        elements.formNotes.value = log.notes || '';

        elements.submitBtnText.textContent = "Güncelle";
        elements.btnCancelEdit.classList.remove('style-hidden');
        
        this.updateLastOdometerHelp(log.vehicle);
    },

    deleteLog: function(id) {
        if (confirm('Bu yakıt kaydını silmek istediğinizden emin misiniz?')) {
            state.logs = state.logs.filter(l => l.id !== id);
            this.saveState();
            this.renderHistoryTable();
            this.showToast('Kayıt başarıyla silindi.', 'success');
        }
    },

    // KPI and Stats calculations
    updateDashboard: function() {
        const filter = elements.globalVehicleFilter.value;
        let filteredLogs = [];

        if (filter === 'all') {
            filteredLogs = [...state.logs];
            elements.carBreakdownSection.style.display = 'block';
        } else {
            filteredLogs = state.logs.filter(l => l.vehicle === filter);
            if (filter === 'car') {
                elements.carBreakdownSection.style.display = 'block';
            } else {
                elements.carBreakdownSection.style.display = 'none';
            }
        }

        // Sort by odometer ascending
        filteredLogs.sort((a, b) => a.odometer - b.odometer);

        // 1. Calculate Total Distance
        let totalDistance = 0;
        if (filter === 'all') {
            // Sum distances of each vehicle separately
            const motorLogs = state.logs.filter(l => l.vehicle === 'motorcycle').sort((a, b) => a.odometer - b.odometer);
            const carLogs = state.logs.filter(l => l.vehicle === 'car').sort((a, b) => a.odometer - b.odometer);
            
            const distMotor = motorLogs.length > 1 ? (motorLogs[motorLogs.length - 1].odometer - motorLogs[0].odometer) : 0;
            const distCar = carLogs.length > 1 ? (carLogs[carLogs.length - 1].odometer - carLogs[0].odometer) : 0;
            totalDistance = distMotor + distCar;
        } else {
            totalDistance = filteredLogs.length > 1 ? (filteredLogs[filteredLogs.length - 1].odometer - filteredLogs[0].odometer) : 0;
        }
        elements.valTotalDistance.textContent = totalDistance > 0 ? `${totalDistance.toLocaleString('tr-TR')} km` : '0 km';

        // 2. Calculate Total Spent (Filtered by Selected Month - Defaulting to Latest Month with Data)
        const availableMonths = [...new Set(state.logs.map(l => {
            if (!l.date) return '';
            return l.date.substring(0, 7); // 'YYYY-MM'
        }))].filter(m => m !== '').sort((a, b) => b.localeCompare(a));

        const today = new Date();
        const currentCalMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        if (selectedMonthYear === 'current' || !availableMonths.includes(selectedMonthYear)) {
            if (availableMonths.length > 0) {
                selectedMonthYear = availableMonths[0];
            } else {
                selectedMonthYear = currentCalMonth;
            }
        }

        // Populate Month Selector Dropdown
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        let optionsHtml = '';
        if (availableMonths.length === 0) {
            const [yr, mo] = currentCalMonth.split('-');
            const nameText = `${monthNames[parseInt(mo) - 1]} ${yr}`;
            optionsHtml = `<option value="${currentCalMonth}">${nameText}</option>`;
        } else {
            availableMonths.forEach(m => {
                const [yr, mo] = m.split('-');
                const nameText = `${monthNames[parseInt(mo) - 1]} ${yr}`;
                optionsHtml += `<option value="${m}">${nameText}</option>`;
            });
        }
        elements.monthSelector.innerHTML = optionsHtml;
        elements.monthSelector.value = selectedMonthYear;

        // Filter logs by selected month-year
        const currentMonthLogs = filteredLogs.filter(l => l.date && l.date.startsWith(selectedMonthYear));
        const totalCost = currentMonthLogs.reduce((sum, l) => sum + l.totalPrice, 0);
        
        let totalCostHtml = '';
        let trendCostText = 'Seçili ayın toplamı';

        // Calculate current month spent details for breakdown
        const currentMonthAllLogs = state.logs.filter(l => l.date && l.date.startsWith(selectedMonthYear));

        const motorSpent = currentMonthAllLogs.filter(l => l.vehicle === 'motorcycle').reduce((sum, l) => sum + l.totalPrice, 0);
        const carGasSpent = currentMonthAllLogs.filter(l => l.vehicle === 'car' && l.fuelType === 'gasoline').reduce((sum, l) => sum + l.totalPrice, 0);
        const carLpgSpent = currentMonthAllLogs.filter(l => l.vehicle === 'car' && l.fuelType === 'lpg').reduce((sum, l) => sum + l.totalPrice, 0);

        if (filter === 'all') {
            totalCostHtml = `
                <div style="font-size: 1.35rem; font-weight: 700; margin-bottom: 6px;">${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>
                <div style="font-size: 0.85rem; line-height: 1.4; display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--border-color); padding-top: 4px; margin-top: 4px;">
                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Motor:</span> <span style="font-weight:600; color: var(--motorcycle-color);">${motorSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span></div>
                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Oto LPG:</span> <span style="font-weight:600; color: var(--lpg-color);">${carLpgSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span></div>
                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Oto Benz:</span> <span style="font-weight:600; color: var(--gasoline-color);">${carGasSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span></div>
                </div>
            `;
        } else if (filter === 'motorcycle') {
            totalCostHtml = `
                <div style="font-size: 1.35rem; font-weight: 700;">${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>
            `;
        } else if (filter === 'car') {
            totalCostHtml = `
                <div style="font-size: 1.35rem; font-weight: 700; margin-bottom: 6px;">${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>
                <div style="font-size: 0.85rem; line-height: 1.4; display: flex; flex-direction: column; gap: 2px; border-top: 1px solid var(--border-color); padding-top: 4px; margin-top: 4px;">
                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>LPG:</span> <span style="font-weight:600; color: var(--lpg-color);">${carLpgSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span></div>
                    <div style="display:flex; justify-content:space-between; gap:10px;"><span>Benzin:</span> <span style="font-weight:600; color: var(--gasoline-color);">${carGasSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span></div>
                </div>
            `;
        }

        elements.valTotalCost.innerHTML = totalCostHtml;
        document.getElementById('trend-cost').textContent = trendCostText;

        // 3. Cost per KM
        let costPerKm = 0;
        let consumedCost = 0;
        let totalDistanceForCost = 0;

        if (filter === 'all') {
            // Sum for each vehicle
            ['motorcycle', 'car'].forEach(v => {
                const vLogs = state.logs.filter(l => l.vehicle === v).sort((a, b) => a.odometer - b.odometer);
                if (vLogs.length > 1) {
                    const dist = vLogs[vLogs.length - 1].odometer - vLogs[0].odometer;
                    if (dist > 0) {
                        totalDistanceForCost += dist;
                        if (v === 'motorcycle') {
                            consumedCost += vLogs.slice(1).reduce((sum, l) => sum + l.totalPrice, 0);
                        } else {
                            ['gasoline', 'lpg'].forEach(ft => {
                                const ftLogs = vLogs.filter(l => l.fuelType === ft).sort((a, b) => a.odometer - b.odometer);
                                if (ftLogs.length > 1) {
                                    consumedCost += ftLogs.slice(1).reduce((sum, l) => sum + l.totalPrice, 0);
                                }
                            });
                        }
                    }
                }
            });
        } else if (filter === 'motorcycle') {
            const vLogs = filteredLogs.sort((a, b) => a.odometer - b.odometer);
            if (vLogs.length > 1) {
                totalDistanceForCost = vLogs[vLogs.length - 1].odometer - vLogs[0].odometer;
                consumedCost = vLogs.slice(1).reduce((sum, l) => sum + l.totalPrice, 0);
            }
        } else if (filter === 'car') {
            const vLogs = filteredLogs.sort((a, b) => a.odometer - b.odometer);
            if (vLogs.length > 1) {
                totalDistanceForCost = vLogs[vLogs.length - 1].odometer - vLogs[0].odometer;
                ['gasoline', 'lpg'].forEach(ft => {
                    const ftLogs = vLogs.filter(l => l.fuelType === ft).sort((a, b) => a.odometer - b.odometer);
                    if (ftLogs.length > 1) {
                        consumedCost += ftLogs.slice(1).reduce((sum, l) => sum + l.totalPrice, 0);
                    }
                });
            }
        }

        if (totalDistanceForCost > 0) {
            costPerKm = consumedCost / totalDistanceForCost;
        }
        elements.valCostPerKm.textContent = costPerKm > 0 ? `${costPerKm.toFixed(2)} TL/km` : '0.00 TL/km';

        // 4. Average Fuel Consumption (L/100km)
        // Calculated based on full tank intervals, incorporating intermediate partial fill-ups
        let avgConsumptionHtml = '';
        let trendText = '';

        // Calculate for Motorcycle (Gasoline only)
        const motorLogs = state.logs.filter(l => l.vehicle === 'motorcycle').sort((a, b) => a.odometer - b.odometer);
        let motorDist = 0, motorFuel = 0;
        let lastFullOdometerMotor = -1;
        let tempFuelMotor = 0;
        for (let i = 0; i < motorLogs.length; i++) {
            const l = motorLogs[i];
            if (lastFullOdometerMotor === -1) {
                if (l.fullTank) {
                    lastFullOdometerMotor = l.odometer;
                    tempFuelMotor = 0;
                }
            } else {
                tempFuelMotor += l.amount;
                if (l.fullTank) {
                    const dist = l.odometer - lastFullOdometerMotor;
                    if (dist > 0) {
                        motorDist += dist;
                        motorFuel += tempFuelMotor;
                    }
                    lastFullOdometerMotor = l.odometer;
                    tempFuelMotor = 0;
                }
            }
        }
        const avgMotor = motorDist > 0 ? (motorFuel / motorDist) * 100 : 0;

        // Calculate for Car LPG
        const carLpgLogs = state.logs.filter(l => l.vehicle === 'car' && l.fuelType === 'lpg').sort((a, b) => a.odometer - b.odometer);
        let carLpgDist = 0, carLpgFuel = 0;
        let lastFullOdometerLpg = -1;
        let tempFuelLpg = 0;
        for (let i = 0; i < carLpgLogs.length; i++) {
            const l = carLpgLogs[i];
            if (lastFullOdometerLpg === -1) {
                if (l.fullTank) {
                    lastFullOdometerLpg = l.odometer;
                    tempFuelLpg = 0;
                }
            } else {
                tempFuelLpg += l.amount;
                if (l.fullTank) {
                    const dist = l.odometer - lastFullOdometerLpg;
                    if (dist > 0) {
                        carLpgDist += dist;
                        carLpgFuel += tempFuelLpg;
                    }
                    lastFullOdometerLpg = l.odometer;
                    tempFuelLpg = 0;
                }
            }
        }
        const avgCarLpg = carLpgDist > 0 ? (carLpgFuel / carLpgDist) * 100 : 0;

        // Calculate for Car Gasoline
        const carGasLogs = state.logs.filter(l => l.vehicle === 'car' && l.fuelType === 'gasoline').sort((a, b) => a.odometer - b.odometer);
        let carGasDist = 0, carGasFuel = 0;
        let lastFullOdometerGas = -1;
        let tempFuelGas = 0;
        for (let i = 0; i < carGasLogs.length; i++) {
            const l = carGasLogs[i];
            if (lastFullOdometerGas === -1) {
                if (l.fullTank) {
                    lastFullOdometerGas = l.odometer;
                    tempFuelGas = 0;
                }
            } else {
                tempFuelGas += l.amount;
                if (l.fullTank) {
                    const dist = l.odometer - lastFullOdometerGas;
                    if (dist > 0) {
                        carGasDist += dist;
                        carGasFuel += tempFuelGas;
                    }
                    lastFullOdometerGas = l.odometer;
                    tempFuelGas = 0;
                }
            }
        }
        const avgCarGas = carGasDist > 0 ? (carGasFuel / carGasDist) * 100 : 0;

        if (filter === 'all') {
            avgConsumptionHtml = `
                <div style="font-size: 0.95rem; line-height: 1.4; display: flex; flex-direction: column; gap: 4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="badge badge-motorcycle" style="padding: 2px 6px;">Motor</span> 
                        <span style="font-weight:600;">${avgMotor > 0 ? avgMotor.toFixed(1) + ' L/100' : 'Veri Yok'}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="badge badge-lpg" style="padding: 2px 6px;">Oto LPG</span> 
                        <span style="font-weight:600;">${avgCarLpg > 0 ? avgCarLpg.toFixed(1) + ' L/100' : 'Veri Yok'}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="badge badge-gasoline" style="padding: 2px 6px;">Oto Benz</span> 
                        <span style="font-weight:600;">${avgCarGas > 0 ? avgCarGas.toFixed(1) + ' L/100' : 'Veri Yok'}</span>
                    </div>
                </div>
            `;
            trendText = 'Araç bazlı ortalama tüketimler';
        } else if (filter === 'motorcycle') {
            avgConsumptionHtml = avgMotor > 0 ? `${avgMotor.toFixed(2)} L/100km` : 'Yetersiz veri';
            trendText = motorDist > 0 ? `Toplam ${motorDist} km'lik ölçüm` : 'En az 2 fulleme kaydı gerekir';
        } else if (filter === 'car') {
            avgConsumptionHtml = `
                <div style="font-size: 1.05rem; line-height: 1.4; display: flex; flex-direction: column; gap: 6px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="badge badge-lpg" style="padding: 2px 6px;">LPG</span> 
                        <span style="font-weight:600; color:var(--lpg-color);">${avgCarLpg > 0 ? avgCarLpg.toFixed(2) + ' L/100km' : 'Veri Yok'}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span class="badge badge-gasoline" style="padding: 2px 6px;">Benzin</span> 
                        <span style="font-weight:600; color:var(--gasoline-color);">${avgCarGas > 0 ? avgCarGas.toFixed(2) + ' L/100km' : 'Veri Yok'}</span>
                    </div>
                </div>
            `;
            let lpgOdoMsg = carLpgDist > 0 ? `LPG: ${carLpgDist} km` : 'LPG veri yok';
            let gasOdoMsg = carGasDist > 0 ? `Benzin: ${carGasDist} km` : 'Benzin veri yok';
            trendText = `${lpgOdoMsg} | ${gasOdoMsg}`;
        }

        elements.valAvgConsumption.innerHTML = avgConsumptionHtml;
        const trendEl = document.getElementById('trend-consumption');
        if (filter !== 'all') {
            trendEl.textContent = trendText;
        } else {
            trendEl.textContent = trendText;
        }

        // 5. Update Car Breakdown if visible
        if (elements.carBreakdownSection.style.display !== 'none') {
            const carLogs = state.logs.filter(l => l.vehicle === 'car');
            const carGasSpent = carLogs.filter(l => l.fuelType === 'gasoline').reduce((sum, l) => sum + l.totalPrice, 0);
            const carGasLiters = carLogs.filter(l => l.fuelType === 'gasoline').reduce((sum, l) => sum + l.amount, 0);
            const carLpgSpent = carLogs.filter(l => l.fuelType === 'lpg').reduce((sum, l) => sum + l.totalPrice, 0);
            const carLpgLiters = carLogs.filter(l => l.fuelType === 'lpg').reduce((sum, l) => sum + l.amount, 0);
            const totalCarSpent = carGasSpent + carLpgSpent;

            elements.carGasTotal.textContent = `${carGasSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL (${carGasLiters.toFixed(1)} L)`;
            elements.carLpgTotal.textContent = `${carLpgSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL (${carLpgLiters.toFixed(1)} L)`;

            if (totalCarSpent > 0) {
                const gasPercent = (carGasSpent / totalCarSpent) * 100;
                const lpgPercent = (carLpgSpent / totalCarSpent) * 100;
                elements.carGasProgress.style.width = `${gasPercent}%`;
                elements.carLpgProgress.style.width = `${lpgPercent}%`;
            } else {
                elements.carGasProgress.style.width = `0%`;
                elements.carLpgProgress.style.width = `0%`;
            }
        }

        // 6. Refresh/Draw Charts
        this.drawMonthlyCostChart(filter);
        this.drawPriceTrendChart(filter);
    },

    // Render historical records table
    renderHistoryTable: function() {
        const vehicleFilter = elements.filterVehicle.value;
        const fuelFilter = elements.filterFuelType.value;

        let filteredLogs = [...state.logs];

        if (vehicleFilter !== 'all') {
            filteredLogs = filteredLogs.filter(l => l.vehicle === vehicleFilter);
        }

        if (fuelFilter !== 'all') {
            filteredLogs = filteredLogs.filter(l => l.fuelType === fuelFilter);
        }

        // Sort by date descending (newest first) for history list
        filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        elements.historyTableBody.innerHTML = '';

        if (filteredLogs.length === 0) {
            elements.historyEmptyState.style.display = 'flex';
            document.querySelector('.table-responsive').style.display = 'none';
            return;
        }

        elements.historyEmptyState.style.display = 'none';
        document.querySelector('.table-responsive').style.display = 'block';

        filteredLogs.forEach(log => {
            const tr = document.createElement('tr');
            
            const formattedDate = new Date(log.date).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const vehicleBadge = log.vehicle === 'motorcycle' 
                ? '<span class="badge badge-motorcycle">Motosiklet</span>' 
                : '<span class="badge badge-car">Otomobil</span>';
            
            const fuelBadge = log.fuelType === 'gasoline' 
                ? '<span class="badge badge-gasoline">Benzin</span>' 
                : '<span class="badge badge-lpg">LPG</span>';

            const fullTankBadge = log.fullTank 
                ? '<span class="badge badge-gasoline"><i data-lucide="check" style="width:12px;height:12px;margin-right:2px;"></i> Full</span>'
                : '<span class="badge badge-lpg">Yarım</span>';

            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${vehicleBadge}</td>
                <td>${fuelBadge}</td>
                <td>${log.odometer.toLocaleString('tr-TR')} km</td>
                <td>${log.amount.toFixed(2)} L</td>
                <td>${log.unitPrice.toFixed(2)} TL/L</td>
                <td style="font-weight: 600;">${log.totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</td>
                <td>${fullTankBadge}</td>
                <td class="text-muted" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;" title="${log.notes || ''}">${log.notes || '-'}</td>
                <td class="actions-cell">
                    <button class="btn-icon" onclick="app.editLog('${log.id}')" title="Düzenle">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-icon delete" onclick="app.deleteLog('${log.id}')" title="Sil">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            `;
            elements.historyTableBody.appendChild(tr);
        });

        // Re-trigger icon rendering
        lucide.createIcons();
    },

    // Chart.js Implementations
    drawMonthlyCostChart: function(vehicleFilter) {
        const canvas = document.getElementById('monthlyCostChart');
        if (!canvas) return;

        // Group logs by month
        // Form: 'YYYY-MM'
        const monthlyData = {};
        
        state.logs.forEach(log => {
            const date = new Date(log.date);
            const monthKey = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { motorcycle: 0, carGasoline: 0, carLpg: 0 };
            }

            if (log.vehicle === 'motorcycle') {
                monthlyData[monthKey].motorcycle += log.totalPrice;
            } else if (log.vehicle === 'car') {
                if (log.fuelType === 'gasoline') {
                    monthlyData[monthKey].carGasoline += log.totalPrice;
                } else {
                    monthlyData[monthKey].carLpg += log.totalPrice;
                }
            }
        });

        const labels = Object.keys(monthlyData);
        const motorcycleSpent = labels.map(l => monthlyData[l].motorcycle);
        const carGasSpent = labels.map(l => monthlyData[l].carGasoline);
        const carLpgSpent = labels.map(l => monthlyData[l].carLpg);

        if (monthlyCostChartInstance) {
            monthlyCostChartInstance.destroy();
        }

        let datasets = [];
        if (vehicleFilter === 'all') {
            datasets = [
                { label: 'Motor (Benzin)', data: motorcycleSpent, backgroundColor: '#06b6d4' },
                { label: 'Oto (Benzin)', data: carGasSpent, backgroundColor: '#10b981' },
                { label: 'Oto (LPG)', data: carLpgSpent, backgroundColor: '#f59e0b' }
            ];
        } else if (vehicleFilter === 'motorcycle') {
            datasets = [
                { label: 'Motosiklet Benzin Gideri', data: motorcycleSpent, backgroundColor: '#06b6d4' }
            ];
        } else if (vehicleFilter === 'car') {
            datasets = [
                { label: 'Otomobil Benzin Gideri', data: carGasSpent, backgroundColor: '#10b981' },
                { label: 'Otomobil LPG Gideri', data: carLpgSpent, backgroundColor: '#f59e0b' }
            ];
        }

        monthlyCostChartInstance = new Chart(canvas, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#94a3b8', font: { family: 'Outfit' } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${context.raw.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
                    },
                    y: {
                        stacked: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Outfit' },
                            callback: function(val) { return val.toLocaleString('tr-TR') + ' TL'; }
                        }
                    }
                }
            }
        });
    },

    drawPriceTrendChart: function(vehicleFilter) {
        const canvas = document.getElementById('priceTrendChart');
        if (!canvas) return;

        // Group prices by date and fuel type
        // Gasoline prices and LPG prices over time
        let gasPrices = [];
        let lpgPrices = [];

        state.logs.forEach(log => {
            const pt = { x: new Date(log.date), y: log.unitPrice };
            if (log.fuelType === 'gasoline') {
                // If filter is motorcycle, show all gasoline. If car, show only car gasoline.
                if (vehicleFilter === 'all' || 
                    (vehicleFilter === 'motorcycle' && log.vehicle === 'motorcycle') ||
                    (vehicleFilter === 'car' && log.vehicle === 'car')) {
                    gasPrices.push(pt);
                }
            } else if (log.fuelType === 'lpg' && (vehicleFilter === 'all' || vehicleFilter === 'car')) {
                lpgPrices.push(pt);
            }
        });

        // Sort points by date
        gasPrices.sort((a, b) => a.x - b.x);
        lpgPrices.sort((a, b) => a.x - b.x);

        if (priceTrendChartInstance) {
            priceTrendChartInstance.destroy();
        }

        const datasets = [];
        if (gasPrices.length > 0) {
            datasets.push({
                label: 'Benzin (TL/L)',
                data: gasPrices.map(p => ({ x: p.x.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }), y: p.y })),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.3,
                fill: true
            });
        }
        if (lpgPrices.length > 0) {
            datasets.push({
                label: 'LPG (TL/L)',
                data: lpgPrices.map(p => ({ x: p.x.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }), y: p.y })),
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                tension: 0.3,
                fill: true
            });
        }

        // Generate unique chronological label keys
        const allLabelsSet = new Set();
        datasets.forEach(d => d.data.forEach(pt => allLabelsSet.add(pt.x)));
        const labels = Array.from(allLabelsSet);

        // Chart structure mapping
        priceTrendChartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets.map(dataset => {
                    // Map datasets to ensure keys match labels
                    const mappedData = labels.map(label => {
                        const match = dataset.data.find(pt => pt.x === label);
                        return match ? match.y : null;
                    });
                    return { ...dataset, data: mappedData };
                })
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#94a3b8', font: { family: 'Outfit' } }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit' } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            font: { family: 'Outfit' },
                            callback: function(val) { return val.toFixed(2) + ' TL'; }
                        }
                    }
                }
            }
        });
    },

    // Toast Notifications
    showToast: function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-octagon';
        if (type === 'info') iconName = 'info';

        toast.innerHTML = `
            <i data-lucide="${iconName}"></i>
            <span class="toast-message">${message}</span>
        `;
        
        elements.toastContainer.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Settings actions
    exportData: function() {
        if (state.logs.length === 0) {
            this.showToast('İndirilecek yakıt kaydı bulunmuyor.', 'error');
            return;
        }
        
        const dataStr = JSON.stringify(state, null, 4);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `yakit_takip_yedek_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Yedek dosyası başarıyla indirildi.', 'success');
    },

    importData: function() {
        const file = elements.importFileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed && Array.isArray(parsed.logs)) {
                    state = parsed;
                    this.saveState();
                    this.updateDashboard();
                    this.renderHistoryTable();
                    
                    // Reset file inputs
                    elements.importFileInput.value = '';
                    elements.fileNameText.textContent = "Dosya seçilmedi";
                    elements.btnImport.setAttribute('disabled', 'true');
                    
                    this.showToast('Yedek veriler başarıyla geri yüklendi.', 'success');
                } else {
                    this.showToast('Geçersiz dosya formatı. Lütfen doğru yedek dosyasını yükleyin.', 'error');
                }
            } catch (err) {
                this.showToast('Dosya okunurken bir hata oluştu.', 'error');
            }
        };
        reader.readAsText(file);
    },

    clearAllData: function() {
        if (confirm('TÜM YAKIT KAYITLARINIZ SİLİNECEKTİR! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
            state.logs = [];
            this.saveState();
            this.updateDashboard();
            this.renderHistoryTable();
            this.resetForm();
            this.showToast('Tüm kayıtlar silindi.', 'info');
        }
    },

    loadDemoData: function() {
        if (confirm('Rastgele oluşturulmuş deneme yakıt verileri yüklenecektir. Mevcut verileriniz silinecektir! Onaylıyor musunuz?')) {
            state.logs = JSON.parse(JSON.stringify(DEMO_DATA));
            this.saveState();
            this.updateDashboard();
            this.renderHistoryTable();
            this.showToast('Deneme yakıt verileri başarıyla yüklendi.', 'success');
        }
    }
};

// Start application on page load
window.addEventListener('DOMContentLoaded', () => {
    app.init();
    // Expose app globally for onclick inline handlers
    window.app = app;
});
