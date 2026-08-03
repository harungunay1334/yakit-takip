// State Management
const STATE_KEY = 'yakit_takip_logs';
let state = {
    vehicles: [],
    logs: []
};

// Chart references
let monthlyCostChartInstance = null;
let priceTrendChartInstance = null;

let selectedMonthYear = 'current';

// Stable color palette assigned to vehicles by registration order
const VEHICLE_COLOR_PALETTE = ['#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#22c55e', '#a855f7', '#ef4444', '#14b8a6'];

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
    valLastOdometer: document.getElementById('val-last-odometer'),
    trendLastOdometer: document.getElementById('trend-last-odometer'),
    odometerQuickEntry: document.getElementById('odometer-quick-entry'),
    currentOdometerInput: document.getElementById('current-odometer-input'),
    btnSaveCurrentOdometer: document.getElementById('btn-save-current-odometer'),
    sinceLastFillText: document.getElementById('since-last-fill-text'),
    monthSelector: document.getElementById('month-selector'),

    // Fuel Breakdown (shown only for the selected multi-fuel vehicle)
    carBreakdownSection: document.getElementById('car-breakdown-section'),
    breakdownTitle: document.getElementById('breakdown-title'),
    carGasTotal: document.getElementById('car-gas-total'),
    carGasProgress: document.getElementById('car-gas-progress'),
    carGasPerKm: document.getElementById('car-gas-per-km'),
    carLpgTotal: document.getElementById('car-lpg-total'),
    carLpgProgress: document.getElementById('car-lpg-progress'),
    carLpgPerKm: document.getElementById('car-lpg-per-km'),
    carSavingsBanner: document.getElementById('car-savings-banner'),
    carSavingsText: document.getElementById('car-savings-text'),

    // Vehicle Management
    vehicleForm: document.getElementById('vehicle-form'),
    vehicleIdInput: document.getElementById('vehicle-id'),
    vehiclePlaka: document.getElementById('vehicle-plaka'),
    vehicleIsim: document.getElementById('vehicle-isim'),
    vehicleFuelGasoline: document.getElementById('vehicle-fuel-gasoline'),
    vehicleFuelLpg: document.getElementById('vehicle-fuel-lpg'),
    vehicleFormTitle: document.getElementById('vehicle-form-title'),
    vehicleSubmitBtnText: document.getElementById('vehicle-submit-btn-text'),
    btnCancelVehicleEdit: document.getElementById('btn-cancel-vehicle-edit'),
    vehiclesListContainer: document.getElementById('vehicles-list'),
    vehiclesEmptyState: document.getElementById('vehicles-empty-state'),

    // Fuel Log Form Elements
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
const DEMO_VEHICLES = [
    { id: 'v_demo_moto', plaka: '34 ABC 123', isim: 'Motosiklet', fuelTypes: ['gasoline'] },
    { id: 'v_demo_car', plaka: '34 XYZ 456', isim: 'Otomobil', fuelTypes: ['gasoline', 'lpg'] }
];

const DEMO_LOGS = [
    // Motosiklet (Benzin) - April to June 2026
    { id: 'm1', vehicleId: 'v_demo_moto', fuelType: 'gasoline', date: '2026-04-10', odometer: 12000, amount: 12.5, unitPrice: 42.10, totalPrice: 526.25, fullTank: true, notes: 'İlk kayıt' },
    { id: 'm2', vehicleId: 'v_demo_moto', fuelType: 'gasoline', date: '2026-04-28', odometer: 12350, amount: 11.2, unitPrice: 42.80, totalPrice: 479.36, fullTank: true, notes: 'Opet' },
    { id: 'm3', vehicleId: 'v_demo_moto', fuelType: 'gasoline', date: '2026-05-15', odometer: 12710, amount: 11.8, unitPrice: 43.15, totalPrice: 509.17, fullTank: true, notes: 'Shell Nitro' },
    { id: 'm4', vehicleId: 'v_demo_moto', fuelType: 'gasoline', date: '2026-06-01', odometer: 13080, amount: 12.1, unitPrice: 43.50, totalPrice: 526.35, fullTank: true, notes: 'Petrol Ofisi' },
    { id: 'm5', vehicleId: 'v_demo_moto', fuelType: 'gasoline', date: '2026-06-10', odometer: 13420, amount: 10.9, unitPrice: 43.90, totalPrice: 478.51, fullTank: true, notes: 'Şehir içi kullanım' },

    // Otomobil (Benzin & LPG) - April to June 2026
    { id: 'c1', vehicleId: 'v_demo_car', fuelType: 'lpg', date: '2026-04-05', odometer: 84000, amount: 32.0, unitPrice: 20.10, totalPrice: 643.20, fullTank: true, notes: 'BP Otogaz' },
    { id: 'c2', vehicleId: 'v_demo_car', fuelType: 'lpg', date: '2026-04-18', odometer: 84410, amount: 33.5, unitPrice: 20.30, totalPrice: 680.05, fullTank: true, notes: 'Aygaz' },
    { id: 'c3', vehicleId: 'v_demo_car', fuelType: 'lpg', date: '2026-05-02', odometer: 84830, amount: 31.8, unitPrice: 20.80, totalPrice: 661.44, fullTank: true, notes: 'Milangaz' },
    { id: 'c4', vehicleId: 'v_demo_car', fuelType: 'lpg', date: '2026-05-20', odometer: 85250, amount: 34.2, unitPrice: 21.00, totalPrice: 718.20, fullTank: true, notes: 'Aygaz' },
    { id: 'c5', vehicleId: 'v_demo_car', fuelType: 'lpg', date: '2026-06-03', odometer: 85680, amount: 32.9, unitPrice: 21.20, totalPrice: 697.48, fullTank: true, notes: 'BP Otogaz' },
    { id: 'c6', vehicleId: 'v_demo_car', fuelType: 'gasoline', date: '2026-04-06', odometer: 84010, amount: 15.0, unitPrice: 42.10, totalPrice: 631.50, fullTank: true, notes: 'İlk benzin fulleme' },
    { id: 'c7', vehicleId: 'v_demo_car', fuelType: 'lpg', date: '2026-06-11', odometer: 86100, amount: 33.1, unitPrice: 21.50, totalPrice: 711.65, fullTank: true, notes: 'Son lpg dolumu' },
    { id: 'c8', vehicleId: 'v_demo_car', fuelType: 'gasoline', date: '2026-05-25', odometer: 85500, amount: 12.0, unitPrice: 43.10, totalPrice: 517.20, fullTank: true, notes: 'İkinci benzin fulleme' },
];

