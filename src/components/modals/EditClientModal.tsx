import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { ClientRecord } from '../../../server/db/types';

interface EditClientModalProps {
  isOpen: boolean;
  client: ClientRecord;
  onClose: () => void;
  onSubmit: (updates: Partial<ClientRecord>) => Promise<void>;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  client,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [companyName, setCompanyName] = useState(client.company_name);
  const [website, setWebsite] = useState(client.website || '');
  const [industry, setIndustry] = useState(client.industry || '');
  const [location, setLocation] = useState(client.location || '');
  const [timezone, setTimezone] = useState(client.timezone || '');
  const [companyDescription, setCompanyDescription] = useState(client.company_description || '');
  const [status, setStatus] = useState(client.status);
  const [businessModel, setBusinessModel] = useState(client.business_model || '');
  const [positioning, setPositioning] = useState(client.positioning || '');
  const [preferredChannel, setPreferredChannel] = useState(client.preferred_channel || '');
  const [communicationTone, setCommunicationTone] = useState(client.communication_tone || '');
  const [currency, setCurrency] = useState(client.currency || 'USD');
  const [defaultRate, setDefaultRate] = useState(client.default_rate || '');
  const [paymentTerms, setPaymentTerms] = useState(client.payment_terms || 'Net 30');
  const [contractNotes, setContractNotes] = useState(client.contract_notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        company_name: companyName.trim(),
        website: website.trim() || undefined,
        industry: industry.trim() || undefined,
        location: location.trim() || undefined,
        timezone: timezone.trim() || undefined,
        company_description: companyDescription.trim() || undefined,
        status: status as any,
        business_model: businessModel.trim() || undefined,
        positioning: positioning.trim() || undefined,
        preferred_channel: preferredChannel.trim() || undefined,
        communication_tone: communicationTone.trim() || undefined,
        currency,
        default_rate: defaultRate.trim() || undefined,
        payment_terms: paymentTerms.trim() || undefined,
        contract_notes: contractNotes.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/25 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-surface rounded-card-lg border border-border shadow-float p-8 space-y-6 max-h-[90vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-ink-muted hover:text-ink hover:bg-surface-secondary transition-colors"
        >
          <X size={16} />
        </button>

        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
            Partner Settings
          </span>
          <h2 className="text-2xl font-light tracking-tight text-ink mt-0.5">
            Edit Client Profile
          </h2>
          <p className="text-xs text-ink-secondary mt-1 font-light">
            Update operational parameters, communication boundaries, and commercial baseline.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-card-sm bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              >
                <option value="active">Active</option>
                <option value="review">Review</option>
                <option value="onboarding">Onboarding</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Website</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Company Description</label>
            <textarea
              rows={2}
              value={companyDescription}
              onChange={e => setCompanyDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Preferred Channel</label>
              <input
                type="text"
                value={preferredChannel}
                onChange={e => setPreferredChannel(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Communication Tone</label>
              <input
                type="text"
                value={communicationTone}
                onChange={e => setCommunicationTone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-ink font-medium mb-1.5">Currency</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Default Hourly Rate</label>
              <input
                type="text"
                value={defaultRate}
                onChange={e => setDefaultRate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-ink font-medium mb-1.5">Payment Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink font-medium mb-1.5">Contract / Retainer Notes</label>
            <input
              type="text"
              value={contractNotes}
              onChange={e => setContractNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-pill bg-surface text-ink-secondary hover:text-ink border border-border text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-pill bg-ink text-white hover:bg-neutral-800 text-xs font-medium transition-colors shadow-subtle disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
