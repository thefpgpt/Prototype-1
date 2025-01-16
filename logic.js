// Game State Management
class GameState {
  constructor() {
    this.time = {
      date: new Date(2025, 0, 1),
      speed: 1,
      paused: true
    };
    
    this.resources = {
      treasury: 10000000000, // $10B
      population: 50000000,  // 50M
      approval: 75          // 75%
    };
    
    this.activePanel = 'nations';
    this.settings = {
      difficulty: 'medium',
      simulationSpeed: 3,
      autosaveInterval: 5,
      theme: 'light',
      uiScale: 100,
      showTutorials: true,
      notifications: {
        events: true,
        crisis: true,
        economic: true
      }
    };
  }

  updateTime() {
    if (!this.time.paused) {
      // Advance time based on speed
      this.time.date.setDate(this.time.date.getDate() + this.time.speed);
      this.updateUI();
    }
  }

  updateUI() {
    // Update date display
    document.querySelector('.game-date').textContent = this.time.date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Update quick stats
    document.querySelectorAll('.quick-stats .value').forEach(stat => {
      const type = stat.parentElement.querySelector('label').textContent.toLowerCase();
      if (type.includes('treasury')) {
        stat.textContent = `$${(this.resources.treasury / 1e9).toFixed(1)}B`;
      } else if (type.includes('population')) {
        stat.textContent = `${(this.resources.population / 1e6).toFixed(1)}M`;
      } else if (type.includes('approval')) {
        stat.textContent = `${this.resources.approval}%`;
      }
    });
  }
}

