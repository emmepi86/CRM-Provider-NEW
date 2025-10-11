import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { landingPageAPI } from '../../api/landing';
import type { LandingPage, FormField, SubmissionResponse } from '../../types/landing';

interface FormErrors {
  [key: string]: string;
}

export const PublicLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionResponse, setSubmissionResponse] = useState<SubmissionResponse | null>(null);

  useEffect(() => {
    if (slug) {
      fetchLandingPage();
      // Track view (could be enhanced with analytics)
      console.log(`Landing page viewed: ${slug}`);
    }
  }, [slug]);

  const fetchLandingPage = async () => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    try {
      const data = await landingPageAPI.getBySlug(slug);
      setLandingPage(data);

      // Initialize form with default values
      const defaults: Record<string, any> = {};
      data.form_fields.forEach(field => {
        if (field.default_value) {
          defaults[field.field_name] = field.default_value;
        }
      });
      setFormData(defaults);
    } catch (err: any) {
      console.error('Error fetching landing page:', err);
      if (err.response?.status === 404) {
        setError('Pagina non trovata. Verifica il link che hai ricevuto.');
      } else if (err.response?.status === 403) {
        setError('Questa pagina non è più disponibile.');
      } else {
        setError('Errore nel caricamento della pagina. Riprova più tardi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    // Required validation
    if (field.required && (!value || value === '')) {
      return `Il campo "${field.label}" è obbligatorio`;
    }

    // Email validation
    if (field.field_type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Inserisci un indirizzo email valido';
      }
    }

    // Tel validation
    if (field.field_type === 'tel' && value) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Inserisci un numero di telefono valido';
      }
    }

    // Custom validation rules
    if (field.validation_rules) {
      if (field.validation_rules.min_length && value && value.length < field.validation_rules.min_length) {
        return `Minimo ${field.validation_rules.min_length} caratteri`;
      }
      if (field.validation_rules.max_length && value && value.length > field.validation_rules.max_length) {
        return `Massimo ${field.validation_rules.max_length} caratteri`;
      }
      if (field.validation_rules.pattern && value) {
        const regex = new RegExp(field.validation_rules.pattern);
        if (!regex.test(value)) {
          return field.validation_rules.pattern_message || 'Formato non valido';
        }
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    if (!landingPage) return false;

    const errors: FormErrors = {};
    let isValid = true;

    // Only validate visible fields
    landingPage.form_fields
      .filter(field => shouldShowField(field))
      .forEach(field => {
        const value = formData[field.field_name];
        const error = validateField(field, value);
        if (error) {
          errors[field.field_name] = error;
          isValid = false;
        }
      });

    setFormErrors(errors);
    return isValid;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error for this field
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const shouldShowField = (field: FormField): boolean => {
    // If no conditional display, always show
    if (!field.conditional_display || !field.conditional_display.field_name) {
      return true;
    }

    const condition = field.conditional_display;
    const targetValue = formData[condition.field_name];

    switch (condition.operator) {
      case 'equals':
        return targetValue === condition.value;

      case 'not_equals':
        return targetValue !== condition.value;

      case 'contains':
        return targetValue && String(targetValue).includes(condition.value || '');

      case 'is_checked':
        return targetValue === true || targetValue === 'true';

      case 'is_not_checked':
        return !targetValue || targetValue === false || targetValue === 'false';

      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!landingPage || !slug) return;

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);

    try {
      const response = await landingPageAPI.submitForm(slug, {
        form_data: formData
      });

      setSubmissionResponse(response);
      setSubmitted(true);

      // Handle redirect if configured
      if (landingPage.redirect_url) {
        setTimeout(() => {
          window.location.href = landingPage.redirect_url!;
        }, 2000);
      } else if (response.requires_payment && response.payment_url) {
        // Redirect to Stripe Checkout
        setTimeout(() => {
          window.location.href = response.payment_url!;
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error submitting form:', err);
      alert(err.response?.data?.detail || 'Errore durante l\'invio del form. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.field_name] || '';
    const hasError = !!formErrors[field.field_name];
    const primaryColor = landingPage?.theme_config?.primary_color || '#2563eb';

    const baseInputClass = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
      hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
    }`;

    const labelClass = `block text-sm font-medium text-gray-700 mb-2 ${
      field.required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''
    }`;

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClass}>{field.label}</label>
            <input
              type={field.field_type}
              value={value}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClass}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600 field-error">{formErrors[field.field_name]}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClass}>{field.label}</label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={baseInputClass}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600 field-error">{formErrors[field.field_name]}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClass}>{field.label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              placeholder={field.placeholder}
              className={baseInputClass}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600 field-error">{formErrors[field.field_name]}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClass}>{field.label}</label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={baseInputClass}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600 field-error">{formErrors[field.field_name]}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClass}>{field.label}</label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={baseInputClass}
            >
              <option value="">-- Seleziona --</option>
              {field.options.map((opt, idx) => (
                <option key={idx} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600 field-error">{formErrors[field.field_name]}</p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClass}>{field.label}</label>
            <div className="space-y-2">
              {field.options.map((opt, idx) => (
                <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.field_name}
                    value={opt.value}
                    checked={value === opt.value}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="w-4 h-4 text-blue-600"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600 field-error">{formErrors[field.field_name]}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value === true || value === 'true'}
                onChange={(e) => handleFieldChange(field.field_name, e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
                style={{ accentColor: primaryColor }}
              />
              <span className={`text-gray-700 ${field.required ? 'after:content-["*"] after:ml-1 after:text-red-500' : ''}`}>
                {field.label}
              </span>
            </label>
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500 ml-8">{field.help_text}</p>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600 ml-8 field-error">{formErrors[field.field_name]}</p>
            )}
          </div>
        );

      case 'file_upload':
        return (
          <div key={field.id} className="mb-6">
            <label className={labelClass}>{field.label}</label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // TODO: Handle file upload (implement in next phase)
                  handleFieldChange(field.field_name, file.name);
                }
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={baseInputClass}
            />
            {field.help_text && (
              <p className="mt-1 text-sm text-gray-500">{field.help_text}</p>
            )}
            {hasError && (
              <p className="mt-1 text-sm text-red-600 field-error">{formErrors[field.field_name]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (error || !landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Oops!</h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted && submissionResponse) {
    const successMessage = landingPage.success_message || 'Iscrizione completata con successo!';

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Grazie!
          </h2>
          <p className="text-gray-700 text-center mb-6">{successMessage}</p>

          {submissionResponse.requires_payment && submissionResponse.payment_url && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 text-center">
                Verrai reindirizzato alla pagina di pagamento...
              </p>
            </div>
          )}

          {submissionResponse.merge_details && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-gray-700 mb-2">Dettagli registrazione:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Azione: {submissionResponse.merge_details.action === 'created' ? 'Nuovo profilo creato' : 'Profilo aggiornato'}</li>
                {submissionResponse.merge_details.fields_updated.length > 0 && (
                  <li>• Campi aggiornati: {submissionResponse.merge_details.fields_updated.join(', ')}</li>
                )}
              </ul>
            </div>
          )}

          {landingPage.redirect_url && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Reindirizzamento in corso...
            </p>
          )}
        </div>
      </div>
    );
  }

  const primaryColor = landingPage.theme_config?.primary_color || '#2563eb';
  const secondaryColor = landingPage.theme_config?.secondary_color || '#1e40af';
  const fontFamily = landingPage.theme_config?.font_family || 'system-ui, -apple-system, sans-serif';

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily }}>
      {/* Hero Section */}
      <div
        className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        <div className="max-w-4xl mx-auto">
          {landingPage.hero_image_url && (
            <img
              src={landingPage.hero_image_url}
              alt={landingPage.title}
              className="w-full h-64 object-cover rounded-lg mb-8 shadow-xl"
            />
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            {landingPage.title}
          </h1>
          {landingPage.subtitle && (
            <p className="text-xl md:text-2xl text-blue-100 text-center mb-6">
              {landingPage.subtitle}
            </p>
          )}
          {landingPage.description && (
            <p className="text-lg text-blue-50 text-center max-w-2xl mx-auto">
              {landingPage.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 mt-8">
            <div className="flex items-center space-x-2 text-blue-100">
              <Users className="w-5 h-5" />
              <span className="text-sm">{landingPage.total_submissions} iscritti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Modulo di Iscrizione
            </h2>

            {landingPage.form_fields
              .sort((a, b) => a.order_index - b.order_index)
              .filter(field => shouldShowField(field))
              .map(field => renderField(field))}

            {/* Payment Info */}
            {landingPage.requires_payment && landingPage.amount && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-lg">Quota di partecipazione</p>
                    <p className="text-sm text-gray-600">Pagamento sicuro con Stripe</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                      €{landingPage.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Invio in corso...</span>
                </>
              ) : (
                <span>
                  {landingPage.requires_payment ? 'Procedi al Pagamento' : 'Invia Iscrizione'}
                </span>
              )}
            </button>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center mt-4">
              I tuoi dati saranno trattati in conformità al GDPR e utilizzati esclusivamente per la gestione della tua iscrizione.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
