import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  FileText,
  Lock,
  Eye,
  Sliders,
  Building2,
  Users,
  Briefcase,
  Layers,
  MessageSquare,
  CreditCard,
  FolderGit2,
  Cpu
} from 'lucide-react';
import { MemoryStatus, PermissionLevel, DocumentCategory } from '../../../server/db/types';
import { CreateClientPayload } from '../../../server/services/clientService';
import { api } from '../../api/client';

interface ClientOnboardingViewProps {
  onCancel: () => void;
  onSuccess: (clientId: string) => void;
}

const STEPS = [
  { id: '01', title: 'Identity', desc: 'Core studio client baseline' },
  { id: '02', title: 'People', desc: 'Client contacts & stakeholders' },
  { id: '03', title: 'Business', desc: 'Market position & offering' },
  { id: '04', title: 'Brand', desc: 'Design axioms & voice rules' },
  { id: '05', title: 'Communication', desc: 'Cadence & approval gates' },
  { id: '06', title: 'Projects', desc: 'Initial workspace initiatives' },
  { id: '07', title: 'Commercial', desc: 'Billing rates & contract terms' },
  { id: '08', title: 'Files', desc: 'Authoritative artifacts' },
  { id: '09', title: 'AI Setup', desc: 'Autonomous permission gates' },
  { id: '10', title: 'Review', desc: 'Audit & initialize workspace' },
];

