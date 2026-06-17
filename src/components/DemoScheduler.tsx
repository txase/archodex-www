import { useEffect, useRef, useState } from 'react';

const LEAD_SOURCE = 'request-demo';
const CAL_LINK = 'chasedouglas/archodex-demo';
const CAL_NAMESPACE = 'archodex-demo';
const CAL_SCRIPT_SRC = 'https://app.cal.com/embed/embed.js';
const CAL_URL = `https://cal.com/${CAL_LINK}`;

type CalendarStatus = 'loading' | 'ready' | 'error';
type CalQueueItem = unknown[];
type CalApi = ((...args: unknown[]) => void) & { loaded?: boolean; ns?: Record<string, CalApi>; q?: CalQueueItem[] };
type CalEvent<TData = Record<string, unknown>> = { detail?: { data?: TData; type?: string; namespace?: string } };
type CalBookingSuccessfulData = {
  allBookings?: unknown;
  eventTypeId?: number | null;
  isRecurring?: boolean;
  paymentRequired?: boolean;
  status?: string;
};
type PostHogProperties = Record<string, boolean | number | string | string[] | null | undefined>;
type PostHogApi = { capture?: (eventName: string, properties?: PostHogProperties) => void };

type CalWindow = Window & { Cal?: CalApi };
type AnalyticsWindow = Window & { posthog?: PostHogApi };

const capturePostHogEvent = (eventName: string, properties: PostHogProperties) => {
  (window as AnalyticsWindow).posthog?.capture?.(eventName, properties);
};

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

const getBookingCount = (allBookings: unknown) => (Array.isArray(allBookings) ? allBookings.length : undefined);

const createAnalyticsProperties = (): PostHogProperties => ({
  cal_link: CAL_LINK,
  lead_source: LEAD_SOURCE,
  page: 'contact/request-demo',
});

const DemoScheduler = () => {
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatus>('loading');
  const calendarContainerRef = useRef<HTMLDivElement | null>(null);
  const calendarInitializedRef = useRef(false);

  useEffect(() => {
    if (calendarInitializedRef.current) {
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
    namespacedCal('on', {
      action: 'bookingSuccessfulV2',
      callback: (event: CalEvent<CalBookingSuccessfulData>) => {
        const data = event.detail?.data;

        capturePostHogEvent('request_demo_calendar_booking_successful', {
          ...createAnalyticsProperties(),
          booking_count: getBookingCount(data?.allBookings),
          booking_status: data?.status,
          event_type_id: data?.eventTypeId,
          is_recurring: data?.isRecurring,
          payment_required: data?.paymentRequired,
        });
      },
    });
    namespacedCal('inline', {
      elementOrSelector: calendarContainer,
      calLink: CAL_LINK,
      config: { 'metadata[lead_source]': LEAD_SOURCE, 'metadata[page]': 'contact/request-demo' },
      layout: 'month_view',
    });
    namespacedCal('ui', {
      hideEventTypeDetails: false,
      layout: 'month_view',
      cssVarsPerTheme: { light: { 'cal-brand': '#ee847b' }, dark: { 'cal-brand': '#ee847b' } },
    });

    return () => window.removeEventListener('archodex:cal-embed-error', handleCalError);
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <h2 className="font-heading text-2xl font-bold tracking-tight">Schedule time with Archodex</h2>
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
          Loading available demo times...
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
        aria-label="Archodex demo scheduler"
      />
    </div>
  );
};

export default DemoScheduler;
