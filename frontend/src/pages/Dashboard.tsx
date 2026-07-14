import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { 
  Play, BookOpen, Layers, ShieldAlert, 
  Settings, History, 
  Trash2, Upload, RotateCcw, Copy, Check, FileDown, LogOut,
  Terminal, Info, Star, Award, Plus
} from 'lucide-react';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import { Navbar } from '../App';

interface LineCommentary {
  line_or_range: string;
  code_snippet: string;
  explanation: string;
}

interface DryRunStep {
  step_number: number;
  code_line: string;
  state_description: string;
}

interface VariableDetail {
  name: string;
  data_type: string;
  role: string;
}

interface FunctionDetail {
  name: string;
  inputs: string;
  outputs: string;
  logic: string;
}

interface ImprovementSuggestion {
  category: string;
  description: string;
  before_code: string;
  after_code: string;
}

interface SecurityIssue {
  category: string;
  severity: string;
  description: string;
  remediation: string;
}

interface QuizMCQ {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface QuizTrueFalse {
  question: string;
  correct_answer: boolean;
  explanation: string;
}

interface QuizFillBlank {
  question: string;
  correct_answer: string;
  explanation: string;
}

interface QuizCodingQuestion {
  question: string;
  starting_code: string;
  sample_solution: string;
  explanation: string;
}

interface QuizPayload {
  mcqs: QuizMCQ[];
  true_false: QuizTrueFalse[];
  fill_blanks: QuizFillBlank[];
  coding_questions: QuizCodingQuestion[];
}

interface InterviewQuestion {
  difficulty: string;
  question: string;
  model_answer: string;
}

interface PracticeProblem {
  title: string;
  difficulty: string;
  description: string;
  reference_url?: string;
}

interface ExplanationResult {
  id: number;
  code_snippet: string;
  language: string;
  model: string;
  created_at: string;
  is_favorite: boolean;
  
  summary: string;
  who_should_understand?: string;
  purpose_of_code?: string;
  plain_explanation: string;
  time_complexity: string;
  space_complexity: string;
  complexity_rationale: string;
  
