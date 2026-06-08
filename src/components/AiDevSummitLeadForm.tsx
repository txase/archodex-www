import { useEffect, useId, useRef, useState, type FormEvent } from 'react';

const WEB3FORMS_ACCESS_KEY = '24e4f048-defc-4f56-9aa2-b7814e26a9cc';
const LEAD_SOURCE = 'AI DevSummit NY 2026';
const SUBJECT = 'AI DevSummit NY Private Beta Request';

const CAL_LINK = 'chasedouglas/archodex-onboarding';
const CAL_NAMESPACE = 'archodex-onboarding';
const CAL_SCRIPT_SRC = 'https://app.cal.com/embed/embed.js';
const CAL_URL = `https://cal.com/${CAL_LINK}`;
const CALENDAR_PREVIEW_PARAMS = ['skip_form', 'show_calendar'];

const useCaseOptions = ['Coding Assistant', 'Other AI Assistant', 'AI Workloads'];
const featureInterestOptions = [
  'Universal AI Firewall',
  'API Key Custody / Injection',
  'Shadow AI Detection',
  'Auditing / Forensics',
  'Observability',
];

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';
type CalendarStatus = 'idle' | 'loading' | 'ready' | 'error';

interface SubmittedLead {
  name: string;
  email: string;
  useCases: string[];
  useCaseDetails: string;
  featureInterests: string[];
}

type CalQueueItem = unknown[];
type CalApi = ((...args: unknown[]) => void) & { loaded?: boolean; ns?: Record<string, CalApi>; q?: CalQueueItem[] };
type CalPrefillConfig = Record<string, string>;

type CalWindow = Window & { Cal?: CalApi };

const pushCalCommand = (api: CalApi, args: CalQueueItem) => {
  api.q = api.q || [];
  api.q.push(args);
};

const installCalEmbed = () => {
  const calWindow = window as CalWindow;

  if (calWindow.Cal) {
    return;
  }

  const calApi = ((...args: unknown[]) => {
    const cal = calWindow.Cal;

    if (!cal) {
      return;
    }

    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];

      const script = document.createElement('script');
      script.async = true;
      script.src = CAL_SCRIPT_SRC;
      script.addEventListener('error', () => {
        window.dispatchEvent(new CustomEvent('archodex:cal-embed-error'));
      });
      document.head.appendChild(script);

      cal.loaded = true;
    }

    if (args[0] === 'init') {
      const namespace = args[1];
      const namespaceApi = ((...namespaceArgs: unknown[]) => {
        pushCalCommand(namespaceApi, namespaceArgs);
      }) as CalApi;

      namespaceApi.q = namespaceApi.q || [];

      if (typeof namespace === 'string') {
        cal.ns = cal.ns || {};
        cal.ns[namespace] = cal.ns[namespace] || namespaceApi;
        pushCalCommand(cal.ns[namespace], args);
        pushCalCommand(cal, ['initNamespace', namespace]);
      } else {
        pushCalCommand(cal, args);
      }

      return;
    }

    pushCalCommand(cal, args);
  }) as CalApi;

  calWindow.Cal = calApi;
};

const getSelectedValues = (formData: FormData, name: string) =>
  formData.getAll(name).filter((value): value is string => typeof value === 'string' && value.length > 0);

const hasCalendarPreviewParam = () => {
  const params = new URLSearchParams(window.location.search);

  return CALENDAR_PREVIEW_PARAMS.some((param) => {
    const value = params.get(param)?.toLowerCase();
    return value === '1' || value === 'true' || value === 'yes';
  });
};

const getCalendarPreviewLead = (): SubmittedLead | null => {
  if (!hasCalendarPreviewParam()) {
    return null;
  }

  return { name: '', email: '', useCases: [], useCaseDetails: '', featureInterests: [] };
};

const formatMarkdownList = (values: string[]) =>
  values.length ? values.map((value) => `- ${value}`).join('\n') : '- Not specified';

