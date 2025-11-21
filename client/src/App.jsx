import React, { useState } from 'react';
import { 
  Youtube, 
  FileText, 
  Code, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle, 
  Zap,
  Globe,
  Shield,
  Clock,
  BookOpen
} from 'lucide-react';

// --- CONFIGURATION ---
// Ensure this matches your running backend URL.
// If local: "http://localhost:8000/api/v1/fetch"
// If deployed: "https://your-render-app-name.onrender.com/api/v1/fetch"
const API_URL = "http://localhost:8000/api/v1/fetch"; 

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'markdown'
  const [copied, setCopied] = useState(false);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      // Handle server errors (e.g., 404, 500)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      // Handle network errors (Backend not running)
      if (err.message === "Failed to fetch") {
        setError("Cannot connect to server. Is the backend running?");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!data) return;
    const textToCopy = activeTab === 'text' ? data.transcript_text : data.transcript_markdown;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="w-full border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Youtube size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              fetch<span className="text-blue-400">Transcript</span>
            </span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            <a href="#tool" className="hover:text-white transition">Tool</a>
            <a href="#benefits" className="hover:text-white transition">Benefits</a>
            <a href="#guide" className="hover:text-white transition">Guide</a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12" id="tool">
        
        {/* --- HERO --- */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-4">
            <Zap size={12} /> Free YouTube Transcript Generator
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400 mb-6 leading-tight">
            Extract YouTube Transcripts <br/> in One Click
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Instantly convert YouTube videos into plain text or Markdown with timestamps. 
            The essential tool for content creators, researchers, and SEO professionals.
          </p>

          {/* --- INPUT FORM --- */}
          <form onSubmit={handleFetch} className="relative max-w-2xl mx-auto z-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-slate-900 rounded-xl p-2 flex items-center gap-2 border border-white/10 shadow-2xl">
                <input
                  type="text"
                  placeholder="Paste YouTube URL (e.g., https://youtu.be/...)"
                  className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder:text-slate-600 w-full"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {loading ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
            </div>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {/* --- RESULTS SECTION --- */}
        {data && (
          <div className="bg-slate-800/50 border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 mb-20">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-800/80 gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'text' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  <div className="flex items-center justify-center gap-2"><FileText size={16}/> Plain Text</div>
                </button>
                <button 
                  onClick={() => setActiveTab('markdown')}
                  className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'markdown' ? 'bg-blue-600/20 text-blue-400 border border-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  <div className="flex items-center justify-center gap-2"><Code size={16}/> Markdown</div>
                </button>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold hidden sm:block">
                  {data.word_count} words
                </span>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition"
                >
                  {copied ? <Check size={16} className="text-green-400"/> : <Copy size={16}/>}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar bg-slate-900/30">
              <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed text-sm md:text-base">
                {activeTab === 'text' ? data.transcript_text : data.transcript_markdown}
              </pre>
            </div>
          </div>
        )}

        {/* --- HIGH VALUE SEO CONTENT --- */}
        <section id="benefits" className="py-16 border-t border-white/5">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="text-blue-400" size={32}/>,
                title: "Save Hours of Manual Typing",
                desc: "Never manually transcribe a video again. Get accurate text in seconds for meetings, lectures, or podcasts."
              },
              {
                icon: <Globe className="text-purple-400" size={32}/>,
                title: "Boost SEO Rankings",
                desc: "Turn video content into blog posts. Search engines crawl text, not video. Make your content discoverable."
              },
              {
                icon: <BookOpen className="text-emerald-400" size={32}/>,
                title: "Streamline Research",
                desc: "Perfect for students and researchers. Quickly scan through video content to find quotes and data points."
              }
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/30 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition duration-300">
                <div className="mb-4 bg-slate-900/50 w-16 h-16 rounded-xl flex items-center justify-center">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="guide" className="prose prose-invert prose-lg max-w-none mt-10">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-8">Comprehensive Guide to YouTube Transcripts</h2>
            
            <h3 className="text-xl font-semibold text-blue-200">What is a Transcript Fetcher?</h3>
            <p className="text-slate-400 mb-6">
              A YouTube Transcript Fetcher is a utility tool that accesses the closed captions (CC) or auto-generated subtitles of a YouTube video and converts them into a downloadable text format. Insightforge uses advanced API handling to ensure you get the most accurate text available, preserving the timeline of the spoken content.
            </p>

            <h3 className="text-xl font-semibold text-blue-200">Why are Transcripts Essential for Creators?</h3>
            <p className="text-slate-400 mb-6">
              Repurposing content is the secret to scaling a digital presence. A single 10-minute video contains approximately 1,500 to 2,000 words. By extracting this text, you can create:
            </p>
            <ul className="list-disc list-inside text-slate-400 mb-8 space-y-2">
              <li><strong>SEO-Optimized Blog Posts:</strong> Google loves long-form content.</li>
              <li><strong>Twitter Threads / LinkedIn Posts:</strong> Extract punchy quotes and insights.</li>
              <li><strong>Newsletters:</strong> Summarize your video for email subscribers.</li>
              <li><strong>Study Notes:</strong> Highlight key takeaways from educational videos.</li>
            </ul>

            <h3 className="text-xl font-semibold text-blue-200">How to use Insightforge Transcript Tool</h3>
            <ol className="list-decimal list-inside text-slate-400 space-y-4 mb-8">
              <li><strong>Copy URL:</strong> Navigate to your target YouTube video and copy the link from the address bar. Short links (youtu.be) are supported.</li>
              <li><strong>Paste & Fetch:</strong> Enter the URL into the input field above and hit the "Fetch" button.</li>
              <li><strong>Review Data:</strong> The tool will instantly display the word count and the full text.</li>
              <li><strong>Export:</strong> Choose "Markdown" if you use tools like Notion, Obsidian, or GitHub. Use "Plain Text" for Word documents or emails.</li>
            </ol>

            <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Shield className="text-blue-400 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-blue-100">Privacy & Security</h4>
                <p className="text-sm text-blue-200/70 mt-1">
                  We do not store your search history or the transcripts you generate. This tool operates in real-time to ensure your data remains private.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-slate-900 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-6 mb-8 text-slate-400">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Contact</a>
          </div>
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} insightforge.ai. 
            <br/>All rights reserved. Not affiliated with YouTube.
          </p>
        </div>
      </footer>
    </div>
  );
}