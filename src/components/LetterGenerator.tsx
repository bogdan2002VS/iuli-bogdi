import React, { useState } from 'react';
import { FileSystemItem } from '../types';

interface LetterGeneratorProps {
  onLetterCreated?: (letter: FileSystemItem) => void;
}

const LetterGenerator: React.FC<LetterGeneratorProps> = ({ onLetterCreated }) => {
  const [letterText, setLetterText] = useState('');
  const [letterTitle, setLetterTitle] = useState('');
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const generateLetter = () => {
    if (!letterText.trim() || !letterTitle.trim()) {
      alert('Te rog completează titlul și conținutul scrisorii!');
      return;
    }

    const formattedContent = `${toName ? `Dragă ${toName},\n\n` : ''}${letterText}${fromName ? `\n\nCu dragoste,\n${fromName} 💕` : ''}`;

    const newLetter: FileSystemItem = {
      id: `letter-${Date.now()}`,
      name: `${letterTitle}.txt`,
      type: 'file',
      icon: '💌',
      path: `/desktop/letters/${letterTitle}.txt`,
      content: formattedContent,
    };

    // Save to localStorage for persistence
    const existingLetters = JSON.parse(localStorage.getItem('customLetters') || '[]');
    existingLetters.push(newLetter);
    localStorage.setItem('customLetters', JSON.stringify(existingLetters));

    if (onLetterCreated) {
      onLetterCreated(newLetter);
    }

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    setLetterText('');
    setLetterTitle('');
    setFromName('');
    setToName('');
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gradient-to-br from-violet-50 to-lavender-50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-violet-800 mb-2">
            ✍️ Generator de Scrisori de Dragoste
          </h2>
          <p className="text-violet-600">Creează o scrisoare personalizată!</p>
        </div>

        {showSuccess && (
          <div className="mb-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg animate-bounce">
            <p className="text-green-800 font-medium text-center">
              ✨ Scrisoarea a fost creată cu succes! 💌
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg border-2 border-violet-200 p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-violet-700 font-medium mb-2">
              Titlul Scrisorii 📝
            </label>
            <input
              type="text"
              value={letterTitle}
              onChange={(e) => setLetterTitle(e.target.value)}
              placeholder="ex: Prima noastră scrisoare"
              className="w-full px-4 py-2 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-400 transition-colors"
            />
          </div>

          {/* To Name */}
          <div>
            <label className="block text-violet-700 font-medium mb-2">
              Către 💕
            </label>
            <input
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="Numele destinatarului (opțional)"
              className="w-full px-4 py-2 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-400 transition-colors"
            />
          </div>

          {/* Letter Content */}
          <div>
            <label className="block text-violet-700 font-medium mb-2">
              Conținutul Scrisorii 💌
            </label>
            <textarea
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              placeholder="Scrie aici mesajul tău de dragoste..."
              rows={10}
              className="w-full px-4 py-2 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-400 transition-colors resize-none"
            />
          </div>

          {/* From Name */}
          <div>
            <label className="block text-violet-700 font-medium mb-2">
              De la ✨
            </label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Numele tău (opțional)"
              className="w-full px-4 py-2 border-2 border-violet-200 rounded-lg focus:outline-none focus:border-violet-400 transition-colors"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={generateLetter}
            className="w-full bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>Creează Scrisoarea</span>
              <span>💕</span>
            </span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-violet-100 rounded-lg border-2 border-violet-200">
          <h3 className="font-bold text-violet-800 mb-2">📖 Instrucțiuni:</h3>
          <ul className="text-violet-700 text-sm space-y-1">
            <li>• Completează titlul scrisorii și conținutul</li>
            <li>• Poți adăuga numele destinatarului și al tău (opțional)</li>
            <li>• Scrisoarea va fi salvată și poți accesa din File Manager</li>
            <li>• Scrisoarea va avea același stil ca celelalte scrisori! 💌</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LetterGenerator;
