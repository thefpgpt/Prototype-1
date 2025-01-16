import React, { useState, useEffect } from 'react';
import { Globe2, Building2, Briefcase, Sword, TrendingUp, Users, Lightbulb, Heart, AlertTriangle, Settings, FastForward, Pause, Play, Crown } from 'lucide-react';

interface Nation {
  name: string;
  type: string;
  founded: Date;
}

interface GameState {
  nation: Nation | null;
  time: {
    date: Date;
    speed: number;
    paused: boolean;
  };
  resources: {
    treasury: number;
    population: number;
    approval: number;
    research: number;
    military: number;
  };
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    nation: null,
    time: {
      date: new Date(2025, 0, 1),
      speed: 1,
      paused: true
    },
    resources: {
      treasury: 10000000000,
      population: 50000000,
      approval: 75,
      research: 0,
      military: 1000000
    }
  });

  const [activePanel, setActivePanel] = useState('nations');
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: number; message: string; type: string }>>([]);
  const [cities, setCities] = useState<Array<{name: string; population: number; happiness: number}>>([]);
  const [companies, setCompanies] = useState<Array<{name: string; revenue: number; employees: number}>>([]);
  const [technologies, setTechnologies] = useState<Array<{name: string; progress: number; cost: number}>>([]);
  const [militaryUnits, setMilitaryUnits] = useState<Array<{type: string; count: number; strength: number}>>([]);

  const navItems: NavItem[] = [
    { id: 'nations', label: 'Nation', icon: Globe2 },
    { id: 'cities', label: 'Cities', icon: Building2 },
    { id: 'companies', label: 'Companies', icon: Briefcase },
    { id: 'military', label: 'Military', icon: Sword },
    { id: 'economy', label: 'Economy', icon: TrendingUp },
    { id: 'society', label: 'Society', icon: Users },
    { id: 'technology', label: 'Technology', icon: Lightbulb }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (!gameState.time.paused) {
        updateGame();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const updateGame = () => {
    setGameState(prev => {
      const newDate = new Date(prev.time.date);
      newDate.setDate(newDate.getDate() + prev.time.speed);

      // Update resources based on cities and companies
      const cityIncome = cities.reduce((sum, city) => sum + (city.population * 100), 0);
      const companyIncome = companies.reduce((sum, company) => sum + (company.revenue * 0.1), 0);

      return {
        ...prev,
        time: { ...prev.time, date: newDate },
        resources: {
          ...prev.resources,
          treasury: prev.resources.treasury + cityIncome + companyIncome,
          population: cities.reduce((sum, city) => sum + city.population, 0),
          approval: Math.min(100, prev.resources.approval + (Math.random() - 0.5))
        }
      };
    });

    // Update technology progress
    setTechnologies(prev => 
      prev.map(tech => ({
        ...tech,
        progress: Math.min(100, tech.progress + (gameState.resources.research / tech.cost) * 0.1)
      }))
    );
  };

  const handleSpeedChange = (speed: number) => {
    setGameState(prev => ({
      ...prev,
      time: { ...prev.time, speed }
    }));
  };

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      time: { ...prev.time, paused: !prev.time.paused }
    }));
  };

  const displayNotification = (message: string, type: string = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const createNation = () => {
    const name = prompt('Enter your nation\'s name:');
    if (name) {
      const type = prompt('Choose government type (Democracy, Monarchy, Republic):');
      if (type) {
        setGameState(prev => ({
          ...prev,
          nation: {
            name,
            type,
            founded: new Date()
          }
        }));
        displayNotification(`Nation "${name}" has been established!`, 'success');
      }
    }
  };

  const handleAddCity = () => {
    const cityName = prompt('Enter city name:');
    if (cityName) {
      const population = Math.floor(Math.random() * 1000000) + 100000;
      setCities(prev => [...prev, {
        name: cityName,
        population,
        happiness: Math.floor(Math.random() * 30) + 70
      }]);
      displayNotification(`New city ${cityName} founded!`, 'success');
    }
  };

  const handleCreateCompany = () => {
    const companyName = prompt('Enter company name:');
    if (companyName) {
      const revenue = Math.floor(Math.random() * 1000000000) + 1000000;
      const employees = Math.floor(Math.random() * 10000) + 100;
      setCompanies(prev => [...prev, {
        name: companyName,
        revenue,
        employees
      }]);
      displayNotification(`New company ${companyName} established!`, 'success');
    }
  };

  const handleStartResearch = (techName: string, cost: number) => {
    if (gameState.resources.treasury >= cost) {
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          treasury: prev.resources.treasury - cost,
          research: prev.resources.research + 50
        }
      }));
      setTechnologies(prev => [
        ...prev,
        { name: techName, progress: 0, cost }
      ]);
      displayNotification(`Started research on ${techName}`, 'info');
    } else {
      displayNotification('Not enough funds for research!', 'error');
    }
  };

  const handleCreateMilitaryUnit = (type: string, cost: number, strength: number) => {
    if (gameState.resources.treasury >= cost) {
      setGameState(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          treasury: prev.resources.treasury - cost,
          military: prev.resources.military + strength
        }
      }));
      setMilitaryUnits(prev => {
        const existingUnit = prev.find(unit => unit.type === type);
        if (existingUnit) {
          return prev.map(unit => 
            unit.type === type 
              ? { ...unit, count: unit.count + 1, strength: unit.strength + strength }
              : unit
          );
        }
        return [...prev, { type, count: 1, strength }];
      });
      displayNotification(`New ${type} unit created!`, 'success');
    } else {
      displayNotification('Not enough funds!', 'error');
    }
  };

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'nations':
        return (
          <div className="space-y-6">
            {!gameState.nation ? (
              <div className="text-center">
                <button
                  onClick={createNation}
                  className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  Create Your Nation
                </button>
              </div>
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">{gameState.nation.name}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400">Government Type</p>
                    <p className="font-semibold">{gameState.nation.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Founded</p>
                    <p className="font-semibold">
                      {gameState.nation.founded.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'cities':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-xl font-semibold">Cities</div>
              <button
                onClick={handleAddCity}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Found New City
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {cities.map((city, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                  <div className="font-bold text-lg">{city.name}</div>
                  <div className="text-gray-300">Population: {(city.population).toLocaleString()}</div>
                  <div className="text-gray-300">Happiness: {city.happiness}%</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'companies':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-xl font-semibold">Companies</div>
              <button
                onClick={handleCreateCompany}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
              >
                Create Company
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {companies.map((company, index) => (
                <div key={index} className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                  <div className="font-bold text-lg">{company.name}</div>
                  <div className="text-gray-300">Revenue: ${(company.revenue).toLocaleString()}</div>
                  <div className="text-gray-300">Employees: {company.employees.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'military':
        return (
          <div className="space-y-6">
            <div className="text-xl font-semibold">Military</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="font-bold text-lg">Create Units</div>
                <div className="space-y-4 mt-4">
                  {[
                    { type: 'Infantry', cost: 1000000, strength: 100 },
                    { type: 'Tanks', cost: 10000000, strength: 500 },
                    { type: 'Aircraft', cost: 50000000, strength: 1000 }
                  ].map((unit, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{unit.type}</span>
                      <button
                        onClick={() => handleCreateMilitaryUnit(unit.type, unit.cost, unit.strength)}
                        className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition text-sm"
                      >
                        Create (${(unit.cost / 1e6).toFixed(1)}M)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="font-bold text-lg">Military Units</div>
                <div className="space-y-4 mt-4">
                  {militaryUnits.map((unit, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{unit.type}</span>
                      <span>
                        {unit.count} units ({unit.strength.toLocaleString()} strength)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'technology':
        return (
          <div className="space-y-6">
            <div className="text-xl font-semibold">Research & Development</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="font-bold text-lg">Available Technologies</div>
                <div className="space-y-4 mt-4">
                  {[
                    { name: 'AI Development', cost: 5000000000 },
                    { name: 'Clean Energy', cost: 3000000000 },
                    { name: 'Space Program', cost: 10000000000 }
                  ].map((tech, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{tech.name}</span>
                      <button
                        onClick={() => handleStartResearch(tech.name, tech.cost)}
                        className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition text-sm"
                      >
                        Research (${(tech.cost / 1e9).toFixed(1)}B)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="font-bold text-lg">Active Research</div>
                <div className="space-y-4 mt-4">
                  {technologies.map((tech, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{tech.name}</span>
                        <span>{Math.round(tech.progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${tech.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderHeader = () => (
    <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Crown className="text-yellow-500" size={24} />
          <div>
            <div className="text-xl font-bold">Future Governance</div>
            <div className="text-sm text-gray-400">Developed by Dron Pancholi</div>
          </div>
          {gameState.nation?.name && (
            <div className="ml-8 flex items-center space-x-2">
              <Heart className="text-red-500" />
              <span className="font-semibold">{gameState.nation.name}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSpeedChange(1)}
              className={`p-2 rounded ${gameState.time.speed === 1 ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <Play size={16} />
            </button>
            <button
              onClick={() => handleSpeedChange(2)}
              className={`p-2 rounded ${gameState.time.speed === 2 ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <FastForward size={16} />
            </button>
            <button
              onClick={() => handleSpeedChange(3)}
              className={`p-2 rounded ${gameState.time.speed === 3 ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <FastForward size={16} className="text-yellow-400" />
            </button>
          </div>
          <button
            onClick={togglePause}
            className="p-2 rounded hover:bg-gray-700"
          >
            {gameState.time.paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <span className="text-gray-300">
            {gameState.time.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded hover:bg-gray-700"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {renderHeader()}
      
      <div className="flex">
        <div className="w-64 bg-gray-800/30 backdrop-blur-sm p-4 space-y-2 sticky top-[73px] h-[calc(100vh-73px)]">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition ${
                activePanel === item.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm text-gray-400">Treasury</div>
              <div className="text-xl font-bold">${(gameState.resources.treasury / 1e9).toFixed(1)}B</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm text-gray-400">Population</div>
              <div className="text-xl font-bold">{(gameState.resources.population / 1e6).toFixed(1)}M</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm text-gray-400">Approval</div>
              <div className="text-xl font-bold">{Math.round(gameState.resources.approval)}%</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg">
              <div className="text-sm text-gray-400">Military Strength</div>
              <div className="text-xl font-bold">{(gameState.resources.military / 1e3).toFixed(1)}K</div>
            </div>
          </div>

          {renderPanelContent()}
        </div>
      </div>

      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`fixed bottom-4 right-4 p-4 rounded-lg text-white ${
            notification.type === 'error' ? 'bg-red-600' :
            notification.type === 'success' ? 'bg-green-600' :
            'bg-blue-600'
          }`}
        >
          {notification.message}
        </div>
      ))}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;