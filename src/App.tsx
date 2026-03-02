import { useState } from 'react';
import {
  FileImage,
  Image as ImageIcon,
  FileText,
  Settings2,
  Lock,
  Code,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import './App.css';
import ImageToPdf from './components/ImageToPdf';
import PdfToImage from './components/PdfToImage';
import Base64Converter from './components/Base64Converter';
import ImageCompressor from './components/ImageCompressor';
import SvgConverter from './components/SvgConverter';
import PasswordGenerator from './components/PasswordGenerator';

const tools = [
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG, PNG, and other image formats into a single PDF document easily.',
    icon: <FileImage size={28} />,
    category: 'Document Viewer'
  },
  {
    id: 'pdf-to-image',
    title: 'PDF to Image',
    description: 'Extract pages from PDF files and convert them into high-quality images.',
    icon: <ImageIcon size={28} />,
    category: 'Document Viewer'
  },
  {
    id: 'base64-converter',
    title: 'Base64 Converter',
    description: 'Quickly encode strings and files into Base64 format or decode them back.',
    icon: <Code size={28} />,
    category: 'Developer Tools'
  },
  {
    id: 'image-compressor',
    title: 'Image Compressor',
    description: 'Reduce the file size of your images while maintaining visual quality.',
    icon: <Settings2 size={28} />,
    category: 'Media'
  },
  {
    id: 'svg-converter',
    title: 'SVG to PNG',
    description: 'Convert scalable vector graphics into universal PNG format in seconds.',
    icon: <FileText size={28} />,
    category: 'Media'
  },
  {
    id: 'password-gen',
    title: 'Password Generator',
    description: 'Generate highly secure, random passwords with customizable parameters.',
    icon: <Lock size={28} />,
    category: 'Security'
  }
];

function App() {
  const [currentTool, setCurrentTool] = useState<string | null>(null);

  const renderTool = () => {
    switch (currentTool) {
      case 'image-to-pdf':
        return <ImageToPdf onBack={() => setCurrentTool(null)} />;
      case 'pdf-to-image':
        return <PdfToImage onBack={() => setCurrentTool(null)} />;
      case 'base64-converter':
        return <Base64Converter onBack={() => setCurrentTool(null)} />;
      case 'image-compressor':
        return <ImageCompressor onBack={() => setCurrentTool(null)} />;
      case 'svg-converter':
        return <SvgConverter onBack={() => setCurrentTool(null)} />;
      case 'password-gen':
        return <PasswordGenerator onBack={() => setCurrentTool(null)} />;
      default:
        return (
          <div className="tool-placeholder">
            <h2 className="title" style={{ fontSize: '2rem' }}>Coming Soon</h2>
            <p className="subtitle">This tool is currently under development.</p>
            <button
              className="generate-btn"
              style={{ margin: '2rem auto' }}
              onClick={() => setCurrentTool(null)}
            >
              Go Back
            </button>
          </div>
        );
    }
  };

  if (currentTool) {
    return (
      <div className="app-container">
        {renderTool()}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="badge">
          <Sparkles size={16} />
          <span>New Utility Portal Added</span>
        </div>
        <h1 className="title">
          <span>Useful</span> Tools Collection
        </h1>
        <p className="subtitle">
          An aesthetic, fast, and secure library containing everything you need to boost your daily productivity. All tools run directly in your browser.
        </p>
      </header>

      <main className="tools-grid">
        {tools.map((tool) => (
          <div key={tool.id} className="tool-card" onClick={() => setCurrentTool(tool.id)} style={{ cursor: 'pointer' }}>
            <div className="icon-wrapper">
              {tool.icon}
            </div>

            <h3 className="tool-title">{tool.title}</h3>
            <p className="tool-desc">{tool.description}</p>

            <div className="tool-action">
              <span className="category-tag">{tool.category}</span>
              <button className="use-button" aria-label={`Open ${tool.title}`}>
                Use Tool <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