const createCalendarNotes = ({ useCases, useCaseDetails, featureInterests }: SubmittedLead) => {
  if (!useCases.length && !useCaseDetails && !featureInterests.length) {
    return '';
  }

  const notes = [
    'AI DevSummit private beta request',
    `Use cases:\n${formatMarkdownList(useCases)}`,
    `Assistants or workload frameworks:\n${useCaseDetails || 'Not specified'}`,
    `Feature interests:\n${formatMarkdownList(featureInterests)}`,
  ];

  return notes.join('\n\n');
};

const getCalPrefillConfig = (submittedLead: SubmittedLead): CalPrefillConfig => {
  const config: CalPrefillConfig = { 'metadata[lead_source]': LEAD_SOURCE };
  const notes = createCalendarNotes(submittedLead);

  if (submittedLead.name) {
    config.name = submittedLead.name;
  }

  if (submittedLead.email) {
    config.email = submittedLead.email;
  }

  if (notes) {
    config.notes = notes;
  }

  return config;
};

const createMessage = ({
  name,
  email,
  useCases,
  useCaseDetails,
  featureInterests,
}: {
  name: string;
  email: string;
  useCases: string[];
  useCaseDetails: string;
  featureInterests: string[];
}) => `AI DevSummit NY private beta lead

Name: ${name}
Email: ${email}
Lead source: ${LEAD_SOURCE}

Use cases:
${useCases.length ? useCases.map((value) => `- ${value}`).join('\n') : '- Not specified'}

Use case details:
${useCaseDetails || 'Not specified'}

Feature interests:
${featureInterests.length ? featureInterests.map((value) => `- ${value}`).join('\n') : '- Not specified'}
`;

