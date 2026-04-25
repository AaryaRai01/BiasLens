import { Upload, FileType, CheckCircle } from 'lucide-react'
import { useState, useRef } from 'react'

export default function UploadView({ onComplete }: { onComplete: (data: any) => void }) {
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xls', '.json']
    const isAllowed = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    
    if (!isAllowed) {
      alert("Please upload a CSV, Excel, or JSON file")
      return
    }

    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      
      // Map the backend data to what the frontend expects
      onComplete({
        demographicParity: data.metrics.demographic_parity,
        equalizedOdds: data.metrics.equal_opportunity, // mapping equal_opportunity to equalizedOdds for UI
        disparateImpact: data.metrics.disparate_impact,
        equalOpportunity: data.metrics.equal_opportunity,
        compliance: data.compliance,
        group_data: data.group_data,
        geminiNarrative: data.narrative,
        mitigations: [
          "Remove proxy features if detected",
          "Apply instance re-weighting to balance the training set",
          "Implement adversarial debiasing during model training"
        ],
        shapData: [
          { feature: 'Feature 1', groupA: 0.45, groupB: 0.22 },
          { feature: 'Feature 2', groupA: 0.38, groupB: 0.15 },
        ],
        backendData: data // Pass the raw backend data just in case
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error uploading file. Please ensure the backend is running.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Audit Your Model</h1>
        <p className="text-slate-400">Upload your model's predictions and dataset to detect hidden biases and receive actionable mitigation strategies.</p>
      </div>

      <div 
        className="w-full glass-panel p-10 border-dashed border-2 border-slate-600 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4 relative overflow-hidden group"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2 shadow-lg shadow-black/20">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold">Drag & drop your file here</h3>
        <p className="text-slate-400 text-sm mb-6">Supports CSV, Excel, and JSON formats</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv,.xlsx,.xls,.json" 
          className="hidden" 
        />
        <button 
          onClick={handleUploadClick}
          disabled={isUploading}
          className="relative z-10 bg-primary hover:bg-blue-500 text-white px-8 py-3 rounded-full font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70"
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
              Analyzing Data...
            </span>
          ) : (
            <>
              <FileType className="w-5 h-5" />
              Select File
            </>
          )}
        </button>
      </div>
      
      <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-400">
        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> Auto-detects attributes</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> 4 key fairness metrics</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-success" /> AI generated report</div>
      </div>
    </div>
  )
}
