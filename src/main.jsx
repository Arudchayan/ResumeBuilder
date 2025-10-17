import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import ResumeBuilder from './ResumeBuilder.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ResumeBuilder />
    <Toaster position="top-right" richColors />
  </React.StrictMode>,
)
