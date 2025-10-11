import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Eye,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { landingPagesAdminAPI, type LandingPageCreateData, type FormFieldCreateData } from '../../api/landingPagesAdmin';
import type { LandingPage } from '../../types/landing';
import { HeroEditor } from '../../components/landing/HeroEditor';
import { FormFieldsEditor } from '../../components/landing/FormFieldsEditor';
import { ThemeEditor } from '../../components/landing/ThemeEditor';
import { SettingsEditor } from '../../components/landing/SettingsEditor';

export const LandingPageBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Get event_id from query string (when creating from event detail)
  const searchParams = new URLSearchParams(window.location.search);
  const eventIdFromQuery = searchParams.get('event_id');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'form' | 'theme' | 'settings'>('hero');

  // Form data
  const [eventId, setEventId] = useState<number>(eventIdFromQuery ? parseInt(eventIdFromQuery) : 4);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [stripePriceId, setStripePriceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState('EUR');
  const [themeConfig, setThemeConfig] = useState({
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    font_family: 'system-ui'
  });
  const [seoMeta, setSeoMeta] = useState({
    title: '',
    description: '',
    keywords: [] as string[]
  });
  const [successMessage, setSuccessMessage] = useState('Grazie per la tua iscrizione! Riceverai una email di conferma a breve.');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [formFields, setFormFields] = useState<FormFieldCreateData[]>([]);

  useEffect(() => {
    if (isEditMode && id) {
      fetchLandingPage(parseInt(id));
    } else {
      // Inizializza con form fields di default
      setFormFields([
        {
          field_type: 'email',
          field_name: 'email',
          label: 'Email *',
          placeholder: 'mario.rossi@example.com',
          required: true,
          maps_to_participant_field: 'email',
          order_index: 1,
          validation_rules: {},
          options: [],
          conditional_display: {}
        },
        {
          field_type: 'text',
          field_name: 'first_name',
          label: 'Nome *',
          placeholder: 'Mario',
          required: true,
          maps_to_participant_field: 'first_name',
          order_index: 2,
          validation_rules: {},
          options: [],
          conditional_display: {}
        },
        {
          field_type: 'text',
          field_name: 'last_name',
          label: 'Cognome *',
          placeholder: 'Rossi',
          required: true,
          maps_to_participant_field: 'last_name',
          order_index: 3,
          validation_rules: {},
          options: [],
          conditional_display: {}
        }
      ]);
    }
  }, [id, isEditMode]);

  const fetchLandingPage = async (landingPageId: number) => {
    setLoading(true);
    try {
      const page = await landingPagesAdminAPI.getById(landingPageId);
      // Popola tutti i campi
      setEventId(page.event_id);
      setSlug(page.slug);
      setTitle(page.title);
      setSubtitle(page.subtitle || '');
      setDescription(page.description || '');
      setHeroImageUrl(page.hero_image_url || '');
      setIsActive(page.is_active);
      setIsPublished(page.is_published);
      setRequiresPayment(page.requires_payment);
      setStripePriceId(page.stripe_price_id || '');
      setAmount(page.amount || 0);
      setCurrency(page.currency);
      setThemeConfig({
        primary_color: page.theme_config?.primary_color || '#2563eb',
        secondary_color: page.theme_config?.secondary_color || '#1e40af',
        font_family: page.theme_config?.font_family || 'system-ui'
      });
      setSeoMeta({
        title: page.seo_meta?.title || '',
        description: page.seo_meta?.description || '',
        keywords: page.seo_meta?.keywords || []
      });
      setSuccessMessage(page.success_message || '');
      setRedirectUrl(page.redirect_url || '');
      setFormFields(page.form_fields.map(f => ({
        field_type: f.field_type,
        field_name: f.field_name,
        label: f.label,
        placeholder: f.placeholder,
        help_text: f.help_text,
        required: f.required,
        default_value: f.default_value,
        validation_rules: f.validation_rules,
        options: f.options,
        conditional_display: f.conditional_display,
        maps_to_participant_field: f.maps_to_participant_field,
        order_index: f.order_index
      })));
    } catch (error) {
      console.error('Error fetching landing page:', error);
      alert('Errore nel caricamento della landing page');
      navigate('/landing-pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validazione
    if (!slug || !title) {
      alert('Slug e titolo sono obbligatori');
      return;
    }

    if (formFields.length === 0) {
      alert('Aggiungi almeno un campo al form');
      return;
    }

    const landingPageData: LandingPageCreateData = {
      event_id: eventId,
      slug,
      title,
      subtitle,
      description,
      hero_image_url: heroImageUrl,
      is_active: isActive,
      is_published: isPublished,
      requires_payment: requiresPayment,
      stripe_price_id: stripePriceId || undefined,
      amount: requiresPayment ? amount : undefined,
      currency,
      theme_config: themeConfig,
      seo_meta: seoMeta,
      success_message: successMessage,
      redirect_url: redirectUrl || undefined,
      form_fields: formFields
    };

    setSaving(true);
    try {
      if (isEditMode && id) {
        await landingPagesAdminAPI.update(parseInt(id), landingPageData);
        alert('Landing page aggiornata con successo!');
      } else {
        const created = await landingPagesAdminAPI.create(landingPageData);
        alert('Landing page creata con successo!');
        navigate(`/landing-pages/${created.id}/edit`);
      }
    } catch (error: any) {
      console.error('Error saving landing page:', error);
      alert(error.response?.data?.detail || 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (slug) {
      window.open(`/landing/${slug}`, '_blank');
    } else {
      alert('Salva prima la landing page per visualizzare l\'anteprima');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/landing-pages')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Modifica Landing Page' : 'Nuova Landing Page'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? `Modifica "${title}"` : 'Crea una nuova landing page per il tuo evento'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePreview}
            disabled={!isEditMode}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            <span>Anteprima</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvataggio...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditMode ? 'Salva Modifiche' : 'Crea Landing Page'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'hero', label: 'Hero & Contenuto' },
            { key: 'form', label: 'Form Builder' },
            { key: 'theme', label: 'Tema' },
            { key: 'settings', label: 'Impostazioni' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'hero' && (
          <HeroEditor
            slug={slug}
            setSlug={setSlug}
            title={title}
            setTitle={setTitle}
            subtitle={subtitle}
            setSubtitle={setSubtitle}
            description={description}
            setDescription={setDescription}
            heroImageUrl={heroImageUrl}
            setHeroImageUrl={setHeroImageUrl}
          />
        )}

        {activeTab === 'form' && (
          <FormFieldsEditor
            formFields={formFields}
            setFormFields={setFormFields}
          />
        )}

        {activeTab === 'theme' && (
          <ThemeEditor
            themeConfig={themeConfig}
            setThemeConfig={setThemeConfig}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsEditor
            isActive={isActive}
            setIsActive={setIsActive}
            isPublished={isPublished}
            setIsPublished={setIsPublished}
            requiresPayment={requiresPayment}
            setRequiresPayment={setRequiresPayment}
            stripePriceId={stripePriceId}
            setStripePriceId={setStripePriceId}
            amount={amount}
            setAmount={setAmount}
            currency={currency}
            setCurrency={setCurrency}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            redirectUrl={redirectUrl}
            setRedirectUrl={setRedirectUrl}
            seoMeta={seoMeta}
            setSeoMeta={setSeoMeta}
          />
        )}
      </div>
    </div>
  );
};
