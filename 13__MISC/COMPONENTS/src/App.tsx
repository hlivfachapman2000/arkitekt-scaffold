import { useState } from "react"

const TABS = ["welcome", "board", "globe", "dropzone", "display"] as const

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("welcome")
  return (<div className="min-h-screen bg-black text-white p-8"><h1 className="text-3xl font-bold">VampDev</h1><p className="text-zinc-500 mt-2">Components loaded</p></div>)
}