const AiDevSummitLeadForm = () => {
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedLead, setSubmittedLead] = useState<SubmittedLead | null>(null);
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const calendarInitializedRef = useRef(false);
  const formId = useId();

  useEffect(() => {
    const previewLead = getCalendarPreviewLead();

    if (!previewLead) {
      return;
    }

    setSubmittedLead(previewLead);
    setSubmitStatus('success');
  }, []);

  useEffect(() => {
    if (submitStatus !== 'success' || !submittedLead || calendarInitializedRef.current) {
      return;
    }

    const calendarContainer = calendarContainerRef.current;

    if (!calendarContainer) {
      return;
    }

    calendarInitializedRef.current = true;
    setCalendarStatus('loading');
    calendarContainer.innerHTML = '';

    const handleCalError = () => setCalendarStatus('error');
    window.addEventListener('archodex:cal-embed-error', handleCalError);

    installCalEmbed();

    const cal = (window as CalWindow).Cal;

    if (!cal) {
      setCalendarStatus('error');
      return () => window.removeEventListener('archodex:cal-embed-error', handleCalError);
    }

    cal('init', CAL_NAMESPACE, { origin: 'https://cal.com' });

    const namespacedCal = cal.ns?.[CAL_NAMESPACE];

    if (!namespacedCal) {
      setCalendarStatus('error');
      return () => window.removeEventListener('archodex:cal-embed-error', handleCalError);
    }

    namespacedCal('on', { action: 'linkReady', callback: () => setCalendarStatus('ready') });
    namespacedCal('on', { action: 'linkFailed', callback: () => setCalendarStatus('error') });
    namespacedCal('inline', {
      elementOrSelector: calendarContainer,
      calLink: CAL_LINK,
      config: getCalPrefillConfig(submittedLead),
      layout: 'month_view',
    });
    namespacedCal('ui', {
      hideEventTypeDetails: false,
      layout: 'month_view',
      cssVarsPerTheme: { light: { 'cal-brand': '#ee847b' }, dark: { 'cal-brand': '#ee847b' } },
    });

    return () => window.removeEventListener('archodex:cal-embed-error', handleCalError);
  }, [submitStatus, submittedLead]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    const form = e.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const useCases = getSelectedValues(formData, 'use_cases');
    const useCaseDetails = String(formData.get('use_case_details') || '').trim();
    const featureInterests = getSelectedValues(formData, 'feature_interests');

    const payload = new FormData();
    payload.append('access_key', WEB3FORMS_ACCESS_KEY);
    payload.append('subject', SUBJECT);
    payload.append('lead_source', LEAD_SOURCE);
    payload.append('name', name);
    payload.append('email', email);
    payload.append('use_cases', useCases.join(', '));
    payload.append('use_case_details', useCaseDetails);
    payload.append('feature_interests', featureInterests.join(', '));
    payload.append('message', createMessage({ name, email, useCases, useCaseDetails, featureInterests }));

    if (formData.get('botcheck')) {
      payload.append('botcheck', 'on');
    }

    setSubmitStatus('submitting');

    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: payload });

      if (!response.ok) {
        const data = await response.json().catch(() => undefined);
        console.error(`Error from form submission API: ${JSON.stringify(data)}`);
        throw new Error('Form submission failed.');
      }

      setSubmittedLead({ name, email, useCases, useCaseDetails, featureInterests });
      setSubmitStatus('success');
    } catch (error) {
      console.error(error);
      setErrorMessage(
        'Oops! An error occurred while sending your request. Please email us directly at info@archodex.com.',
      );
      setSubmitStatus('error');
    }
  };

  if (submitStatus === 'success' && submittedLead) {
    return (
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase text-primary">You are in</p>
          <p className="text-muted">
            We received your private beta request. Pick a time below and we will use the call to get you onboarded.
          </p>
          <a
            className="text-sm font-semibold text-primary hover:underline"
            href={CAL_URL}
            target="_blank"
            rel="noreferrer"
          >
            Open scheduler in a new tab
          </a>
        </div>

        {calendarStatus === 'loading' && (
          <p className="text-center text-sm text-muted" aria-live="polite">
            Loading available onboarding times...
          </p>
        )}

        {calendarStatus === 'error' && (
          <p className="text-center text-sm text-muted" aria-live="polite">
            The embedded scheduler did not load. Use the link above to schedule directly.
          </p>
        )}

        <div
          ref={calendarContainerRef}
          className="min-h-[42rem] w-full overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
          aria-label="Archodex onboarding scheduler"
        />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="mb-2 font-heading text-2xl font-bold tracking-tight">Join the private beta</h2>
        <p className="text-sm text-muted">Tell us what you are building and which controls matter most.</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <input type="hidden" name="subject" value={SUBJECT} />
        <input type="hidden" name="lead_source" value={LEAD_SOURCE} />

        <div>
          <label htmlFor={`${formId}-name`} className="block text-sm font-medium">
            Name
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-md dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className="block text-sm font-medium">
            Email
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-md dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium">Use case</legend>
          <div className="mt-3 grid gap-3">
            {useCaseOptions.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <input
                  type="checkbox"
                  name="use_cases"
                  value={option}
                  className="mt-0.5 size-4 rounded border-neutral-300 accent-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={`${formId}-use-case-details`} className="block text-sm font-medium">
            Use case details
          </label>
          <p className="mt-1 text-sm text-muted">Which assistants or workload frameworks are you using?</p>
          <textarea
            id={`${formId}-use-case-details`}
            name="use_case_details"
            rows={4}
            className="mt-2 block w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-md dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium">Feature Interest</legend>
          <div className="mt-3 grid gap-3">
            {featureInterestOptions.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <input
                  type="checkbox"
                  name="feature_interests"
                  value={option}
                  className="mt-0.5 size-4 rounded border-neutral-300 accent-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} />

        {errorMessage && (
          <p className="text-sm text-primary" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={submitStatus === 'submitting'}
          className="btn-primary w-full disabled:opacity-70"
        >
          {submitStatus === 'submitting' ? 'Submitting...' : 'Join the private beta'}
        </button>
      </form>
    </>
  );
};

export default AiDevSummitLeadForm;