// App Initialization
const app = {
    init: function() {
        this.loadState();
        this.populateAllVehicleSelects();
        this.bindEvents();
        this.setDefaultDate();
        this.renderVehiclesList();
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
                state = { vehicles: [], logs: [] };
            }
        } else {
            state = { vehicles: [], logs: [] };
        }
        this.normalizeState();
    },

    // Ensures shape integrity and migrates pre-multi-vehicle data (log.vehicle: 'motorcycle'|'car')
    normalizeState: function() {
        if (!Array.isArray(state.vehicles)) state.vehicles = [];
        if (!Array.isArray(state.logs)) state.logs = [];
        this.migrateLegacyData();
    },

    migrateLegacyData: function() {
        const legacyLogs = state.logs.filter(l => l.vehicle && !l.vehicleId);
        if (legacyLogs.length === 0) return;

        const legacyMap = { motorcycle: 'v_motorcycle', car: 'v_car' };

        if (legacyLogs.some(l => l.vehicle === 'motorcycle') && !state.vehicles.some(v => v.id === 'v_motorcycle')) {
            state.vehicles.push({ id: 'v_motorcycle', plaka: 'Plaka Girin', isim: 'Motosiklet', fuelTypes: ['gasoline'] });
        }
        if (legacyLogs.some(l => l.vehicle === 'car') && !state.vehicles.some(v => v.id === 'v_car')) {
            state.vehicles.push({ id: 'v_car', plaka: 'Plaka Girin', isim: 'Otomobil', fuelTypes: ['gasoline', 'lpg'] });
        }

        state.logs.forEach(l => {
            if (l.vehicle && !l.vehicleId && legacyMap[l.vehicle]) {
                l.vehicleId = legacyMap[l.vehicle];
                delete l.vehicle;
            }
        });

        this.saveState();
        this.showToast('Eski araç verileriniz taşındı. Lütfen "Araçlarım" sekmesinden plakalarınızı girin.', 'info');
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
            const vehicleId = e.target.value;
            this.handleVehicleChange(vehicleId);
            this.updateLastOdometerHelp(vehicleId);
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

        // Vehicle management form
        elements.vehicleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleVehicleFormSubmit();
        });

        elements.btnCancelVehicleEdit.addEventListener('click', () => {
            this.resetVehicleForm();
        });

        // Quick "current odometer" entry
        elements.btnSaveCurrentOdometer.addEventListener('click', () => this.saveCurrentOdometer());
        elements.currentOdometerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.saveCurrentOdometer();
            }
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
            item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
        });

        elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });

        // Page title customization
        if (tabId === 'dashboard') {
            elements.pageTitle.textContent = "Gösterge Paneli";
            elements.pageSubtitle.textContent = "Yakıt tüketimi ve maliyet analizleriniz";
            elements.globalVehicleFilter.parentElement.style.display = 'block';
            this.updateDashboard();
        } else if (tabId === 'vehicles') {
            elements.pageTitle.textContent = "Araçlarım";
            elements.pageSubtitle.textContent = "Araçlarınızı plakalarıyla yönetin";
            elements.globalVehicleFilter.parentElement.style.display = 'none';
            this.renderVehiclesList();
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

    // --- Vehicle selects (global filter / add-log form / history filter) ---

    populateAllVehicleSelects: function() {
        this.populateSelect(elements.globalVehicleFilter, 'Tüm Araçlar');
        this.populateSelect(elements.filterVehicle, 'Tüm Araçlar');
        this.populateFormVehicleSelect();
    },

    populateSelect: function(selectEl, allLabel) {
        const currentVal = selectEl.value;
        selectEl.innerHTML = '';

        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = allLabel;
        selectEl.appendChild(allOpt);

        state.vehicles.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = `${v.plaka}${v.isim ? ' — ' + v.isim : ''}`;
            selectEl.appendChild(opt);
        });

        const hasCurrent = Array.from(selectEl.options).some(o => o.value === currentVal);
        selectEl.value = hasCurrent ? currentVal : 'all';
    },

    populateFormVehicleSelect: function() {
        const sel = elements.formVehicle;
        const currentVal = sel.value;
        sel.innerHTML = '';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = state.vehicles.length > 0 ? 'Araç seçiniz...' : 'Önce "Araçlarım" sekmesinden araç ekleyin';
        sel.appendChild(placeholder);

        state.vehicles.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.id;
            opt.textContent = `${v.plaka}${v.isim ? ' — ' + v.isim : ''}`;
            sel.appendChild(opt);
        });

        const hasCurrent = currentVal !== '' && Array.from(sel.options).some(o => o.value === currentVal);
        if (hasCurrent) sel.value = currentVal;
    },

    // --- Vehicle Management (Add/Edit/Delete) ---

    resetVehicleForm: function() {
        elements.vehicleForm.reset();
        elements.vehicleIdInput.value = '';
        elements.vehicleFormTitle.textContent = 'Yeni Araç Ekle';
        elements.vehicleSubmitBtnText.textContent = 'Araç Ekle';
        elements.btnCancelVehicleEdit.classList.add('style-hidden');
    },

    handleVehicleFormSubmit: function() {
        const id = elements.vehicleIdInput.value;
        const plaka = elements.vehiclePlaka.value.trim().toUpperCase();
        const isim = elements.vehicleIsim.value.trim();
        const fuelTypes = [];
        if (elements.vehicleFuelGasoline.checked) fuelTypes.push('gasoline');
        if (elements.vehicleFuelLpg.checked) fuelTypes.push('lpg');

        if (!plaka) {
            this.showToast('Lütfen plaka girin.', 'error');
            return;
        }
        if (fuelTypes.length === 0) {
            this.showToast('Lütfen en az bir yakıt türü seçin.', 'error');
            return;
        }

        const duplicate = state.vehicles.find(v => v.plaka.toUpperCase() === plaka && v.id !== id);
        if (duplicate) {
            this.showToast(`Bu plaka zaten kayıtlı: ${duplicate.plaka}${duplicate.isim ? ' (' + duplicate.isim + ')' : ''}`, 'error');
            return;
        }

        if (id) {
            const vehicle = state.vehicles.find(v => v.id === id);
            vehicle.plaka = plaka;
            vehicle.isim = isim;
            vehicle.fuelTypes = fuelTypes;
            this.showToast('Araç bilgileri güncellendi.', 'success');
        } else {
            state.vehicles.push({ id: 'veh_' + Date.now(), plaka, isim, fuelTypes });
            this.showToast('Yeni araç eklendi.', 'success');
        }

        this.saveState();
        this.resetVehicleForm();
        this.populateAllVehicleSelects();
        this.renderVehiclesList();
        this.updateDashboard();
    },

    editVehicle: function(id) {
        const vehicle = state.vehicles.find(v => v.id === id);
        if (!vehicle) return;

        elements.vehicleIdInput.value = vehicle.id;
        elements.vehiclePlaka.value = vehicle.plaka;
        elements.vehicleIsim.value = vehicle.isim || '';
        elements.vehicleFuelGasoline.checked = vehicle.fuelTypes.includes('gasoline');
        elements.vehicleFuelLpg.checked = vehicle.fuelTypes.includes('lpg');
        elements.vehicleFormTitle.textContent = 'Aracı Düzenle';
        elements.vehicleSubmitBtnText.textContent = 'Güncelle';
        elements.btnCancelVehicleEdit.classList.remove('style-hidden');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    deleteVehicle: function(id) {
        const vehicle = state.vehicles.find(v => v.id === id);
        if (!vehicle) return;

        const logCount = state.logs.filter(l => l.vehicleId === id).length;
        const msg = logCount > 0
            ? `${vehicle.plaka} aracını silmek istediğinize emin misiniz? Bu araca ait ${logCount} yakıt kaydı da birlikte silinecektir!`
            : `${vehicle.plaka} aracını silmek istediğinize emin misiniz?`;

        if (confirm(msg)) {
            state.vehicles = state.vehicles.filter(v => v.id !== id);
            state.logs = state.logs.filter(l => l.vehicleId !== id);
            this.saveState();
            this.populateAllVehicleSelects();
            this.renderVehiclesList();
            this.updateDashboard();
            this.renderHistoryTable();
            this.showToast('Araç ve ilişkili kayıtlar silindi.', 'info');
        }
    },

    saveCurrentOdometer: function() {
        const filter = elements.globalVehicleFilter.value || 'all';
        if (filter === 'all') return;

        const vehicle = state.vehicles.find(v => v.id === filter);
        if (!vehicle) return;

        const value = parseInt(elements.currentOdometerInput.value);
        if (isNaN(value)) {
            this.showToast('Lütfen geçerli bir kilometre girin.', 'error');
            return;
        }

        const lastLog = state.logs.filter(l => l.vehicleId === vehicle.id).reduce((max, l) => (!max || l.odometer > max.odometer) ? l : max, null);
        if (lastLog && value < lastLog.odometer) {
            this.showToast(`Güncel kilometre, son dolum kilometresinden (${lastLog.odometer.toLocaleString('tr-TR')} km) düşük olamaz.`, 'error');
            return;
        }

        vehicle.currentOdometer = value;
        this.saveState();
        this.showToast('Güncel kilometre kaydedildi.', 'success');
        this.updateDashboard();
    },

    getVehicleColor: function(vehicleId) {
        const idx = state.vehicles.findIndex(v => v.id === vehicleId);
        return VEHICLE_COLOR_PALETTE[idx >= 0 ? idx % VEHICLE_COLOR_PALETTE.length : 0];
    },

    hexToRgba: function(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    renderVehiclesList: function() {
        const container = elements.vehiclesListContainer;
        if (!container) return;

        if (state.vehicles.length === 0) {
            container.innerHTML = '';
            elements.vehiclesEmptyState.style.display = 'flex';
            return;
        }
        elements.vehiclesEmptyState.style.display = 'none';

        container.innerHTML = state.vehicles.map(v => {
            const color = this.getVehicleColor(v.id);
            const logsForVehicle = state.logs.filter(l => l.vehicleId === v.id);
            const lastLog = logsForVehicle.reduce((max, l) => (!max || l.odometer > max.odometer) ? l : max, null);
            const fuelBadges = v.fuelTypes.map(ft =>
                `<span class="badge ${ft === 'gasoline' ? 'badge-gasoline' : 'badge-lpg'}">${ft === 'gasoline' ? 'Benzin' : 'LPG'}</span>`
            ).join('');

            return `
                <div class="vehicle-card" style="border-left-color: ${color};">
                    <div class="vehicle-card-info">
                        <span class="vehicle-plate-badge">${v.plaka}</span>
                        <h4>${v.isim || 'İsimsiz Araç'}</h4>
                        <div class="vehicle-fuel-badges">${fuelBadges}</div>
                        <span class="text-muted" style="font-size:0.8rem;">${logsForVehicle.length} kayıt${lastLog ? ' · Son: ' + lastLog.odometer.toLocaleString('tr-TR') + ' km' : ''}</span>
                    </div>
                    <div class="vehicle-card-actions">
                        <button class="btn-icon" onclick="app.editVehicle('${v.id}')" title="Düzenle"><i data-lucide="edit-3"></i></button>
                        <button class="btn-icon delete" onclick="app.deleteVehicle('${v.id}')" title="Sil"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        lucide.createIcons();
    },

    // --- Fuel Log Form ---

    handleVehicleChange: function(vehicleId) {
        const fuelSelect = elements.formFuelType;
        fuelSelect.innerHTML = '';

        const vehicle = state.vehicles.find(v => v.id === vehicleId);

        if (!vehicle) {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Önce aracı seçin...';
            placeholder.disabled = true;
            placeholder.selected = true;
            fuelSelect.appendChild(placeholder);
            fuelSelect.setAttribute('disabled', 'true');
            return;
        }

        if (vehicle.fuelTypes.length > 1) {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.disabled = true;
            placeholder.selected = true;
            placeholder.textContent = 'Yakıt türü seçin...';
            fuelSelect.appendChild(placeholder);
        }

        vehicle.fuelTypes.forEach(ft => {
            const opt = document.createElement('option');
            opt.value = ft;
            opt.textContent = ft === 'gasoline' ? 'Benzin' : 'LPG';
            fuelSelect.appendChild(opt);
        });

        fuelSelect.removeAttribute('disabled');
    },

    updateLastOdometerHelp: function(vehicleId) {
        if (!vehicleId) {
            elements.lastOdometerVal.textContent = '-';
            return;
        }

        const vehicleLogs = state.logs
            .filter(l => l.vehicleId === vehicleId)
            .sort((a, b) => b.odometer - a.odometer);

        elements.lastOdometerVal.textContent = vehicleLogs.length > 0 ? vehicleLogs[0].odometer + " km" : "Kaydedilmemiş";
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
        const vehicleId = elements.formVehicle.value;
        const fuelType = elements.formFuelType.value;
        const date = elements.formDate.value;
        const odometer = parseInt(elements.formOdometer.value);
        const amount = parseFloat(elements.formAmount.value);
        const unitPrice = parseFloat(elements.formUnitPrice.value);
        const totalPrice = parseFloat(elements.formTotalPrice.value);
        const fullTank = elements.formFullTank.checked;
        const notes = elements.formNotes.value.trim();

        const vehicle = state.vehicles.find(v => v.id === vehicleId);

        // Basic validation
        if (!vehicle || !fuelType || isNaN(odometer) || isNaN(amount) || isNaN(unitPrice) || isNaN(totalPrice)) {
            this.showToast('Lütfen tüm zorunlu alanları doldurun.', 'error');
            return;
        }

        if (!vehicle.fuelTypes.includes(fuelType)) {
            this.showToast('Seçilen yakıt türü bu araç için geçerli değil.', 'error');
            return;
        }

        // Odometer check: warn if it's lower than the previous odometer for the same vehicle
        const sameVehicleLogs = state.logs.filter(l => l.vehicleId === vehicleId && l.id !== id);
        if (sameVehicleLogs.length > 0) {
            const maxOdometer = Math.max(...sameVehicleLogs.map(l => l.odometer));
            if (odometer < maxOdometer) {
                const proceed = confirm(`Girdiğiniz kilometre (${odometer} km), ${vehicle.plaka} için en yüksek kilometreden (${maxOdometer} km) daha düşüktür. Yine de kaydetmek istiyor musunuz?`);
                if (!proceed) return;
            }
        }

        const logData = {
            id: id || 'id_' + Date.now(),
            vehicleId,
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
            delete vehicle.currentOdometer; // the new fill-up is now the freshest reference point
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
        elements.formVehicle.value = log.vehicleId;

        // Re-populate fuel type select based on vehicle
        this.handleVehicleChange(log.vehicleId);
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

        this.updateLastOdometerHelp(log.vehicleId);
    },

    deleteLog: function(id) {
        if (confirm('Bu yakıt kaydını silmek istediğinizden emin misiniz?')) {
            state.logs = state.logs.filter(l => l.id !== id);
            this.saveState();
            this.renderHistoryTable();
            this.showToast('Kayıt başarıyla silindi.', 'success');
        }
    },

    // Full-tank-to-full-tank consumption calc: returns { dist, fuel, avg (L/100km) }
    fullTankConsumption: function(logs) {
        const sorted = [...logs].sort((a, b) => a.odometer - b.odometer);
        let dist = 0, fuel = 0, lastFull = -1, temp = 0;
        for (const l of sorted) {
            if (lastFull === -1) {
                if (l.fullTank) { lastFull = l.odometer; temp = 0; }
            } else {
                temp += l.amount;
                if (l.fullTank) {
                    const d = l.odometer - lastFull;
                    if (d > 0) { dist += d; fuel += temp; }
                    lastFull = l.odometer;
                    temp = 0;
                }
            }
        }
        return { dist, fuel, avg: dist > 0 ? (fuel / dist) * 100 : 0 };
    },

    // KPI and Stats calculations
    updateDashboard: function() {
        const filter = elements.globalVehicleFilter.value || 'all';
        const selectedVehicle = filter !== 'all' ? state.vehicles.find(v => v.id === filter) : null;

        // 1. Calculate Total Distance
        let totalDistance = 0;
        state.vehicles.forEach(v => {
            if (filter !== 'all' && v.id !== filter) return;
            const vLogs = state.logs.filter(l => l.vehicleId === v.id).sort((a, b) => a.odometer - b.odometer);
            if (vLogs.length > 1) totalDistance += (vLogs[vLogs.length - 1].odometer - vLogs[0].odometer);
        });
        elements.valTotalDistance.textContent = totalDistance > 0 ? `${totalDistance.toLocaleString('tr-TR')} km` : '0 km';

        // 1b. Last Known Odometer Reading
        const getLastLog = (vehicleId) => {
            const logs = state.logs.filter(l => l.vehicleId === vehicleId);
            if (logs.length === 0) return null;
            return logs.reduce((max, l) => (l.odometer > max.odometer ? l : max), logs[0]);
        };

        const daysAgoText = (dateStr) => {
            const diffMs = new Date() - new Date(dateStr);
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (days <= 0) return 'Bugün';
            if (days === 1) return 'Dün';
            return `${days} gün önce`;
        };

        if (state.vehicles.length === 0) {
            elements.valLastOdometer.innerHTML = '0 km';
            elements.trendLastOdometer.textContent = 'Henüz araç eklenmedi';
        } else if (filter === 'all') {
            const rows = state.vehicles.map(v => {
                const lastLog = getLastLog(v.id);
                return `<div class="stat-breakdown-row" style="align-items:center;"><span style="font-weight:500; color: var(--text-secondary);">${v.plaka}</span><span style="font-weight:600;">${lastLog ? lastLog.odometer.toLocaleString('tr-TR') + ' km' : 'Veri Yok'}</span></div>`;
            }).join('');
            elements.valLastOdometer.innerHTML = `<div class="stat-breakdown-list" style="border-top:none; padding-top:0; margin-top:0; font-size:0.95rem;">${rows}</div>`;
            elements.trendLastOdometer.textContent = 'Araç bazlı son sayaç değerleri';
        } else {
            const lastLog = getLastLog(filter);
            if (lastLog) {
                elements.valLastOdometer.innerHTML = `${lastLog.odometer.toLocaleString('tr-TR')} km`;
                const fuelLabel = lastLog.fuelType === 'lpg' ? 'LPG' : 'Benzin';
                elements.trendLastOdometer.textContent = `${daysAgoText(lastLog.date)} · ${fuelLabel} ile dolduruldu`;
            } else {
                elements.valLastOdometer.innerHTML = '0 km';
                elements.trendLastOdometer.textContent = 'Henüz kayıt yok';
            }
        }

        // 1c. Quick "current odometer" entry — shows km driven since the last fill-up
        // (only meaningful for a single selected vehicle with at least one fill-up logged)
        if (filter !== 'all' && selectedVehicle) {
            const lastLog = getLastLog(filter);
            if (lastLog) {
                elements.odometerQuickEntry.style.display = 'flex';
                elements.currentOdometerInput.value = selectedVehicle.currentOdometer || '';

                if (selectedVehicle.currentOdometer && selectedVehicle.currentOdometer >= lastLog.odometer) {
                    const sinceDist = selectedVehicle.currentOdometer - lastLog.odometer;
                    elements.sinceLastFillText.textContent = `Son dolumdan bu yana ≈ ${sinceDist.toLocaleString('tr-TR')} km`;
                    elements.sinceLastFillText.style.display = 'block';
                } else {
                    elements.sinceLastFillText.style.display = 'none';
                }
            } else {
                elements.odometerQuickEntry.style.display = 'none';
                elements.sinceLastFillText.style.display = 'none';
            }
        } else {
            elements.odometerQuickEntry.style.display = 'none';
            elements.sinceLastFillText.style.display = 'none';
        }

        // 2. Calculate Total Spent (Filtered by Selected Month - Defaulting to Latest Month with Data)
        const availableMonths = [...new Set(state.logs.map(l => {
            if (!l.date) return '';
            return l.date.substring(0, 7); // 'YYYY-MM'
        }))].filter(m => m !== '').sort((a, b) => b.localeCompare(a));

        const today = new Date();
        const currentCalMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

        if (selectedMonthYear === 'current' || !availableMonths.includes(selectedMonthYear)) {
            selectedMonthYear = availableMonths.length > 0 ? availableMonths[0] : currentCalMonth;
        }

        // Populate Month Selector Dropdown
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        let optionsHtml = '';
        if (availableMonths.length === 0) {
            const [yr, mo] = currentCalMonth.split('-');
            optionsHtml = `<option value="${currentCalMonth}">${monthNames[parseInt(mo) - 1]} ${yr}</option>`;
        } else {
            availableMonths.forEach(m => {
                const [yr, mo] = m.split('-');
                optionsHtml += `<option value="${m}">${monthNames[parseInt(mo) - 1]} ${yr}</option>`;
            });
        }
        elements.monthSelector.innerHTML = optionsHtml;
        elements.monthSelector.value = selectedMonthYear;

        // Filter logs by selected month-year
        const currentMonthAllLogs = state.logs.filter(l => l.date && l.date.startsWith(selectedMonthYear));
        const currentMonthFilteredLogs = filter === 'all' ? currentMonthAllLogs : currentMonthAllLogs.filter(l => l.vehicleId === filter);
        const totalCost = currentMonthFilteredLogs.reduce((sum, l) => sum + l.totalPrice, 0);

        let totalCostHtml = '';
        if (filter === 'all') {
            const rows = state.vehicles.map(v => {
                const vLogs = currentMonthAllLogs.filter(l => l.vehicleId === v.id);
                if (v.fuelTypes.length > 1) {
                    return v.fuelTypes.map(ft => {
                        const spent = vLogs.filter(l => l.fuelType === ft).reduce((s, l) => s + l.totalPrice, 0);
                        const label = ft === 'gasoline' ? 'Benzin' : 'LPG';
                        const color = ft === 'gasoline' ? 'var(--gasoline-color)' : 'var(--lpg-color)';
                        return `<div class="stat-breakdown-row"><span>${v.plaka} ${label}:</span> <span style="font-weight:600; color:${color};">${spent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span></div>`;
                    }).join('');
                }
                const spent = vLogs.reduce((s, l) => s + l.totalPrice, 0);
                return `<div class="stat-breakdown-row"><span>${v.plaka}:</span> <span style="font-weight:600;">${spent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span></div>`;
            }).join('');
            totalCostHtml = `
                <div class="stat-value-lg">${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>
                <div class="stat-breakdown-list">${rows}</div>
            `;
        } else if (selectedVehicle && selectedVehicle.fuelTypes.length > 1) {
            const rows = selectedVehicle.fuelTypes.map(ft => {
                const spent = currentMonthFilteredLogs.filter(l => l.fuelType === ft).reduce((s, l) => s + l.totalPrice, 0);
                const label = ft === 'gasoline' ? 'Benzin' : 'LPG';
                const color = ft === 'gasoline' ? 'var(--gasoline-color)' : 'var(--lpg-color)';
                return `<div class="stat-breakdown-row"><span>${label}:</span> <span style="font-weight:600; color:${color};">${spent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</span></div>`;
            }).join('');
            totalCostHtml = `
                <div class="stat-value-lg">${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>
                <div class="stat-breakdown-list">${rows}</div>
            `;
        } else {
            totalCostHtml = `<div style="font-size: 1.35rem; font-weight: 700;">${totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>`;
        }

        elements.valTotalCost.innerHTML = totalCostHtml;
        document.getElementById('trend-cost').textContent = 'Seçili ayın toplamı';

        // 3. Cost per KM
        let costPerKm = 0, consumedCost = 0, totalDistanceForCost = 0;
        state.vehicles.forEach(v => {
            if (filter !== 'all' && v.id !== filter) return;
            v.fuelTypes.forEach(ft => {
                const ftLogs = state.logs.filter(l => l.vehicleId === v.id && l.fuelType === ft).sort((a, b) => a.odometer - b.odometer);
                if (ftLogs.length > 1) {
                    const dist = ftLogs[ftLogs.length - 1].odometer - ftLogs[0].odometer;
                    if (dist > 0) {
                        totalDistanceForCost += dist;
                        consumedCost += ftLogs.slice(1).reduce((sum, l) => sum + l.totalPrice, 0);
                    }
                }
            });
        });
        if (totalDistanceForCost > 0) costPerKm = consumedCost / totalDistanceForCost;
        elements.valCostPerKm.textContent = costPerKm > 0 ? `${costPerKm.toFixed(2)} TL/km` : '0.00 TL/km';

        // 4. Average Fuel Consumption (L/100km), per vehicle + fuel type
        let avgConsumptionHtml = '';
        let trendText = '';

        if (filter === 'all') {
            if (state.vehicles.length === 0) {
                avgConsumptionHtml = 'Veri Yok';
                trendText = 'Henüz araç eklenmedi';
            } else {
                const rows = state.vehicles.map(v => v.fuelTypes.map(ft => {
                    const r = this.fullTankConsumption(state.logs.filter(l => l.vehicleId === v.id && l.fuelType === ft));
                    const label = ft === 'gasoline' ? 'Benzin' : 'LPG';
                    const badgeClass = ft === 'gasoline' ? 'badge-gasoline' : 'badge-lpg';
                    return `<div class="stat-breakdown-row" style="align-items:center;"><span class="badge ${badgeClass}" style="padding:2px 6px;">${v.plaka} ${label}</span><span style="font-weight:600;">${r.avg > 0 ? r.avg.toFixed(1) + ' L/100' : 'Veri Yok'}</span></div>`;
                }).join('')).join('');
                avgConsumptionHtml = `<div class="stat-breakdown-list" style="border-top:none; padding-top:0; margin-top:0;">${rows}</div>`;
                trendText = 'Araç bazlı ortalama tüketimler';
            }
        } else if (selectedVehicle) {
            if (selectedVehicle.fuelTypes.length === 1) {
                const r = this.fullTankConsumption(state.logs.filter(l => l.vehicleId === filter));
                avgConsumptionHtml = r.avg > 0 ? `${r.avg.toFixed(2)} L/100km` : 'Yetersiz veri';
                trendText = r.dist > 0 ? `Toplam ${r.dist} km'lik ölçüm` : 'En az 2 fulleme kaydı gerekir';
            } else {
                const results = {};
                const rows = selectedVehicle.fuelTypes.map(ft => {
                    results[ft] = this.fullTankConsumption(state.logs.filter(l => l.vehicleId === filter && l.fuelType === ft));
                    const label = ft === 'gasoline' ? 'Benzin' : 'LPG';
                    const badgeClass = ft === 'gasoline' ? 'badge-gasoline' : 'badge-lpg';
                    const color = ft === 'gasoline' ? 'var(--gasoline-color)' : 'var(--lpg-color)';
                    return `<div class="stat-breakdown-row" style="align-items:center;"><span class="badge ${badgeClass}" style="padding:2px 6px;">${label}</span><span style="font-weight:600; color:${color};">${results[ft].avg > 0 ? results[ft].avg.toFixed(2) + ' L/100km' : 'Veri Yok'}</span></div>`;
                }).join('');
                avgConsumptionHtml = `<div class="stat-breakdown-list" style="border-top:none; padding-top:0; margin-top:0; font-size:1.05rem;">${rows}</div>`;
                trendText = selectedVehicle.fuelTypes.map(ft => {
                    const label = ft === 'gasoline' ? 'Benzin' : 'LPG';
                    return results[ft].dist > 0 ? `${label}: ${results[ft].dist} km` : `${label} veri yok`;
                }).join(' | ');
            }
        } else {
            avgConsumptionHtml = 'Veri Yok';
            trendText = '';
        }

        elements.valAvgConsumption.innerHTML = avgConsumptionHtml;
        document.getElementById('trend-consumption').textContent = trendText;

        // 5. Fuel Breakdown & LPG Savings Estimate (only for a single selected multi-fuel vehicle,
        //    so figures from different vehicles never get mixed together)
        if (filter !== 'all' && selectedVehicle && selectedVehicle.fuelTypes.length > 1) {
            elements.carBreakdownSection.style.display = 'block';
            elements.breakdownTitle.textContent = `${selectedVehicle.plaka} Yakıt Dağılımı`;

            const vLogs = state.logs.filter(l => l.vehicleId === filter);
            const gasSpent = vLogs.filter(l => l.fuelType === 'gasoline').reduce((s, l) => s + l.totalPrice, 0);
            const gasLiters = vLogs.filter(l => l.fuelType === 'gasoline').reduce((s, l) => s + l.amount, 0);
            const lpgSpent = vLogs.filter(l => l.fuelType === 'lpg').reduce((s, l) => s + l.totalPrice, 0);
            const lpgLiters = vLogs.filter(l => l.fuelType === 'lpg').reduce((s, l) => s + l.amount, 0);
            const totalSpent = gasSpent + lpgSpent;

            elements.carGasTotal.textContent = `${gasSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL (${gasLiters.toFixed(1)} L)`;
            elements.carLpgTotal.textContent = `${lpgSpent.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL (${lpgLiters.toFixed(1)} L)`;

            if (totalSpent > 0) {
                elements.carGasProgress.style.width = `${(gasSpent / totalSpent) * 100}%`;
                elements.carLpgProgress.style.width = `${(lpgSpent / totalSpent) * 100}%`;
            } else {
                elements.carGasProgress.style.width = '0%';
                elements.carLpgProgress.style.width = '0%';
            }

            const gasResult = this.fullTankConsumption(vLogs.filter(l => l.fuelType === 'gasoline'));
            const lpgResult = this.fullTankConsumption(vLogs.filter(l => l.fuelType === 'lpg'));
            const avgGasPrice = gasLiters > 0 ? (gasSpent / gasLiters) : 0;
            const avgLpgPrice = lpgLiters > 0 ? (lpgSpent / lpgLiters) : 0;
            const costPerKmGas = (gasResult.avg > 0 && avgGasPrice > 0) ? (gasResult.avg / 100) * avgGasPrice : 0;
            const costPerKmLpg = (lpgResult.avg > 0 && avgLpgPrice > 0) ? (lpgResult.avg / 100) * avgLpgPrice : 0;

            elements.carGasPerKm.textContent = costPerKmGas > 0 ? `≈ ${costPerKmGas.toFixed(2)} TL/km ortalama` : 'Ort. tüketim verisi yok';
            elements.carLpgPerKm.textContent = costPerKmLpg > 0 ? `≈ ${costPerKmLpg.toFixed(2)} TL/km ortalama` : 'Ort. tüketim verisi yok';

            if (costPerKmGas > 0 && costPerKmLpg > 0 && lpgResult.dist > 0 && costPerKmGas > costPerKmLpg) {
                const savingsPerKm = costPerKmGas - costPerKmLpg;
                const totalSavings = savingsPerKm * lpgResult.dist;
                elements.carSavingsBanner.style.display = 'flex';
                elements.carSavingsText.textContent = `LPG kullanarak ${lpgResult.dist.toLocaleString('tr-TR')} km'de tahmini ${totalSavings.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL tasarruf ettiniz (Benzine göre ${savingsPerKm.toFixed(2)} TL/km daha ucuz).`;
            } else {
                elements.carSavingsBanner.style.display = 'none';
            }
        } else {
            elements.carBreakdownSection.style.display = 'none';
        }

        // 6. Refresh/Draw Charts
        this.drawMonthlyCostChart(filter);
        this.drawPriceTrendChart(filter);
    },

    // Render historical records table
    renderHistoryTable: function() {
        const vehicleFilter = elements.filterVehicle.value || 'all';
        const fuelFilter = elements.filterFuelType.value;

        let filteredLogs = [...state.logs];

        if (vehicleFilter !== 'all') {
            filteredLogs = filteredLogs.filter(l => l.vehicleId === vehicleFilter);
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

            const vehicle = state.vehicles.find(v => v.id === log.vehicleId);
            const vColor = vehicle ? this.getVehicleColor(vehicle.id) : '#64748b';
            const vehicleBadge = vehicle
                ? `<span class="badge" style="background-color:${this.hexToRgba(vColor, 0.15)}; color:${vColor};">${vehicle.plaka}</span>`
                : `<span class="badge" style="background-color:rgba(100,116,139,0.15); color:#64748b;">Silinmiş Araç</span>`;

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
    drawMonthlyCostChart: function(filter) {
        const canvas = document.getElementById('monthlyCostChart');
        if (!canvas) return;

        // Same fuel type keeps its color family (green=Benzin, amber=LPG); multiple vehicles
        // sharing a fuel type get distinct shades from that family, so they stay identifiable.
        const GASOLINE_SHADES = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#047857'];
        const LPG_SHADES = ['#f59e0b', '#fbbf24', '#d97706', '#fcd34d', '#b45309'];

        const gasolineVehicleIds = state.vehicles.filter(v => v.fuelTypes.includes('gasoline')).map(v => v.id);
        const lpgVehicleIds = state.vehicles.filter(v => v.fuelTypes.includes('lpg')).map(v => v.id);

        const monthlyData = {};
        const seriesKeys = [];
        const seriesMeta = {};

        state.logs.forEach(log => {
            if (filter !== 'all' && log.vehicleId !== filter) return;
            const vehicle = state.vehicles.find(v => v.id === log.vehicleId);
            if (!vehicle) return;

            const date = new Date(log.date);
            const monthKey = date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' });

            if (!monthlyData[monthKey]) monthlyData[monthKey] = {};

            const seriesKey = `${log.vehicleId}|${log.fuelType}`;
            if (!seriesMeta[seriesKey]) {
                const label = vehicle.fuelTypes.length > 1
                    ? `${vehicle.plaka} (${log.fuelType === 'gasoline' ? 'Benzin' : 'LPG'})`
                    : vehicle.plaka;

                let color;
                if (log.fuelType === 'gasoline') {
                    const idx = gasolineVehicleIds.indexOf(log.vehicleId);
                    color = GASOLINE_SHADES[idx >= 0 ? idx % GASOLINE_SHADES.length : 0];
                } else {
                    const idx = lpgVehicleIds.indexOf(log.vehicleId);
                    color = LPG_SHADES[idx >= 0 ? idx % LPG_SHADES.length : 0];
                }

                seriesMeta[seriesKey] = { label, color };
                seriesKeys.push(seriesKey);
            }

            monthlyData[monthKey][seriesKey] = (monthlyData[monthKey][seriesKey] || 0) + log.totalPrice;
        });

        const labels = Object.keys(monthlyData);
        const datasets = seriesKeys.map(key => ({
            label: seriesMeta[key].label,
            data: labels.map(l => monthlyData[l][key] || 0),
            backgroundColor: seriesMeta[key].color
        }));

        if (monthlyCostChartInstance) {
            monthlyCostChartInstance.destroy();
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

    drawPriceTrendChart: function(filter) {
        const canvas = document.getElementById('priceTrendChart');
        if (!canvas) return;

        // Group prices by date and fuel type (scoped to filtered vehicle, or all vehicles)
        let gasPrices = [];
        let lpgPrices = [];

        state.logs.forEach(log => {
            if (filter !== 'all' && log.vehicleId !== filter) return;
            const pt = { x: new Date(log.date), y: log.unitPrice };
            if (log.fuelType === 'gasoline') {
                gasPrices.push(pt);
            } else if (log.fuelType === 'lpg') {
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
        if (state.logs.length === 0 && state.vehicles.length === 0) {
            this.showToast('İndirilecek veri bulunmuyor.', 'error');
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
                    this.normalizeState();
                    this.saveState();
                    this.populateAllVehicleSelects();
                    this.renderVehiclesList();
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
        if (confirm('TÜM ARAÇ VE YAKIT KAYITLARINIZ SİLİNECEKTİR! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
            state.vehicles = [];
            state.logs = [];
            this.saveState();
            this.populateAllVehicleSelects();
            this.renderVehiclesList();
            this.updateDashboard();
            this.renderHistoryTable();
            this.resetForm();
            this.showToast('Tüm kayıtlar silindi.', 'info');
        }
    },

    loadDemoData: function() {
        if (confirm('Rastgele oluşturulmuş deneme yakıt verileri yüklenecektir. Mevcut verileriniz silinecektir! Onaylıyor musunuz?')) {
            state.vehicles = JSON.parse(JSON.stringify(DEMO_VEHICLES));
            state.logs = JSON.parse(JSON.stringify(DEMO_LOGS));
            this.saveState();
            this.populateAllVehicleSelects();
            this.renderVehiclesList();
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
