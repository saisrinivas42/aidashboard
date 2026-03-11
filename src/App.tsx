/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Search, 
  Database, 
  BarChart3, 
  LineChart, 
  PieChart, 
  AlertCircle, 
  Loader2, 
  Terminal,
  Table as TableIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface GeminiResponse {
  sql_query: string;
  chart_type: 'bar_chart' | 'line_chart' | 'pie_chart' | 'metric';
  x_axis: string;
  y_axis: string;
  error?: string;
}

interface QueryResult {
  data: any[];
  config: GeminiResponse;
}

// --- Constants ---

const COLORS = ['#141414', '#5A5A40', '#F27D26', '#00FF00', '#FF4444', '#4A4A4A', '#8E9299'];

const SYSTEM_INSTRUCTION = `
You are an AI assistant that converts natural language business questions into SQL queries and dashboard chart suggestions.
The database is SQLite.

Database Schema:
Table: cars
Columns:
- id (INTEGER)
- model (VARCHAR)
- year (INTEGER)
- price (INTEGER)
- transmission (VARCHAR)
- mileage (INTEGER)
- fuelType (VARCHAR)
- tax (INTEGER)
- mpg (REAL)
- engineSize (REAL)

Instructions:
1. Read the user's question.
2. Generate a correct SQL query using the available table and columns.
3. Suggest the best chart type for visualization.
4. IMPORTANT: You MUST use aliases in your SQL query that match the "x_axis" and "y_axis" names you provide in the JSON.
   Example: SELECT model AS model_name, AVG(price) AS average_price ... -> x_axis: "model_name", y_axis: "average_price"
5. Return the response in JSON format.

Chart Selection Rules:
* If the question asks for a single number (e.g., "What is the average price?") → use "metric"
* If the query contains time/year/trend → use "line_chart"
* If comparing categories (model, transmission, fuelType) → use "bar_chart"
* If showing a distribution, breakdown, or share of a category (e.g., "Distribution of fuel types") → use "pie_chart"

Response Format:
{
  "sql_query": "SQL QUERY HERE",
  "chart_type": "bar_chart / line_chart / pie_chart / metric",
  "x_axis": "column_alias_for_x",
  "y_axis": "column_alias_for_y_or_value"
}

If the question cannot be answered using the data, return:
{
  "error": "Data not available for this query"
}
`;

