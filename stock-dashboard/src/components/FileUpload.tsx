'use client'

import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type FileUploadProps = {
  portfolioId: 'portfolio1' | 'portfolio2'
  portfolioName: string
  onUpload: (file: File, portfolioId: 'portfolio1' | 'portfolio2', portfolioName: string) => Promise<void>
  isLoading?: boolean
  hasData?: boolean
}

const FileUpload = ({ portfolioId, portfolioName, onUpload, isLoading = false, hasData = false }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ]
    const isValidType = validTypes.some(type => 
      file.type === type || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    )
    
    if (!isValidType) {
      setErrorMessage('Please upload an Excel file (.xlsx or .xls)')
      return false
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrorMessage('File size must be less than 10MB')
      return false
    }
    
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        setErrorMessage('')
        setUploadStatus('idle')
      } else {
        setUploadStatus('error')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        setErrorMessage('')
        setUploadStatus('idle')
      } else {
        setUploadStatus('error')
      }
    }
  }

  const handleUploadClick = async () => {
    if (!selectedFile) return
    
    setUploadStatus('uploading')
    setErrorMessage('')
    
    try {
      await onUpload(selectedFile, portfolioId, portfolioName)
      setUploadStatus('success')
      setSelectedFile(null)
    } catch (err) {
      setUploadStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setErrorMessage('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleButtonClick()
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">{portfolioName}</h4>
        {hasData && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle className="h-3 w-3" />
            Loaded
          </span>
        )}
      </div>
      
      <div
        className={`relative rounded-lg border-2 border-dashed p-4 transition-all duration-200 ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50'
            : uploadStatus === 'error'
            ? 'border-red-300 bg-red-50'
            : uploadStatus === 'success'
            ? 'border-emerald-300 bg-emerald-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleChange}
          className="hidden"
          aria-label={`Upload Excel file for ${portfolioName}`}
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearFile}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleUploadClick}
                disabled={isLoading || uploadStatus === 'uploading'}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center gap-2 py-4"
            onClick={handleButtonClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Click to select file"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600">
              <span className="font-medium text-emerald-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400">Excel files only (.xlsx, .xls)</p>
          </div>
        )}
      </div>
      
      {uploadStatus === 'success' && (
        <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
          <CheckCircle className="h-4 w-4" />
          File processed successfully!
        </div>
      )}
      
      {errorMessage && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}
    </div>
  )
}

export default FileUpload

