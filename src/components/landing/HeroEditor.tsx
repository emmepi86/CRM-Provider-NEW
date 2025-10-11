import React, { useState } from 'react';
import { Image, Upload, Loader2, X } from 'lucide-react';
import { TinyMCEEditor } from '../common/TinyMCEEditor';
import { apiClient } from '../../api/client';

interface HeroEditorProps {
  slug: string;
  setSlug: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  subtitle: string;
  setSubtitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  heroImageUrl: string;
  setHeroImageUrl: (value: string) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({
  slug,
  setSlug,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  description,
  setDescription,
  heroImageUrl,
  setHeroImageUrl
}) => {
  const [uploading, setUploading] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug if empty
    if (!slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato file non supportato. Usa JPG, PNG, WebP o GIF.');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Il file è troppo grande. Dimensione massima: 5MB.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/landing-pages/upload-hero-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setHeroImageUrl(response.data.url);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.detail || 'Errore durante l\'upload dell\'immagine');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setHeroImageUrl('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hero Section & Contenuto Principale
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Configura la sezione hero e il contenuto principale della landing page
        </p>
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Slug *
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">{window.location.origin}/landing/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="corso-esempio-2025"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            pattern="[a-z0-9-]+"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Solo lettere minuscole, numeri e trattini. Deve essere univoco.
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titolo Principale *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Corso di Formazione Avanzata"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">
          Massimo 200 caratteri. Sarà visualizzato in grande nella sezione hero.
        </p>
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sottotitolo
        </label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="3 giorni di formazione intensiva con i migliori esperti"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1">
          Massimo 300 caratteri. Visualizzato sotto il titolo.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrizione
        </label>
        <TinyMCEEditor
          value={description}
          onChange={setDescription}
          height={350}
          placeholder="Scrivi qui la descrizione della landing page..."
          mode="document"
        />
        <p className="text-xs text-gray-500 mt-1">
          Usa l'editor per formattare il testo con liste, grassetto, link, immagini, ecc.
        </p>
      </div>

      {/* Hero Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hero Image
        </label>
        <div className="space-y-3">
          {!heroImageUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="hero-image-upload"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="hero-image-upload"
                className={`cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                    <p className="text-sm text-gray-600">Caricamento in corso...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Clicca per caricare un'immagine
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, WebP o GIF (max 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Anteprima:</p>
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                  type="button"
                >
                  <X className="w-4 h-4" />
                  <span>Rimuovi</span>
                </button>
              </div>
              <img
                src={heroImageUrl}
                alt="Hero preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Immagine+non+trovata';
                }}
              />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Dimensioni consigliate: 1920x600px per la migliore qualità.
        </p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 flex items-start">
            <Image className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Suggerimento:</strong> Carica un'immagine orizzontale con un soggetto chiaro.
              Evita testi piccoli che potrebbero essere illeggibili su mobile.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