  line_by_line: LineCommentary[];
  dry_run: DryRunStep[];
  variables: VariableDetail[];
  functions: FunctionDetail[];
  suggestions: ImprovementSuggestion[];
  security_issues: SecurityIssue[];
  quiz: QuizPayload;
  interview_questions: InterviewQuestion[];
  similar_problems: PracticeProblem[];
  related_concepts: string[];
}

const EXAMPLE_CODES: Record<string, string> = {
  Python: `def fibonacci(n):
    # Returns a list of Fibonacci numbers up to n terms
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    fib_sequence = [0, 1]
    while len(fib_sequence) < n:
        fib_sequence.append(fib_sequence[-1] + fib_sequence[-2])
    return fib_sequence`,

  JavaScript: `function binarySearch(arr, target) {
    // Perform binary search on a sorted array
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) {
            return mid; // Target found
        } else if (arr[mid] < target) {
            left = mid + 1; // Search right
        } else {
            right = mid - 1; // Search left
        }
    }
    return -1; // Not found
}`,

  C: `#include <stdio.h>

// Reverse string function
void reverseString(char str[], int length) {
    int start = 0;
    int end = length - 1;
    while (start < end) {
        char temp = str[start];
        str[start] = str[end];
        str[end] = temp;
        start++;
        end--;
    }
}`,

  C_Plus_Plus: `#include <iostream>
#include <vector>

// Recursive function to calculate factorial
unsigned long long factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}`,

  Java: `public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        boolean swapped;
        for (int i = 0; i < n - 1; i++) {
            swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}`,

  Go: `package main

import "fmt"

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}`
};

const LANGUAGES = [
  "Python", "JavaScript", "C", "C++", "Java", "Go", "TypeScript", 
  "Rust", "PHP", "Ruby", "Swift", "Kotlin", "SQL", "HTML", "CSS", "Bash"
];

export const Dashboard: React.FC = () => {
  const { token, user, logout } = useAuth();
  
  const [code, setCode] = useState(EXAMPLE_CODES.Python);
  const [language, setLanguage] = useState("Python");
  const [model, setModel] = useState("gemini-2.5-flash");


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("explain");

  // Explanations list states
  const [historyList, setHistoryList] = useState<ExplanationResult[]>([]);
  const [favoritesList, setFavoritesList] = useState<ExplanationResult[]>([]);
  const [selectedExplanation, setSelectedExplanation] = useState<ExplanationResult | null>(null);
  
  // Search history state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLang, setSearchLang] = useState("All");

  // Interaction trackers
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryList(response.data);
      
      const favResponse = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoritesList(favResponse.data);
    } catch (err) {
      console.error("Failed to fetch explanations list", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);



  // Run AI analysis
  const handleExplain = async () => {
    if (!code.trim()) {
      setError("Please write or paste a code snippet first.");
      return;
    }
    
    setError(null);
    setLoading(true);
    setSelectedExplanation(null);
    setRevealedAnswers({});

    try {
      const response = await axios.post(
        `${API_BASE_URL}/explain`,
        {
          code_snippet: code,
          language: language,
          model: model
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedExplanation(response.data);
      // Refresh sidebar list
      await fetchHistory();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Failed to generate analysis. Check API Key or try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite state
  const handleToggleFavorite = async (id: number) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/favorite/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update selected item state
      if (selectedExplanation?.id === id) {
        setSelectedExplanation(response.data);
      }
      
      await fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete history item
  const handleDeleteItem = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this explanation history item?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (selectedExplanation?.id === id) {
        setSelectedExplanation(null);
      }
      
      await fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle code upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCode(text);
      }
    };
    reader.readAsText(file);
  };

  // Setup example loader
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // Auto map to preset key
    const mappingKey = lang.replace("++", "_Plus_Plus");
    if (EXAMPLE_CODES[mappingKey]) {
      setCode(EXAMPLE_CODES[mappingKey]);
    }
  };

  // Copy results clipboard
  const handleCopyClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Export results file
  const handleExportFile = (format: 'json' | 'md' | 'text') => {
    if (!selectedExplanation) return;
    
    let content = "";
    let filename = `codeexplain_${selectedExplanation.id}`;
    
    if (format === 'json') {
      content = JSON.stringify(selectedExplanation, null, 2);
      filename += ".json";
    } else if (format === 'md') {
      content = `# CodeExplanation Tutorial\n\n## 1. Quick Summary\n${selectedExplanation.summary}\n\n## 2. Plain English Walkthrough\n${selectedExplanation.plain_explanation}\n\n## 3. Complexity Analysis\nTime Complexity: ${selectedExplanation.time_complexity}\nSpace Complexity: ${selectedExplanation.space_complexity}\n\n${selectedExplanation.complexity_rationale}`;
      filename += ".md";
    } else {
      content = `CodeExplain Explanation Report\n=================================\n\nSummary:\n${selectedExplanation.summary}\n\nWalkthrough:\n${selectedExplanation.plain_explanation}`;
      filename += ".txt";
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reveal quiz key logic
  const toggleAnswer = (key: string) => {
    setRevealedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter history based on search query
  const filteredHistory = historyList.filter(item => {
    const matchesSearch = item.summary.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.code_snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = searchLang === "All" || item.language === searchLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-slate-200">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Dashboard */}
        <aside className="w-80 border-r border-borderDark/60 bg-white shrink-0 flex flex-col justify-between overflow-y-auto">
          <div className="p-5 space-y-6">
            
            {/* New Sandbox Action */}
            <button
              onClick={() => {
                setSelectedExplanation(null);
                setCode(EXAMPLE_CODES.Python);
                setLanguage("Python");
                setError(null);
              }}
              className="w-full py-3 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-accentPurpleLight to-accentPurple hover:scale-[1.01] hover:shadow-lg hover:shadow-accentPurple/10 transition-all flex items-center justify-center gap-2 border border-accentPurpleLight/20 shadow-md shadow-accentPurple/5"
            >
              <Plus className="w-5 h-5 text-white" />
              <span>New Sandbox</span>
            </button>
            
            {/* Configuration Settings */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Settings className="w-4 h-4 text-accentPurple" />
                <span>Configuration Settings</span>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <p>Gemini AI connection is fully active with global credentials.</p>
              </div>
            </div>

            <hr className="border-borderDark/40" />

            {/* History Filter and Search */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-accentPurple" />
                  <span>Recent Walkthroughs</span>
                </div>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-700 font-semibold shadow-sm">
                  {filteredHistory.length}
                </span>
              </div>
              
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Search explanations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-55 border border-slate-200 focus:border-accentPurple outline-none text-xs text-slate-800 shadow-sm"
                />
                
                <select
                  value={searchLang}
                  onChange={(e) => setSearchLang(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-slate-55 border border-slate-200 focus:border-accentPurple outline-none text-xs text-slate-800 shadow-sm"
                >
                  <option value="All">All Languages</option>
                  {LANGUAGES.map((lang, idx) => (
                    <option key={idx} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* History list wrapper */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No explanations saved yet.</p>
                ) : (
                  filteredHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedExplanation(item)}
                      className={`group p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedExplanation?.id === item.id
                          ? 'bg-accentPurple/10 border-accentPurple/50'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span className="text-[10px] font-bold text-accentEmerald bg-accentPurple/10 px-2 py-0.5 rounded-md">
                          {item.language}
                        </span>
                        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(item.id);
                            }}
                            className="p-0.5 hover:text-amber-500"
                          >
                            {item.is_favorite ? (
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            ) : (
                              <Star className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                          <button 
                            onClick={(e) => handleDeleteItem(item.id, e)} 
                            className="p-0.5 hover:text-red-500 text-slate-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-accentEmerald transition-colors">
                        {item.summary}
                      </p>
                      <span className="text-[9px] text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Footer details */}
          <div className="p-5 border-t border-borderDark/40 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by Gemini AI</span>
            <button 
              onClick={logout} 
              className="flex items-center gap-1 hover:text-red-500 transition-colors font-semibold"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Work Station */}
        <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Header Actions banner */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Terminal className="text-accentPurple" /> Editor Workspace
              </h2>
              <p className="text-sm text-slate-600">Specify language rules, upload files, write scripts, and click Explain Code.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Language Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase">Language</label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-semibold text-slate-800 shadow-sm"
                >
                  {LANGUAGES.map((lang, idx) => (
                    <option key={idx} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              {/* Model Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-semibold uppercase">AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm font-semibold text-accentPurple shadow-sm"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Reasoning)</option>
                </select>
              </div>

              {/* Custom controls */}
              <div className="flex items-end h-[44px] gap-2 pt-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".py,.js,.ts,.java,.cpp,.go,.sql,.html,.css,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload source file"
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600 shadow-sm"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCode("")}
                  title="Clear editor"
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600 shadow-sm"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 flex flex-col shadow-sm">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
              <Editor
                height="320px"
                language={language.toLowerCase() === "c++" ? "cpp" : language.toLowerCase()}
                theme="light"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  wordWrap: "on",
                  fontSize: 14,
                  padding: { top: 12, bottom: 12 },
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="flex items-center justify-center mt-5">
              <button
                onClick={handleExplain}
                disabled={loading}
                className="w-full md:w-fit px-12 py-3.5 rounded-xl text-white font-bold glass-btn flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform shadow-sm"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Explain Code Snippet</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loader animation */}
          {loading && (
            <div className="glass-panel p-16 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accentPurple"></div>
              <h3 className="text-xl font-bold text-slate-900">Synthesizing Detailed Walkthrough...</h3>
              <p className="text-sm text-slate-600 max-w-sm">Gemini is compiling plain-English reviews, dry runs, complex Big O charts, refactoring codes, and tests.</p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm shadow-sm">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold mb-1">Execution Failure</h4>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Results section */}
          {selectedExplanation && !loading && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
              
              {/* Header result actions banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <Star
                     onClick={() => handleToggleFavorite(selectedExplanation.id)}
                     className={`w-6 h-6 cursor-pointer ${
                       selectedExplanation.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400 hover:text-amber-400'
                     }`}
                  />
                  <h3 className="text-xl font-bold text-slate-900">Analysis Results</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyClipboard(JSON.stringify(selectedExplanation, null, 2), 'json')}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-all flex items-center gap-1.5 text-slate-700 shadow-sm"
                  >
                    {copiedSection === 'json' ? <Check className="w-4 h-4 text-accentEmerald" /> : <Copy className="w-4 h-4" />}
                    <span>Copy JSON</span>
                  </button>
                  <button
                    onClick={() => handleExportFile('md')}
                    className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold hover:bg-slate-100 transition-all flex items-center gap-1.5 text-slate-700 shadow-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download MD</span>
                  </button>
                </div>
              </div>

              {/* Core tabs navigation */}
              <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-1">
                {[
                  { id: "explain", label: "📖 Explanations", icon: <BookOpen className="w-4 h-4" /> },
                  { id: "metrics", label: "⚡ Code Metrics", icon: <Layers className="w-4 h-4" /> },
                  { id: "refactors", label: "💡 Refactors & Security", icon: <ShieldAlert className="w-4 h-4" /> },
                  { id: "quiz", label: "🎯 Exercises & Quiz", icon: <Award className="w-4 h-4" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all shrink-0 ${
                      activeTab === tab.id
                        ? 'bg-accentPurple text-white shadow-lg shadow-accentPurple/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab 1: Explanations */}
              {activeTab === "explain" && (
                <div className="space-y-6">
                  {/* Quick Summary card */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="glass-card p-5 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Quick Summary</h4>
                      <p className="text-sm text-slate-800">{selectedExplanation.summary}</p>
                    </div>
                    <div className="glass-card p-5 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Ideal Audience</h4>
                      <p className="text-sm text-slate-800">{selectedExplanation.who_should_understand}</p>
                    </div>
                    <div className="glass-card p-5 rounded-xl border border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">High-level Objective</h4>
                      <p className="text-sm text-slate-800 font-semibold text-accentEmerald">{selectedExplanation.purpose_of_code || selectedExplanation.summary}</p>
                    </div>
                  </div>

                  {/* Detailed layman text */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="text-lg font-bold text-slate-900">Plain English Explanation</h4>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedExplanation.plain_explanation}</p>
                  </div>

                  {/* Line by line table */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-lg font-bold text-slate-900">Line-by-Line Commentary</h4>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                            <th className="p-4 w-28">Line</th>
                            <th className="p-4 w-80">Snippet</th>
                            <th className="p-4">Explanation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExplanation.line_by_line.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="p-4 font-semibold text-accentEmerald text-xs">{item.line_or_range}</td>
                              <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-1.5 rounded border border-slate-200 font-mono text-slate-800">{item.code_snippet}</code></td>
                              <td className="p-4 text-slate-700 leading-relaxed text-xs">{item.explanation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Code Metrics */}
              {activeTab === "metrics" && (
                <div className="space-y-6">
                  {/* Complexity cards */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-xl border border-slate-200 border-l-4 border-l-accentPurple">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Complexity</h4>
                      <p className="text-3xl font-bold text-accentPurple my-2 font-mono">{selectedExplanation.time_complexity}</p>
                    </div>
                    <div className="glass-card p-6 rounded-xl border border-slate-200 border-l-4 border-l-accentEmerald">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Space Complexity</h4>
                      <p className="text-3xl font-bold text-accentEmerald my-2 font-mono">{selectedExplanation.space_complexity}</p>
                    </div>
                  </div>

                  <div className="glass-card p-6 rounded-xl border border-slate-200">
                    <h4 className="text-base font-bold text-slate-900 mb-2">Complexity Assessment Rationale</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedExplanation.complexity_rationale}</p>
                  </div>

                  {/* Dry Run Simulation */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-lg font-bold text-slate-900">Dry Run Simulation</h4>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                            <th className="p-4 w-20">Step</th>
                            <th className="p-4 w-72">Executing Code Line</th>
                            <th className="p-4">Simulated Variable State</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExplanation.dry_run.map((step, idx) => (
                            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="p-4 font-bold text-accentEmerald text-xs">{step.step_number}</td>
                              <td className="p-4"><code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-800">{step.code_line}</code></td>
                              <td className="p-4 text-slate-700 font-mono text-xs">{step.state_description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Variables table */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-lg font-bold text-slate-900">Variables Map</h4>
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                              <th className="p-3">Name</th>
                              <th className="p-3">Type</th>
                              <th className="p-3">Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedExplanation.variables.map((val, idx) => (
                              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="p-3 font-semibold text-accentEmerald text-xs">{val.name}</td>
                                <td className="p-3"><span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-slate-800">{val.data_type}</span></td>
                                <td className="p-3 text-slate-700 text-xs">{val.role}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Functions details */}
                    <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-lg font-bold text-slate-900">Declared Functions</h4>
                      {selectedExplanation.functions.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No custom functions declared.</p>
                      ) : (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                          {selectedExplanation.functions.map((func, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-900 text-sm">{func.name}()</span>
                              </div>
                              <div className="text-[11px] text-slate-500 space-y-1">
                                <div><span className="font-semibold text-accentPurple">Inputs:</span> {func.inputs}</div>
                                <div><span className="font-semibold text-accentEmerald">Outputs:</span> {func.outputs}</div>
                              </div>
                              <p className="text-xs text-slate-700">{func.logic}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Security & Refactors */}
              {activeTab === "refactors" && (
                <div className="space-y-6">
                  {/* Security Checks */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-lg font-bold text-slate-900">Security & Code Smells Assessment</h4>
                    <div className="space-y-3">
                      {selectedExplanation.security_issues.map((issue, idx) => {
                        const isHigh = issue.severity.toLowerCase() === 'high';
                        const isNone = issue.severity.toLowerCase() === 'none' || issue.category.toLowerCase() === 'none';
                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl border ${
                              isNone 
                                ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-700'
                                : isHigh 
                                  ? 'bg-red-500/5 border-red-500/30 text-slate-800' 
                                  : 'bg-amber-500/5 border-amber-500/30 text-slate-800'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-slate-900 text-sm">{issue.category}</span>
                              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                isNone 
                                  ? 'bg-emerald-500/20 text-emerald-600'
                                  : isHigh 
                                    ? 'bg-red-500/20 text-red-600' 
                                    : 'bg-amber-500/20 text-amber-600'
                              }`}>
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 mb-2">{issue.description}</p>
                            {!isNone && (
                              <div className="text-[11px] text-slate-600">
                                <span className="font-bold text-accentPurple">Fix:</span> {issue.remediation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Refactoring suggestions */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-lg font-bold text-slate-900">Suggested Refactorings</h4>
                    {selectedExplanation.suggestions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No suggestions provided.</p>
                    ) : (
                      <div className="space-y-6">
                        {selectedExplanation.suggestions.map((sug, idx) => (
                          <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                            <div>
                              <span className="text-[10px] font-bold text-accentEmerald bg-accentPurple/10 px-2.5 py-1 rounded-md uppercase">
                                {sug.category}
                              </span>
                              <p className="text-xs text-slate-700 mt-2">{sug.description}</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase">Original snippet</span>
                                <pre className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono overflow-x-auto text-slate-600">{sug.before_code}</pre>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase">Optimized layout</span>
                                <pre className="p-3 rounded-lg bg-slate-100 border border-accentPurple/30 text-xs font-mono overflow-x-auto text-accentEmerald font-bold">{sug.after_code}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Exercises & Interview */}
              {activeTab === "quiz" && (
                <div className="space-y-8">
                  {/* MCQs */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-6">
                    <h4 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <span>MCQ Quiz</span>
                      <span className="text-xs bg-accentPurple/20 text-accentPurple px-2 py-0.5 rounded-full font-bold">10 Questions</span>
                    </h4>
                    
                    <div className="space-y-6">
                      {selectedExplanation.quiz.mcqs.map((q, idx) => {
                        const answerKey = `mcq-${idx}`;
                        const isRevealed = !!revealedAnswers[answerKey];
                        return (
                          <div key={idx} className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="font-semibold text-slate-800 text-sm">{idx + 1}. {q.question}</div>
                            <div className="grid sm:grid-cols-2 gap-2 text-xs">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="px-3.5 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                                  {opt}
                                </div>
                              ))}
                            </div>
                            
                            <div className="pt-2 flex flex-col gap-2">
                              <button
                                onClick={() => toggleAnswer(answerKey)}
                                className="w-fit text-xs font-bold text-accentPurple hover:text-slate-900 transition-colors"
                              >
                                {isRevealed ? "Hide Answer" : "Reveal Answer"}
                              </button>
                              {isRevealed && (
                                <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-700 space-y-1 animate-fadeIn">
                                  <div><span className="font-bold text-accentEmerald">Correct Answer:</span> {q.correct_answer}</div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* True False */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-6">
                    <h4 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <span>True / False</span>
                      <span className="text-xs bg-accentPurple/20 text-accentPurple px-2 py-0.5 rounded-full font-bold">5 Questions</span>
                    </h4>
                    
                    <div className="space-y-6">
                      {selectedExplanation.quiz.true_false.map((q, idx) => {
                        const answerKey = `tf-${idx}`;
                        const isRevealed = !!revealedAnswers[answerKey];
                        return (
                          <div key={idx} className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="font-semibold text-slate-800 text-sm">{idx + 1}. {q.question}</div>
                            
                            <div className="pt-2 flex flex-col gap-2">
                              <button
                                onClick={() => toggleAnswer(answerKey)}
                                className="w-fit text-xs font-bold text-accentPurple hover:text-slate-900 transition-colors"
                              >
                                {isRevealed ? "Hide Answer" : "Reveal Answer"}
                              </button>
                              {isRevealed && (
                                <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-700 space-y-1">
                                  <div><span className="font-bold text-accentEmerald">Correct Answer:</span> {q.correct_answer ? "True" : "False"}</div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fill Blanks */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-6">
                    <h4 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <span>Fill in the Blanks</span>
                      <span className="text-xs bg-accentPurple/20 text-accentPurple px-2 py-0.5 rounded-full font-bold">5 Questions</span>
                    </h4>
                    
                    <div className="space-y-6">
                      {selectedExplanation.quiz.fill_blanks.map((q, idx) => {
                        const answerKey = `fb-${idx}`;
                        const isRevealed = !!revealedAnswers[answerKey];
                        return (
                          <div key={idx} className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="font-semibold text-slate-800 text-sm">{idx + 1}. {q.question}</div>
                            
                            <div className="pt-2 flex flex-col gap-2">
                              <button
                                onClick={() => toggleAnswer(answerKey)}
                                className="w-fit text-xs font-bold text-accentPurple hover:text-slate-900 transition-colors"
                              >
                                {isRevealed ? "Hide Answer" : "Reveal Answer"}
                              </button>
                              {isRevealed && (
                                <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-700 space-y-1">
                                  <div><span className="font-bold text-accentEmerald">Answer:</span> {q.correct_answer}</div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coding questions */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-6">
                    <h4 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <span>Interactive Coding Tasks</span>
                      <span className="text-xs bg-accentPurple/20 text-accentPurple px-2 py-0.5 rounded-full font-bold">3 Tasks</span>
                    </h4>
                    
                    <div className="space-y-6">
                      {selectedExplanation.quiz.coding_questions.map((q, idx) => {
                        const answerKey = `codeq-${idx}`;
                        const isRevealed = !!revealedAnswers[answerKey];
                        return (
                          <div key={idx} className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                            <div className="font-semibold text-slate-800 text-sm">{idx + 1}. {q.question}</div>
                            <pre className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono overflow-x-auto text-slate-600">{q.starting_code}</pre>
                            
                            <div className="pt-2 flex flex-col gap-2">
                              <button
                                onClick={() => toggleAnswer(answerKey)}
                                className="w-fit text-xs font-bold text-accentPurple hover:text-slate-900 transition-colors"
                              >
                                {isRevealed ? "Hide Solution" : "Reveal Solution"}
                              </button>
                              {isRevealed && (
                                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-slate-700 space-y-3">
                                  <div>
                                    <span className="font-bold text-accentEmerald">Sample Solution:</span>
                                    <pre className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono overflow-x-auto text-slate-800 mt-1">{q.sample_solution}</pre>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interview Preparation */}
                  <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-6">
                    <h4 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                      <span>Interview Prep Q&A</span>
                    </h4>
                    
                    <div className="space-y-6">
                      {selectedExplanation.interview_questions.map((q, idx) => {
                        const answerKey = `interview-${idx}`;
                        const isRevealed = !!revealedAnswers[answerKey];
                        return (
                          <div key={idx} className="space-y-3 p-4 rounded-xl border border-slate-200 bg-slate-55">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[10px] font-bold text-accentEmerald bg-accentPurple/10 px-2 py-0.5 rounded-md uppercase">
                                {q.difficulty}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-800 text-sm">{q.question}</div>
                            
                            <div className="pt-2 flex flex-col gap-2">
                              <button
                                onClick={() => toggleAnswer(answerKey)}
                                className="w-fit text-xs font-bold text-accentPurple hover:text-slate-900 transition-colors"
                              >
                                {isRevealed ? "Hide Model Response" : "Reveal Model Response"}
                              </button>
                              {isRevealed && (
                                <div className="p-3.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-sm">
                                  {q.model_answer}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Similar Practice & Concepts */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-lg font-bold text-slate-900">Recommended Practice Problems</h4>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {selectedExplanation.similar_problems.map((prob, idx) => (
                          <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-55 flex justify-between items-center gap-2 text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{prob.title}</div>
                              <p className="text-[10px] text-slate-500 mt-0.5">{prob.description}</p>
                            </div>
                            <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 shadow-sm">
                              {prob.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card p-6 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-lg font-bold text-slate-900">Next Learning Concepts</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedExplanation.related_concepts.map((concept, idx) => (
                          <span key={idx} className="text-xs px-3 py-1.5 rounded-full bg-accentPurple/10 border border-accentPurple/20 text-accentPurple font-semibold">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Welcome placeholder */}
          {!selectedExplanation && !loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto mt-8 shadow-sm">
              <div className="p-4 rounded-full bg-accentPurple/10 text-accentPurple">
                <Info className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Welcome to CodeExplain Dashboard Workspace!</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Paste your code, load an example snippet, or upload a script file. Once configurations are complete, click **Explain Code Snippet** to trigger the AI-tutor analysis.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