// UI Controller
class UIController {
  constructor(gameState) {
    this.gameState = gameState;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchPanel(btn.dataset.panel));
    });

    // Time Controls
    document.querySelector('.btn-pause').addEventListener('click', () => this.togglePause());
    document.querySelector('.btn-play').addEventListener('click', () => this.setSpeed(1));
    document.querySelector('.btn-fast-forward').addEventListener('click', () => this.setSpeed(3));

    // Main Controls
    document.querySelector('.btn-settings').addEventListener('click', () => this.toggleSettings());
    document.querySelector('.btn-save').addEventListener('click', () => this.saveGame());
    document.querySelector('.btn-load').addEventListener('click', () => this.loadGame());

    // Settings Modal
    const settingsModal = document.querySelector('.settings-modal');
    document.querySelector('.btn-close').addEventListener('click', () => this.closeSettings());
    document.querySelector('.modal-footer .btn-save').addEventListener('click', () => this.saveSettings());
    document.querySelector('.modal-footer .btn-cancel').addEventListener('click', () => this.closeSettings());

    // Initialize panel-specific listeners
    this.initializeNationsPanelListeners();
    this.initializeCitiesPanelListeners();
    this.initializeCompaniesPanelListeners();
    this.initializeMilitaryPanelListeners();
    this.initializeEconomyPanelListeners();
    this.initializeDiplomacyPanelListeners();
    this.initializeTechnologyPanelListeners();
    this.initializeSocietyPanelListeners();
    this.initializeEventsPanelListeners();
  }

  switchPanel(panelId) {
    // Hide all panels
    document.querySelectorAll('.game-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // Show selected panel
    document.getElementById(`${panelId}-panel`).classList.add('active');
    this.gameState.activePanel = panelId;
  }

  togglePause() {
    this.gameState.time.paused = !this.gameState.time.paused;
    document.querySelector('.btn-pause').classList.toggle('active', this.gameState.time.paused);
    document.querySelector('.btn-play').classList.toggle('active', !this.gameState.time.paused);
  }

  setSpeed(speed) {
    this.gameState.time.speed = speed;
    document.querySelector('.btn-play').classList.toggle('active', speed === 1);
    document.querySelector('.btn-fast-forward').classList.toggle('active', speed === 3);
  }

  toggleSettings() {
    document.querySelector('.settings-modal').classList.toggle('active');
  }

  closeSettings() {
    document.querySelector('.settings-modal').classList.remove('active');
  }

  saveSettings() {
    // Collect all settings values
    const settings = {
      difficulty: document.querySelector('select[name="difficulty"]').value,
      simulationSpeed: parseInt(document.querySelector('input[name="simulation-speed"]').value),
      autosaveInterval: parseInt(document.querySelector('select[name="autosave-interval"]').value),
      theme: document.querySelector('select[name="theme"]').value,
      uiScale: parseInt(document.querySelector('input[name="ui-scale"]').value),
      showTutorials: document.querySelector('input[name="show-tutorials"]').checked,
      notifications: {
        events: document.querySelector('input[name="event-notifications"]').checked,
        crisis: document.querySelector('input[name="crisis-alerts"]').checked,
        economic: document.querySelector('input[name="economic-reports"]').checked
      }
    };

    this.gameState.settings = settings;
    this.applySettings();
    this.closeSettings();
  }

  applySettings() {
    // Apply theme
    document.body.className = this.gameState.settings.theme;
    
    // Apply UI scale
    document.documentElement.style.fontSize = `${this.gameState.settings.uiScale}%`;
    
    // Update simulation speed
    this.setSpeed(this.gameState.settings.simulationSpeed);
  }

  saveGame() {
    const saveData = {
      gameState: this.gameState,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('worldSimSave', JSON.stringify(saveData));
    this.showNotification('Game saved successfully!');
  }

  loadGame() {
    const saveData = localStorage.getItem('worldSimSave');
    if (saveData) {
      const { gameState } = JSON.parse(saveData);
      Object.assign(this.gameState, gameState);
      this.gameState.updateUI();
      this.showNotification('Game loaded successfully!');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Panel-specific initialization methods
  initializeNationsPanelListeners() {
    const panel = document.getElementById('nations-panel');
    
    // Nation creation and editing
    panel.querySelector('.btn-create-nation').addEventListener('click', () => {
      // Implementation for creating new nation
    });

    // Government type changes
    panel.querySelector('.government-type').addEventListener('change', (e) => {
      // Update government structure based on selection
    });

    // Policy sliders
    panel.querySelectorAll('.policy-slider input').forEach(slider => {
      slider.addEventListener('input', (e) => {
        e.target.nextElementSibling.textContent = `${e.target.value}%`;
        // Update policy effects
      });
    });
  }

  initializeCitiesPanelListeners() {
    const panel = document.getElementById('cities-panel');
    
    panel.querySelector('.btn-create-city').addEventListener('click', () => {
      // Implementation for creating new city
    });

    // City service management
    panel.querySelectorAll('.service-grid .service').forEach(service => {
      const progressBar = service.querySelector('.progress-bar');
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percentage = ((e.clientX - rect.left) / rect.width) * 100;
        service.querySelector('.progress').style.width = `${percentage}%`;
        // Update city service level
      });
    });
  }

  // Additional panel initializations...
}

// Game Engine
class GameEngine {
  constructor() {
    this.gameState = new GameState();
    this.uiController = new UIController(this.gameState);
    this.startGameLoop();
  }

  startGameLoop() {
    setInterval(() => {
      this.gameState.updateTime();
      this.processEvents();
      this.updateEconomy();
      this.updateSociety();
      this.checkVictoryConditions();
    }, 1000); // Update every second
  }

  processEvents() {
    if (this.gameState.time.paused) return;

    // Random event generation
    if (Math.random() < 0.1) { // 10% chance each tick
      this.generateRandomEvent();
    }
  }

  generateRandomEvent() {
    const events = [
      { type: 'natural', title: 'Natural Disaster', severity: 'high' },
      { type: 'economic', title: 'Market Crash', severity: 'medium' },
      { type: 'diplomatic', title: 'International Summit', severity: 'low' }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    this.uiController.showNotification(`New Event: ${event.title}`, event.severity);
  }

  updateEconomy() {
    if (this.gameState.time.paused) return;

    // Basic economic simulation
    this.gameState.resources.treasury *= 1 + (Math.random() * 0.02 - 0.01); // ±1% change
    this.gameState.updateUI();
  }

  updateSociety() {
    if (this.gameState.time.paused) return;

    // Basic society simulation
    this.gameState.resources.approval += Math.random() * 2 - 1; // ±1% change
    this.gameState.resources.approval = Math.max(0, Math.min(100, this.gameState.resources.approval));
    this.gameState.updateUI();
  }

  checkVictoryConditions() {
    // Implementation for victory conditions
  }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});