export default function App() {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  const handleQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Call Gemini to get SQL and Chart Config
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: question,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sql_query: { type: Type.STRING },
              chart_type: { type: Type.STRING, enum: ["bar_chart", "line_chart", "pie_chart", "metric"] },
              x_axis: { type: Type.STRING },
              y_axis: { type: Type.STRING },
              error: { type: Type.STRING }
            }
          }
        },
      });

      const geminiData = JSON.parse(response.text) as GeminiResponse;

      if (geminiData.error) {
        setError(geminiData.error);
        setIsLoading(false);
        return;
      }

      // 2. Execute SQL on Backend
      const dbResponse = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: geminiData.sql_query }),
      });

      const dbData = await dbResponse.json();

      if (dbData.error) {
        setError(`Database Error: ${dbData.error}`);
      } else {
        setResult({
          data: dbData.data,
          config: geminiData
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!result || !result.data || result.data.length === 0) {
      return <div className="p-8 text-center text-zinc-500 font-mono text-sm">No data returned for this query.</div>;
    }
    
    const { data, config } = result;

    // Auto-detect metric if Gemini missed it but we only have one value
    const isActuallyMetric = config.chart_type === 'metric' || (data.length === 1 && Object.keys(data[0]).length === 1);
    const effectiveChartType = isActuallyMetric ? 'metric' : config.chart_type;
    const effectiveYAxis = isActuallyMetric ? Object.keys(data[0])[0] : config.y_axis;

    // Validate keys exist in data
    const firstRow = data[0];
    const hasX = config.x_axis in firstRow;
    const hasY = effectiveYAxis in firstRow;

    if (effectiveChartType !== 'metric' && (!hasX || !hasY)) {
      console.warn("Missing keys in data:", { expected: [config.x_axis, effectiveYAxis], actual: Object.keys(firstRow) });
      return (
        <div className="p-8 border border-amber-200 bg-amber-50 rounded-xl text-amber-800 text-sm font-mono">
          <p className="font-bold mb-2 uppercase tracking-tight">Visualization Error</p>
          <p>The generated query returned data that doesn't match the expected chart axes.</p>
          <p className="mt-2 opacity-70">Expected: {config.x_axis}, {effectiveYAxis}</p>
          <p className="opacity-70">Found: {Object.keys(firstRow).join(', ')}</p>
        </div>
      );
    }

    switch (effectiveChartType) {
      case 'metric':
        const val = data[0][effectiveYAxis];
        return (
          <div className="flex flex-col items-center justify-center p-12 bg-[#F5F5F5] rounded-3xl border border-[#141414]/10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50 mb-2">{effectiveYAxis.replace(/_/g, ' ')}</p>
            <p className="text-6xl font-bold tracking-tighter">
              {typeof val === 'number' ? (val > 1000 ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : val.toFixed(2)) : String(val)}
            </p>
          </div>
        );
      case 'bar_chart':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ReBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3E0" />
              <XAxis 
                dataKey={config.x_axis} 
                axisLine={{ stroke: '#141414' }}
                tick={{ fill: '#141414', fontSize: 12, fontFamily: 'monospace' }}
                angle={-45}
                textAnchor="end"
              />
              <YAxis 
                axisLine={{ stroke: '#141414' }}
                tick={{ fill: '#141414', fontSize: 12, fontFamily: 'monospace' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', color: '#E4E3E0', border: 'none', borderRadius: '4px' }}
                itemStyle={{ color: '#00FF00' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey={effectiveYAxis} fill="#141414" radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        );
      case 'line_chart':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ReLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E3E0" />
              <XAxis 
                dataKey={config.x_axis} 
                axisLine={{ stroke: '#141414' }}
                tick={{ fill: '#141414', fontSize: 12, fontFamily: 'monospace' }}
              />
              <YAxis 
                axisLine={{ stroke: '#141414' }}
                tick={{ fill: '#141414', fontSize: 12, fontFamily: 'monospace' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', color: '#E4E3E0', border: 'none', borderRadius: '4px' }}
                itemStyle={{ color: '#00FF00' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey={effectiveYAxis} 
                stroke="#141414" 
                strokeWidth={3} 
                dot={{ r: 6, fill: '#141414' }}
                activeDot={{ r: 8, stroke: '#00FF00', strokeWidth: 2 }}
              />
            </ReLineChart>
          </ResponsiveContainer>
        );
      case 'pie_chart':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RePieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                fill="#8884d8"
                dataKey={effectiveYAxis}
                nameKey={config.x_axis}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#141414', color: '#E4E3E0', border: 'none', borderRadius: '4px' }}
              />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return <div className="p-8 text-center text-zinc-500">Unsupported chart type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] p-2 rounded-lg">
            <Database className="text-[#E4E3E0] w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase">InsightSQL</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Business Intelligence Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 border border-[#141414] rounded-full text-[10px] font-mono uppercase">
            <span className="w-2 h-2 bg-[#00FF00] rounded-full animate-pulse" />
            Database Connected
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Query Input */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white border border-[#141414] p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-xs font-mono uppercase tracking-widest opacity-50 italic">Natural Language Query</h2>
            </div>
            
            <form onSubmit={handleQuery} className="space-y-4">
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Show total revenue by region..."
                  className="w-full h-32 p-4 bg-[#F5F5F5] border border-[#141414] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#141414] resize-none font-mono text-sm"
                />
                <Search className="absolute bottom-4 right-4 text-[#141414] opacity-30 w-5 h-5" />
              </div>
              
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                className={cn(
                  "w-full py-4 bg-[#141414] text-[#E4E3E0] rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95",
                  (isLoading || !question.trim()) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Execute Query
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#141414]/10">
              <h3 className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-3">Try these:</h3>
              <div className="space-y-2">
                {[
                  "Average price of all cars",
                  "Distribution of cars by fuel type",
                  "Price trend by year",
                  "Top 5 most expensive models",
                  "Average MPG by transmission type"
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuestion(q); }}
                    className="block w-full text-left p-2 text-xs hover:bg-[#141414] hover:text-[#E4E3E0] rounded transition-colors font-mono"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {result && (
            <section className="bg-[#141414] text-[#E4E3E0] p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,255,0,0.3)]">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-4 h-4 text-[#00FF00]" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-[#00FF00]">Generated SQL</h2>
              </div>
              <pre className="text-xs font-mono bg-black/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {result.config.sql_query}
              </pre>
            </section>
          )}
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="text-red-500 w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-red-900">Query Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {!result && !isLoading && !error && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-[#141414]/20 rounded-2xl opacity-40">
              <Database className="w-16 h-16 mb-4" />
              <p className="font-mono uppercase tracking-widest text-sm text-center px-8">
                Ask a question to generate insights and visualizations
              </p>
            </div>
          )}

          {isLoading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white border border-[#141414] rounded-2xl shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-mono uppercase tracking-widest text-sm animate-pulse">
                Consulting the Oracle...
              </p>
            </div>
          )}

          {result && (
            <section className="bg-white border border-[#141414] rounded-2xl shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
              <div className="border-b border-[#141414] p-4 flex justify-between items-center bg-[#F5F5F5]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('chart')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                      activeTab === 'chart' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-black/5"
                    )}
                  >
                    {result.config.chart_type === 'bar_chart' && <BarChart3 className="w-4 h-4" />}
                    {result.config.chart_type === 'line_chart' && <LineChart className="w-4 h-4" />}
                    {result.config.chart_type === 'pie_chart' && <PieChart className="w-4 h-4" />}
                    Visualization
                  </button>
                  <button
                    onClick={() => setActiveTab('table')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                      activeTab === 'table' ? "bg-[#141414] text-[#E4E3E0]" : "hover:bg-black/5"
                    )}
                  >
                    <TableIcon className="w-4 h-4" />
                    Raw Data
                  </button>
                </div>
                <div className="text-[10px] font-mono opacity-50 uppercase">
                  {result.data.length} Records Found
                </div>
              </div>

              <div className="p-8">
                {activeTab === 'chart' ? (
                  <div className="animate-in fade-in zoom-in-95 duration-500">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                      <span className="italic serif">Analysis:</span>
                      {question}
                    </h3>
                    {renderChart()}
                  </div>
                ) : (
                  <div className="overflow-x-auto animate-in fade-in slide-in-from-bottom-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#141414]">
                          {Object.keys(result.data[0] || {}).map((key) => (
                            <th key={key} className="py-4 px-4 font-mono text-[10px] uppercase tracking-widest opacity-50">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.data.map((row, i) => (
                          <tr key={i} className="border-bottom border-[#141414]/10 hover:bg-[#F5F5F5] transition-colors group">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="py-4 px-4 font-mono text-xs group-hover:font-bold transition-all">
                                {typeof val === 'number' && val > 100 ? val.toLocaleString() : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto p-6 mt-12 border-t border-[#141414]/10 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-30">
          Powered by Google Gemini & SQLite • Built for AI Studio
        </p>
      </footer>
    </div>
  );
}
