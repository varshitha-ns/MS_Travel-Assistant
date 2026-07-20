import React,{useState,useEffect} from 'react';

export default function Dashboard(){
    const [prompt,setPrompt]=useState('');
    const [loading,setLoading]=useState(false);
    const [error,setError]=useState('');

    const[itenary,setItenary]=useState(null);

    const handleGenerate=async()=>{
        if(!prompt.trim()) return;

        setLoading(true);
        setError('');

        try{
            const response=await fetch('http://localhost:5000/api/auth/generate-itinerary', {
                method:'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                    prompt:prompt,
                    userPreferences: "Prefers well-optimized scheduling"
                }),
            });
            if(!response.ok){
                throw new Error(`Server status: ${response.status}`)
            }

            const data = await response.json();
            setItenary(data);
        }catch(err){
            console.error("Failed to  fetch live agent data:",err);
            setError('The travel agent pipeline ran into a calculation error. Please try again.');

        }finally{
            setLoading(false);
        }
        };
    
        return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-8">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">AI TRAVELS</span>
          </div>
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-3 px-4 py-2.5 bg-blue-600/10 text-blue-400 rounded-lg font-medium">
              <span>📊</span> <span>Dashboard</span>
            </a>
          </nav>
        </div>
        <div className="border-t border-slate-800 pt-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center font-bold text-blue-400">V</div>
          <div>
            <p className="text-sm font-medium">Varshitha</p>
            <p className="text-xs text-slate-500">Premium Member</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto space-y-8 overflow-y-auto">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back, Adventurer!</h1>
          <p className="text-slate-400 text-sm mt-1">Your autonomous travel agents are online and monitoring your pathways.</p>
        </header>

        {/* AI Command Input Center */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <span>🤖</span> Instruct Your Itinerary Agent
          </h3>
          <p className="text-slate-400 text-sm mb-4">Where are we heading? Tell the agent your destination vibe, stops, and schedule parameters.</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              placeholder="e.g., Plan a 3-day trip to Goa..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 disabled:opacity-50"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors shadow-md min-w-[120px]"
            >
              {loading ? 'Thinking...' : 'Generate'}
            </button>
          </div>
          
          {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
        </section>

        {/* Dynamic Display Grid: Only shows up once data is loaded */}
        {itenary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            
            {/* Left Hand: Core Destination Metadata & Reasoning Insights */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white capitalize">🎯 Target: {itenary.destination}</h3>
                  {itenary.weatherAlertFlag && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                      ⚠️ Weather Alert Active
                    </span>
                  )}
                </div>
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">Agent System Reflection Logic</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{itenary.agentAssessmentText}</p>
                </div>
              </div>
            </div>

            {/* Right Hand: Dynamic Itinerary Timeline Stream from DeepSeek */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span>📍</span> Dynamic Itinerary Stream
              </h3>
              
              <div className="relative border-l border-slate-800 ml-3 space-y-6">
                {itenary.steps?.map((step, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-slate-900"></div>
                    <span className="text-xs font-mono text-blue-400 bg-blue-950/40 border border-blue-900/40 px-2 py-0.5 rounded">
                      {step.time}
                    </span>
                    <h4 className="text-sm font-medium text-white mt-2">{step.activity}</h4>
                    <span className="inline-block text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/10">
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}