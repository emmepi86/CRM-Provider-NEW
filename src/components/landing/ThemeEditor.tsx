import React from 'react';
import { Palette } from 'lucide-react';

interface ThemeEditorProps {
  themeConfig: {
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
  };
  setThemeConfig: (config: any) => void;
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({
  themeConfig,
  setThemeConfig
}) => {
  const fontOptions = [
    { value: 'system-ui, -apple-system, sans-serif', label: 'System (Default)' },
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Lato, sans-serif', label: 'Lato' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Georgia, serif', label: 'Georgia (Serif)' },
    { value: 'Merriweather, serif', label: 'Merriweather (Serif)' }
  ];

  const colorPresets = [
    { name: 'Blu Professionale', primary: '#2563eb', secondary: '#1e40af' },
    { name: 'Rosso Energico', primary: '#dc2626', secondary: '#991b1b' },
    { name: 'Verde Naturale', primary: '#059669', secondary: '#047857' },
    { name: 'Viola Elegante', primary: '#7c3aed', secondary: '#5b21b6' },
    { name: 'Arancione Dinamico', primary: '#ea580c', secondary: '#c2410c' },
    { name: 'Indaco Moderno', primary: '#4f46e5', secondary: '#3730a3' }
  ];

  const handleColorChange = (key: 'primary_color' | 'secondary_color', value: string) => {
    setThemeConfig({
      ...themeConfig,
      [key]: value
    });
  };

  const handleFontChange = (value: string) => {
    setThemeConfig({
      ...themeConfig,
      font_family: value
    });
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setThemeConfig({
      ...themeConfig,
      primary_color: preset.primary,
      secondary_color: preset.secondary
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tema e Personalizzazione
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Personalizza i colori e il font della landing page
        </p>
      </div>

      {/* Color Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preset Colori
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors text-left"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: preset.secondary }}
                />
              </div>
              <p className="text-sm font-medium text-gray-900">{preset.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Colore Primario
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="color"
            value={themeConfig.primary_color || '#2563eb'}
            onChange={(e) => handleColorChange('primary_color', e.target.value)}
            className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={themeConfig.primary_color || '#2563eb'}
            onChange={(e) => handleColorChange('primary_color', e.target.value)}
            placeholder="#2563eb"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Usato per bottoni, link e accenti principali
        </p>
        <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: themeConfig.primary_color || '#2563eb' }}>
          <p className="text-white font-semibold">Anteprima Colore Primario</p>
          <button className="mt-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium">
            Bottone Esempio
          </button>
        </div>
      </div>

      {/* Secondary Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Colore Secondario
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="color"
            value={themeConfig.secondary_color || '#1e40af'}
            onChange={(e) => handleColorChange('secondary_color', e.target.value)}
            className="w-20 h-12 border border-gray-300 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={themeConfig.secondary_color || '#1e40af'}
            onChange={(e) => handleColorChange('secondary_color', e.target.value)}
            placeholder="#1e40af"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Usato per gradienti hero section e elementi decorativi
        </p>
        <div
          className="mt-3 p-4 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${themeConfig.primary_color || '#2563eb'} 0%, ${themeConfig.secondary_color || '#1e40af'} 100%)`
          }}
        >
          <p className="text-white font-semibold">Anteprima Gradiente Hero</p>
          <p className="text-blue-100 mt-1 text-sm">
            Questa combinazione di colori sarà usata nella sezione hero della landing page
          </p>
        </div>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Family
        </label>
        <select
          value={themeConfig.font_family || 'system-ui, -apple-system, sans-serif'}
          onChange={(e) => handleFontChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Font applicato a tutto il contenuto della landing page
        </p>
        <div className="mt-3 p-4 border border-gray-200 rounded-lg">
          <p
            className="text-gray-900 font-semibold mb-2"
            style={{ fontFamily: themeConfig.font_family || 'system-ui' }}
          >
            Anteprima Font: Titolo Esempio
          </p>
          <p
            className="text-gray-600 text-sm"
            style={{ fontFamily: themeConfig.font_family || 'system-ui' }}
          >
            Questo è un paragrafo di esempio per visualizzare come apparirà il font selezionato nella landing page. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Palette className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">
              Suggerimenti per la scelta dei colori
            </p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Usa colori che riflettono il brand dell'evento</li>
              <li>• Assicurati che il contrasto sia sufficiente per la leggibilità</li>
              <li>• Il colore primario è il più importante: sceglilo con cura</li>
              <li>• Test su diversi dispositivi per verificare l'aspetto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