export const ClientOnboardingView: React.FC<ClientOnboardingViewProps> = ({
  onCancel,
  onSuccess
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  // 01 Identity
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('10-50');
  const [location, setLocation] = useState('');
  const [timezone, setTimezone] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // 02 People
  const [contacts, setContacts] = useState<Array<{
    name: string;
    role: string;
    email: string;
    phone: string;
    preferred_channel: string;
    is_primary_contact: boolean;
  }>>([
    { name: '', role: '', email: '', phone: '', preferred_channel: 'Slack', is_primary_contact: true }
  ]);

  // 03 Business
  const [businessModel, setBusinessModel] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [primaryMarket, setPrimaryMarket] = useState('');
  const [positioning, setPositioning] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [mainProducts, setMainProducts] = useState('');
  const [competitors, setCompetitors] = useState('');
  const [businessGoals, setBusinessGoals] = useState('');

  // 04 Brand
  const [brandPersonality, setBrandPersonality] = useState('');
  const [brandVoice, setBrandVoice] = useState('');
  const [designStyle, setDesignStyle] = useState('');
  const [visualPrinciples, setVisualPrinciples] = useState('');
  const [primaryColors, setPrimaryColors] = useState('');
  const [secondaryColors, setSecondaryColors] = useState('');
  const [typography, setTypography] = useState('');
  const [logoNotes, setLogoNotes] = useState('');
  const [thingsToAvoid, setThingsToAvoid] = useState('');
  const [brandStatus, setBrandStatus] = useState<MemoryStatus>('OFFICIAL');

  // 05 Communication
  const [preferredChannel, setPreferredChannel] = useState('Slack');
  const [communicationTone, setCommunicationTone] = useState('');
  const [responseStyle, setResponseStyle] = useState('');
  const [workingHours, setWorkingHours] = useState('09:00 - 18:00');
  const [approvalProcess, setApprovalProcess] = useState('');
  const [whoCanApprove, setWhoCanApprove] = useState('');
  const [importantCommunicationNotes, setImportantCommunicationNotes] = useState('');

  // 06 Projects
  const [initialProjects, setInitialProjects] = useState<Array<{
    project_name: string;
    project_type: string;
    description: string;
    status: string;
    deadline: string;
    priority: string;
    estimated_budget: string;
    project_notes: string;
  }>>([
    {
      project_name: '',
      project_type: 'Brand System',
      description: '',
      status: 'planning',
      deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      priority: 'normal',
      estimated_budget: '',
      project_notes: ''
    }
  ]);

  // 07 Commercial
  const [currency, setCurrency] = useState('USD');
  const [defaultRate, setDefaultRate] = useState('');
  const [dayRate, setDayRate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [contractNotes, setContractNotes] = useState('');
  const [quotationSettings, setQuotationSettings] = useState('');
  const [invoiceSettings, setInvoiceSettings] = useState('');
  const [mouSettings, setMouSettings] = useState('');

  // 08 Files
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    category: string;
    filename: string;
    file_size: string;
    notes: string;
    status_classification: MemoryStatus;
  }>>([]);
  const [newFileCategory, setNewFileCategory] = useState<DocumentCategory>('Brand');
  const [newFilename, setNewFilename] = useState('');
  const [newFileNotes, setNewFileNotes] = useState('');

  // 09 AI Setup
  const [permissions, setPermissions] = useState<{
    read_client_messages: PermissionLevel;
    read_project_files: PermissionLevel;
    read_brand_guidelines: PermissionLevel;
    create_tasks: PermissionLevel;
    update_tasks: PermissionLevel;
    create_documents: PermissionLevel;
    draft_client_messages: PermissionLevel;
    send_client_messages: PermissionLevel;
    modify_client_memory: PermissionLevel;
    publish_design: PermissionLevel;
    send_invoice: PermissionLevel;
    send_quotation: PermissionLevel;
  }>({
    read_client_messages: 'allowed',
    read_project_files: 'allowed',
    read_brand_guidelines: 'allowed',
    create_tasks: 'allowed',
    update_tasks: 'allowed',
    create_documents: 'allowed',
    draft_client_messages: 'allowed',
    send_client_messages: 'approval_required',
    modify_client_memory: 'approval_required',
    publish_design: 'approval_required',
    send_invoice: 'approval_required',
    send_quotation: 'approval_required'
  });

  // Contact helper
  const addContact = () => {
    setContacts(prev => [
      ...prev,
      { name: '', role: '', email: '', phone: '', preferred_channel: 'Slack', is_primary_contact: false }
    ]);
  };

  const removeContact = (idx: number) => {
    setContacts(prev => prev.filter((_, i) => i !== idx));
  };

  const updateContact = (idx: number, field: string, val: any) => {
    setContacts(prev => {
      const next = [...prev];
      if (field === 'is_primary_contact' && val === true) {
        next.forEach((c, i) => c.is_primary_contact = (i === idx));
      } else {
        (next[idx] as any)[field] = val;
      }
      return next;
    });
  };

  // Projects helper
  const addProject = () => {
    setInitialProjects(prev => [
      ...prev,
      {
        project_name: '',
        project_type: 'Brand System',
        description: '',
        status: 'planning',
        deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        priority: 'normal',
        estimated_budget: '',
        project_notes: ''
      }
    ]);
  };

  const removeProject = (idx: number) => {
    setInitialProjects(prev => prev.filter((_, i) => i !== idx));
  };

  const updateProject = (idx: number, field: string, val: any) => {
    setInitialProjects(prev => {
      const next = [...prev];
      (next[idx] as any)[field] = val;
      return next;
    });
  };

  // Files helper
  const addUploadedFile = () => {
    if (!newFilename.trim()) return;
    setUploadedFiles(prev => [
      ...prev,
      {
        category: newFileCategory,
        filename: newFilename.trim(),
        file_size: '2.1 MB',
        notes: newFileNotes.trim(),
        status_classification: 'OFFICIAL'
      }
    ]);
    setNewFilename('');
    setNewFileNotes('');
  };

  const removeUploadedFile = (idx: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Navigation & Submit
  const handleNext = () => {
    if (currentStepIndex === 0 && !companyName.trim()) {
      setSubmitError('Company Name is required to proceed.');
      return;
    }
    setSubmitError(null);
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setSubmitError(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      setSubmitError('Company name is required');
      setCurrentStepIndex(0);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: CreateClientPayload = {
        identity: {
          company_name: companyName.trim(),
          website: website.trim() || undefined,
          industry: industry.trim() || 'Creative / Technology',
          company_size: companySize,
          location: location.trim() || undefined,
          timezone: timezone.trim() || undefined,
          company_description: companyDescription.trim() || undefined
        },
        people: contacts.filter(c => c.name.trim() !== ''),
        business: {
          business_model: businessModel.trim() || undefined,
          target_audience: targetAudience.trim() || undefined,
          primary_market: primaryMarket.trim() || undefined,
          positioning: positioning.trim() || undefined,
          value_proposition: valueProposition.trim() || undefined,
          main_products: mainProducts.trim() || undefined,
          competitors: competitors.trim() || undefined,
          business_goals: businessGoals.trim() || undefined
        },
        brand: {
          brand_personality: brandPersonality.trim() || undefined,
          brand_voice: brandVoice.trim() || undefined,
          design_style: designStyle.trim() || undefined,
          visual_principles: visualPrinciples.trim() || undefined,
          primary_colors: primaryColors.trim() || undefined,
          secondary_colors: secondaryColors.trim() || undefined,
          typography: typography.trim() || undefined,
          logo_notes: logoNotes.trim() || undefined,
          things_to_avoid: thingsToAvoid.trim() || undefined,
          brand_status: brandStatus
        },
        communication: {
          preferred_channel: preferredChannel,
          communication_tone: communicationTone.trim() || undefined,
          response_style: responseStyle.trim() || undefined,
          working_hours: workingHours.trim() || undefined,
          approval_process: approvalProcess.trim() || undefined,
          who_can_approve: whoCanApprove.trim() || undefined,
          important_communication_notes: importantCommunicationNotes.trim() || undefined
        },
        projects: initialProjects
          .filter(p => p.project_name.trim() !== '')
          .map(p => ({
            project_name: p.project_name.trim(),
            project_type: p.project_type,
            description: p.description,
            status: p.status,
            deadline: p.deadline,
            priority: p.priority,
            estimated_budget: p.estimated_budget || undefined,
            project_notes: p.project_notes || undefined
          })),
        commercial: {
          currency,
          default_rate: defaultRate.trim() || undefined,
          day_rate: dayRate.trim() || undefined,
          hourly_rate: hourlyRate.trim() || undefined,
          payment_terms: paymentTerms,
          invoice_notes: invoiceNotes.trim() || undefined,
          contract_notes: contractNotes.trim() || undefined,
          quotation_settings: quotationSettings.trim() || undefined,
          invoice_settings: invoiceSettings.trim() || undefined,
          mou_settings: mouSettings.trim() || undefined
        },
        files: uploadedFiles,
        ai_setup: permissions
      };

      const created = await api.createClient(payload);
      onSuccess(created.id);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to initialize client workspace');
      setIsSubmitting(false);
    }
  };

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Header & Breadcrumb */}
      <div>
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-secondary hover:text-ink transition-colors px-3 py-1.5 rounded-pill bg-surface border border-border shadow-subtle mb-4"
        >
          <ArrowLeft size={13} />
          <span>Exit Onboarding</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-ink-muted font-medium mb-1.5 block">
              Step {currentStep.id} of {STEPS.length} · {currentStep.title}
            </span>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-ink">
              Onboard Client Partner
            </h1>
            <p className="text-xs text-ink-secondary mt-1 font-light">
              {currentStep.desc}
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-surface px-4 py-2 rounded-pill border border-border text-xs text-ink font-mono">
            <span>{currentStepIndex + 1} / {STEPS.length}</span>
            <span className="text-ink-muted">({Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}%)</span>
          </div>
        </div>
      </div>

      {/* Step Tracker Pills */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 bg-surface p-2 rounded-card border border-border shadow-subtle overflow-x-auto scrollbar-none">
        {STEPS.map((s, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <button
              key={s.id}
              onClick={() => {
                if (idx < currentStepIndex || (companyName.trim() && idx <= currentStepIndex + 1)) {
                  setCurrentStepIndex(idx);
                }
              }}
              className={`flex flex-col items-center py-2 px-1 rounded-card-sm text-center transition-all ${
                isCurrent
                  ? 'bg-ink text-white font-semibold'
                  : isDone
                  ? 'text-ink bg-surface-secondary/70 hover:bg-surface-secondary'
                  : 'text-ink-muted hover:text-ink-secondary'
              }`}
            >
              <span className="text-[10px] font-mono leading-none mb-1">
                {isDone ? '✓' : s.id}
              </span>
              <span className="text-[11px] leading-tight truncate w-full">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {submitError && (
        <div className="p-4 rounded-card bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Form Canvas by Step */}
      <div className="bg-surface rounded-card-lg p-8 md:p-10 border border-border shadow-float relative">

        {/* ----------------- STEP 01: IDENTITY ----------------- */}
        {currentStepIndex === 0 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-normal text-ink">Client Identity</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Foundational entity information for studio scoping.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="md:col-span-2">
                <label className="block text-ink font-semibold mb-1.5">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arc Audio Systems"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none focus:border-ink/40 text-sm"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Website</label>
                <input
                  type="text"
                  placeholder="https://arcaudio.io"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Industry</label>
                <input
                  type="text"
                  placeholder="Acoustic Hardware & DSP"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Company Size</label>
                <select
                  value={companySize}
                  onChange={e => setCompanySize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
                >
                  <option value="1-10">1 - 10 employees</option>
                  <option value="10-50">10 - 50 employees</option>
                  <option value="50-200">50 - 200 employees</option>
                  <option value="200+">200+ enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Location / Headquarters</label>
                <input
                  type="text"
                  placeholder="Berlin, Germany / Remote"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-ink font-medium mb-1.5">Primary Timezone</label>
                <input
                  type="text"
                  placeholder="Central European Time (UTC+1)"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-ink font-medium mb-1.5">Company Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what the client does, their market niche, and studio collaboration intent..."
                  value={companyDescription}
                  onChange={e => setCompanyDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 02: PEOPLE ----------------- */}
        {currentStepIndex === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-normal text-ink">Client Contacts & Stakeholders</h3>
                <p className="text-xs text-ink-secondary mt-0.5">Define primary liaisons, executive sponsors, and communication channels.</p>
              </div>
              <button
                type="button"
                onClick={addContact}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus size={13} />
                <span>Add Contact</span>
              </button>
            </div>

            <div className="space-y-4">
              {contacts.map((contact, idx) => (
                <div key={idx} className="p-5 rounded-card bg-canvas border border-border space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">Contact #{idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                        <input
                          type="radio"
                          name="primary_contact_radio"
                          checked={contact.is_primary_contact}
                          onChange={() => updateContact(idx, 'is_primary_contact', true)}
                          className="accent-ink"
                        />
                        <span>Primary Contact</span>
                      </label>
                      {contacts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContact(idx)}
                          className="text-ink-muted hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-ink font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        placeholder="Sarah Lin"
                        value={contact.name}
                        onChange={e => updateContact(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-ink font-medium mb-1">Role / Title</label>
                      <input
                        type="text"
                        placeholder="VP Product Architecture"
                        value={contact.role}
                        onChange={e => updateContact(idx, 'role', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-ink font-medium mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="sarah@arcaudio.io"
                        value={contact.email}
                        onChange={e => updateContact(idx, 'email', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-ink font-medium mb-1">Phone</label>
                      <input
                        type="text"
                        placeholder="+49 30 1234 5678"
                        value={contact.phone}
                        onChange={e => updateContact(idx, 'phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-ink font-medium mb-1">Preferred Channel</label>
                      <select
                        value={contact.preferred_channel}
                        onChange={e => updateContact(idx, 'preferred_channel', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      >
                        <option value="Slack">Slack</option>
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Phone">Phone</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- STEP 03: BUSINESS ----------------- */}
        {currentStepIndex === 2 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-normal text-ink">Business Context & Market Model</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Captures strategic positioning to guide autonomous synthesis.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-ink font-medium mb-1.5">Business Model</label>
                <input
                  type="text"
                  placeholder="e.g. Hardware Sales + Pro Software Subscription"
                  value={businessModel}
                  onChange={e => setBusinessModel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Primary Target Audience</label>
                <input
                  type="text"
                  placeholder="Professional sound engineers and acoustic architects"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Primary Market</label>
                <input
                  type="text"
                  placeholder="North America & Western Europe"
                  value={primaryMarket}
                  onChange={e => setPrimaryMarket(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Market Positioning</label>
                <input
                  type="text"
                  placeholder="Precision acoustic clarity with brutalist hardware poise"
                  value={positioning}
                  onChange={e => setPositioning(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-ink font-medium mb-1.5">Value Proposition</label>
                <textarea
                  rows={2}
                  placeholder="Decoupling audiophile DSP engineering into tactile hardware and intuitive spatial software..."
                  value={valueProposition}
                  onChange={e => setValueProposition(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Main Products & Services</label>
                <input
                  type="text"
                  placeholder="Arc DSP Controller, Haptic Audio Engine"
                  value={mainProducts}
                  onChange={e => setMainProducts(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Key Competitors</label>
                <input
                  type="text"
                  placeholder="Teenage Engineering, Universal Audio, Genelec"
                  value={competitors}
                  onChange={e => setCompetitors(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-ink font-medium mb-1.5">Key Business Goals</label>
                <input
                  type="text"
                  placeholder="Launch companion spatial app by Q4 2026; elevate brand identity to luxury tier"
                  value={businessGoals}
                  onChange={e => setBusinessGoals(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 04: BRAND ----------------- */}
        {currentStepIndex === 3 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-normal text-ink">Brand Intelligence & Design Rules</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Authoritative aesthetic parameters governing vector generation and typography.</p>
            </div>

            <div className="p-4 rounded-card bg-surface-secondary/70 border border-border flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-ink block">Authority Classification</span>
                <span className="text-ink-secondary font-light">
                  Decide how the system classifies these initial rules. Only <strong className="text-ink">OFFICIAL</strong> and <strong className="text-ink">APPROVED</strong> rules are authoritative.
                </span>
              </div>
              <select
                value={brandStatus}
                onChange={e => setBrandStatus(e.target.value as MemoryStatus)}
                className="px-3 py-1.5 rounded-card-sm bg-surface border border-border text-ink font-medium"
              >
                <option value="OFFICIAL">OFFICIAL (Authoritative Rule)</option>
                <option value="APPROVED">APPROVED (Verified)</option>
                <option value="OBSERVED">OBSERVED (Tentative Pattern)</option>
                <option value="TEMPORARY">TEMPORARY (Preliminary)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-ink font-medium mb-1.5">Brand Personality</label>
                <input
                  type="text"
                  placeholder="e.g. Minimal, technical, tactile, confident"
                  value={brandPersonality}
                  onChange={e => setBrandPersonality(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Brand Voice & Cadence</label>
                <input
                  type="text"
                  placeholder="e.g. Understated clarity, peer-to-peer technical respect"
                  value={brandVoice}
                  onChange={e => setBrandVoice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Design Style</label>
                <input
                  type="text"
                  placeholder="e.g. Brutal elegance, warm gray surfaces, high contrast"
                  value={designStyle}
                  onChange={e => setDesignStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Visual Principles</label>
                <input
                  type="text"
                  placeholder="e.g. Generous negative space, large editorial display typography"
                  value={visualPrinciples}
                  onChange={e => setVisualPrinciples(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Primary Color Palette</label>
                <input
                  type="text"
                  placeholder="#F5F5F3 (Off-white), #111111 (Ink), #121212 (Dark)"
                  value={primaryColors}
                  onChange={e => setPrimaryColors(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Typography Rules</label>
                <input
                  type="text"
                  placeholder="Inter / Geist, sentence case headlines, tight tracking"
                  value={typography}
                  onChange={e => setTypography(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-ink font-medium mb-1.5 text-rose-700">
                  Things to Avoid (Hard Constraints)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Avoid neon gradients, avoid 3D glassmorphism bubbles, never use generic stock photography"
                  value={thingsToAvoid}
                  onChange={e => setThingsToAvoid(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 05: COMMUNICATION ----------------- */}
        {currentStepIndex === 4 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-normal text-ink">Communication & Approval Protocols</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Establishes how the studio AI employee communicates with external client teams.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block text-ink font-medium mb-1.5">Preferred Channel</label>
                <select
                  value={preferredChannel}
                  onChange={e => setPreferredChannel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                >
                  <option value="Slack">Slack (#client-sync)</option>
                  <option value="Email">Email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Direct Call">Direct Scheduled Call</option>
                </select>
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Working Hours</label>
                <input
                  type="text"
                  placeholder="09:00 - 18:00 CET"
                  value={workingHours}
                  onChange={e => setWorkingHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Communication Tone</label>
                <input
                  type="text"
                  placeholder="Concise, direct, friendly, no corporate buzzwords"
                  value={communicationTone}
                  onChange={e => setCommunicationTone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Response Style</label>
                <input
                  type="text"
                  placeholder="Direct bullet points with clear decision prompts"
                  value={responseStyle}
                  onChange={e => setResponseStyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Approval Process</label>
                <input
                  type="text"
                  placeholder="All external messages require approval by Matias"
                  value={approvalProcess}
                  onChange={e => setApprovalProcess(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Who Can Approve on Client Side?</label>
                <input
                  type="text"
                  placeholder="Sarah Lin (VP Product) or John Vance"
                  value={whoCanApprove}
                  onChange={e => setWhoCanApprove(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-ink font-medium mb-1.5">Important Communication Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Do not send client-facing messages without approval. Feedback usually comes asynchronously on Fridays."
                  value={importantCommunicationNotes}
                  onChange={e => setImportantCommunicationNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 06: PROJECTS ----------------- */}
        {currentStepIndex === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-xl font-normal text-ink">Initial Projects & Workspaces</h3>
                <p className="text-xs text-ink-secondary mt-0.5">Kick off projects scoped exclusively to this client.</p>
              </div>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus size={13} />
                <span>Add Initial Project</span>
              </button>
            </div>

            <div className="space-y-4">
              {initialProjects.map((proj, idx) => (
                <div key={idx} className="p-5 rounded-card bg-canvas border border-border space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-ink">Project #{idx + 1}</span>
                    {initialProjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        className="text-ink-muted hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-ink font-medium mb-1">Project Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Brand OS & Component Architecture"
                        value={proj.project_name}
                        onChange={e => updateProject(idx, 'project_name', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-ink font-medium mb-1">Project Type</label>
                      <select
                        value={proj.project_type}
                        onChange={e => updateProject(idx, 'project_type', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      >
                        <option value="Brand Identity">Brand Identity</option>
                        <option value="Brand System">Brand System</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Design">Design</option>
                        <option value="Video">Video</option>
                        <option value="Web">Web</option>
                        <option value="UI/UX">UI/UX</option>
                        <option value="Creative Campaign">Creative Campaign</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-ink font-medium mb-1">Target Deadline</label>
                      <input
                        type="date"
                        value={proj.deadline}
                        onChange={e => updateProject(idx, 'deadline', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-ink font-medium mb-1">Priority</label>
                      <select
                        value={proj.priority}
                        onChange={e => updateProject(idx, 'priority', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-ink font-medium mb-1">Estimated Budget</label>
                      <input
                        type="text"
                        placeholder="$30,000"
                        value={proj.estimated_budget}
                        onChange={e => updateProject(idx, 'estimated_budget', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-ink font-medium mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Key milestones, vector deliverable specs..."
                        value={proj.description}
                        onChange={e => updateProject(idx, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- STEP 07: COMMERCIAL ----------------- */}
        {currentStepIndex === 6 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-normal text-ink">Commercial & Billing Defaults</h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Kept strictly confidential and never displayed in public or unauthenticated client views.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div>
                <label className="block text-ink font-medium mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CHF">CHF (Fr.)</option>
                </select>
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Hourly Rate</label>
                <input
                  type="text"
                  placeholder="250"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Day Rate</label>
                <input
                  type="text"
                  placeholder="2000"
                  value={dayRate}
                  onChange={e => setDayRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-medium mb-1.5">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-ink font-medium mb-1.5">Invoice Notes</label>
                <input
                  type="text"
                  placeholder="Reference PO number on all invoices"
                  value={invoiceNotes}
                  onChange={e => setInvoiceNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-ink font-medium mb-1.5">Contract / Retainer Notes</label>
                <input
                  type="text"
                  placeholder="Tier 1 Retainer partner agreement active through Q4 2026"
                  value={contractNotes}
                  onChange={e => setContractNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-card-sm bg-canvas border border-border text-ink focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 08: FILES ----------------- */}
        {currentStepIndex === 7 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-normal text-ink">Authoritative Files & Uploads</h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Attach client brand guides, briefs, or contracts.
              </p>
            </div>

            {/* Upload form widget */}
            <div className="p-5 rounded-card bg-canvas border border-border space-y-4">
              <span className="text-xs font-semibold text-ink block">Add Client Document</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-ink font-medium mb-1">File Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Master_Brand_Book_v1.pdf"
                    value={newFilename}
                    onChange={e => setNewFilename(e.target.value)}
                    className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-ink font-medium mb-1">Category</label>
                  <select
                    value={newFileCategory}
                    onChange={e => setNewFileCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                  >
                    <option value="Brand">Brand</option>
                    <option value="Brief">Brief</option>
                    <option value="Reference">Reference</option>
                    <option value="Contract">Contract</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Invoice">Invoice</option>
                    <option value="MOU">MOU</option>
                    <option value="Project">Project</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-ink font-medium mb-1">Notes (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Approved by legal"
                      value={newFileNotes}
                      onChange={e => setNewFileNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-card-sm bg-surface border border-border text-ink focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addUploadedFile}
                      className="px-3.5 py-2 rounded-card-sm bg-ink text-white font-medium hover:bg-neutral-800 transition-colors shrink-0"
                    >
                      Attach
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* List of files attached so far */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-ink-muted">Attached Documents ({uploadedFiles.length})</span>
              {uploadedFiles.length === 0 ? (
                <div className="p-6 text-center rounded-card bg-surface-secondary/40 border border-dashed border-border text-xs text-ink-secondary">
                  No files attached yet. You can attach files now or later from the Files tab.
                </div>
              ) : (
                <div className="divide-y divide-border border border-border rounded-card overflow-hidden">
                  {uploadedFiles.map((f, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-surface">
                      <div className="flex items-center gap-3">
                        <FileText size={15} className="text-ink-muted" />
                        <div>
                          <span className="font-semibold text-ink">{f.filename}</span>
                          <span className="text-ink-muted ml-2">({f.category})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-pill bg-surface-secondary text-ink-secondary border border-border">
                          status: uploaded
                        </span>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(idx)}
                          className="text-ink-muted hover:text-rose-600 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- STEP 09: AI SETUP ----------------- */}
        {currentStepIndex === 8 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-normal text-ink">AI Employee Permissions</h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                Strict operational boundary configuring what the AI employee is permitted to perform autonomously for this client.
              </p>
            </div>

            <div className="divide-y divide-border/80 border border-border rounded-card overflow-hidden">
              {[
                { key: 'read_client_messages', label: 'Read Client Messages', desc: 'Allow reading inbound Slack / communication streams' },
                { key: 'read_project_files', label: 'Read Project Files', desc: 'Allow ingesting briefs, specifications, and project documents' },
                { key: 'read_brand_guidelines', label: 'Read Brand Guidelines', desc: 'Allow reading authoritative brand books and tokens' },
                { key: 'create_tasks', label: 'Create Tasks', desc: 'Allow queuing new workstream tasks autonomously' },
                { key: 'update_tasks', label: 'Update Tasks', desc: 'Allow advancing task states as work progresses' },
                { key: 'create_documents', label: 'Create Documents', desc: 'Allow drafting design specs and summaries' },
                { key: 'draft_client_messages', label: 'Draft Client Messages', desc: 'Allow composing draft responses for human review' },
                { key: 'send_client_messages', label: 'Send Client Messages', desc: 'Outbound dispatch to external client channels' },
                { key: 'modify_client_memory', label: 'Modify Client Memory', desc: 'Allow proposing or editing client brand knowledge' },
                { key: 'publish_design', label: 'Publish Design Assets', desc: 'Push tokens to production CDN or master Figma artboards' },
                { key: 'send_invoice', label: 'Send Invoices', desc: 'Outbound dispatch of billing vouchers and commercial claims' },
                { key: 'send_quotation', label: 'Send Quotations', desc: 'Outbound dispatch of commercial bids and project estimates' }
              ].map(p => {
                const currentVal = (permissions as any)[p.key] as PermissionLevel;
                return (
                  <div key={p.key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-surface hover:bg-surface-secondary/40 transition-colors">
                    <div>
                      <span className="font-semibold text-ink block">{p.label}</span>
                      <span className="text-[11px] text-ink-secondary font-light">{p.desc}</span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                      {(['allowed', 'approval_required', 'disabled'] as PermissionLevel[]).map(level => {
                        const isSelected = currentVal === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setPermissions(prev => ({ ...prev, [p.key]: level }))}
                            className={`px-3 py-1 rounded-pill text-[11px] font-medium transition-all ${
                              isSelected
                                ? level === 'allowed'
                                  ? 'bg-emerald-600 text-white'
                                  : level === 'approval_required'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-neutral-800 text-white'
                                : 'bg-surface-secondary text-ink-secondary hover:text-ink border border-border/70'
                            }`}
                          >
                            {level === 'allowed' ? 'Allowed' : level === 'approval_required' ? 'Approval Required' : 'Disabled'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ----------------- STEP 10: REVIEW ----------------- */}
        {currentStepIndex === 9 && (
          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-xl font-normal text-ink">Audit & Initialize Workspace</h3>
              <p className="text-xs text-ink-secondary mt-0.5">Review all client parameters before creating the persistent record.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Identity summary */}
              <div className="p-5 rounded-card bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Client Identity</span>
                  <button type="button" onClick={() => setCurrentStepIndex(0)} className="text-ink underline text-[11px]">Edit</button>
                </div>
                <div className="text-sm font-semibold text-ink">{companyName}</div>
                <div className="text-ink-secondary font-light">{industry} · {companySize} · {location || 'No location set'}</div>
                {website && <div className="text-ink font-mono text-[11px]">{website}</div>}
              </div>

              {/* People summary */}
              <div className="p-5 rounded-card bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Contacts ({contacts.filter(c => c.name).length})</span>
                  <button type="button" onClick={() => setCurrentStepIndex(1)} className="text-ink underline text-[11px]">Edit</button>
                </div>
                {contacts.filter(c => c.name).map((c, i) => (
                  <div key={i} className="text-ink">
                    <strong>{c.name}</strong> ({c.role}) · <span className="text-ink-muted">{c.email}</span>
                    {c.is_primary_contact && <span className="ml-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-pill">Primary</span>}
                  </div>
                ))}
              </div>

              {/* Brand summary */}
              <div className="p-5 rounded-card bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Brand Intelligence</span>
                  <button type="button" onClick={() => setCurrentStepIndex(3)} className="text-ink underline text-[11px]">Edit</button>
                </div>
                <div><strong className="text-ink">Personality:</strong> {brandPersonality || 'Not specified'}</div>
                <div><strong className="text-ink">Voice:</strong> {brandVoice || 'Not specified'}</div>
                <div><strong className="text-ink">Classification:</strong> <span className="font-mono text-emerald-700">{brandStatus}</span></div>
              </div>

              {/* Communication summary */}
              <div className="p-5 rounded-card bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Communication</span>
                  <button type="button" onClick={() => setCurrentStepIndex(4)} className="text-ink underline text-[11px]">Edit</button>
                </div>
                <div><strong className="text-ink">Channel:</strong> {preferredChannel}</div>
                <div><strong className="text-ink">Cadence:</strong> {communicationTone || 'Direct'}</div>
                <div><strong className="text-ink">Approver:</strong> {whoCanApprove || 'Matias'}</div>
              </div>

              {/* Projects summary */}
              <div className="p-5 rounded-card bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Initial Projects ({initialProjects.filter(p => p.project_name).length})</span>
                  <button type="button" onClick={() => setCurrentStepIndex(5)} className="text-ink underline text-[11px]">Edit</button>
                </div>
                {initialProjects.filter(p => p.project_name).map((p, i) => (
                  <div key={i} className="text-ink">
                    {p.project_name} <span className="text-ink-muted">({p.project_type} · Due {p.deadline})</span>
                  </div>
                ))}
              </div>

              {/* Commercial summary */}
              <div className="p-5 rounded-card bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink uppercase tracking-wider text-[10px]">Commercial Defaults</span>
                  <button type="button" onClick={() => setCurrentStepIndex(6)} className="text-ink underline text-[11px]">Edit</button>
                </div>
                <div><strong className="text-ink">Currency:</strong> {currency} · <strong className="text-ink">Terms:</strong> {paymentTerms}</div>
                {defaultRate && <div><strong className="text-ink">Rate:</strong> ${defaultRate}/hr</div>}
              </div>
            </div>

            <div className="p-4 rounded-card bg-surface-secondary/70 border border-border text-xs text-ink-secondary flex items-center justify-between">
              <span>On submit: creates client record, contacts, initial projects, documents, memories, and audit ledger.</span>
              <span className="font-semibold text-ink">Zero fake AI activity</span>
            </div>
          </div>
        )}

        {/* Footer Navigation Bar */}
        <div className="pt-8 mt-8 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isSubmitting}
            className="px-5 py-2.5 rounded-pill bg-surface text-ink-secondary hover:text-ink border border-border text-xs font-medium transition-colors disabled:opacity-40"
          >
            Back
          </button>

          <div className="flex items-center gap-3">
            {currentStepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-2.5 rounded-pill bg-ink text-white hover:bg-neutral-800 text-xs font-medium transition-colors shadow-subtle flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-2.5 rounded-pill bg-ink text-white hover:bg-neutral-800 text-xs font-semibold transition-colors shadow-subtle flex items-center gap-2 disabled:opacity-50"
              >
                <Check size={14} strokeWidth={2.5} />
                <span>{isSubmitting ? 'Initializing Workspace...' : 'Create Client Workspace'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
