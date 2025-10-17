import { useState, type FormEvent } from 'react';
import type { Disclaimer, Input, Textarea } from '~/types';

interface FormProps {
  inputs?: Array<Input>;
  textarea?: Textarea;
  disclaimer?: Disclaimer;
  button?: React.ReactNode;
  description?: string;
}

const Form: React.FC<FormProps> = ({ inputs, textarea, disclaimer, button, description = '' }) => {
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    formData.append('access_key', '16ecc69a-3fff-4f54-b8bd-9c62bc40e5ca');

    const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });

    if (response.ok) {
      setResponseMessage('Thank you! We will get back to you soon.');
    } else {
      const data = await response.json();
      console.error(`Error from form submission API: ${JSON.stringify(data)}`);
      setResponseMessage(
        'Oops! An error occurred while sending your message. Please send us an email directly at info@archodex.com. We apologize for the inconvenience.',
      );
    }
  }

  if (responseMessage) {
    return <div className="text-center">{responseMessage}</div>;
  }

  return (
    <form onSubmit={submit}>
      {inputs &&
        inputs.map(
          ({ type = 'text', name, label = '', autocomplete = 'on', placeholder = '', value }, i) =>
            name && (
              <div key={i} className={`mb-6 ${type === 'hidden' ? 'hidden' : 'block'}`}>
                {label && (
                  <label htmlFor={name} className="block text-sm font-medium">
                    {label}
                  </label>
                )}
                <input
                  type={type}
                  name={name}
                  id={name}
                  autoComplete={autocomplete}
                  placeholder={placeholder}
                  value={value}
                  className="py-3 px-4 block w-full text-md rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                />
              </div>
            ),
        )}

      {textarea && (
        <div>
          <label htmlFor={textarea.name ? textarea.name : 'message'} className="block text-sm font-medium">
            {textarea.label}
          </label>
          <textarea
            id="textarea"
            name={textarea.name ? textarea.name : 'message'}
            rows={textarea.rows ? textarea.rows : 15}
            placeholder={textarea.placeholder}
            value={textarea.value}
            className="py-3 px-4 block w-full text-md rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
          />
        </div>
      )}

      {disclaimer && (
        <div className="mt-3 flex items-start">
          <div className="flex mt-0.5">
            <input
              id="disclaimer"
              name="disclaimer"
              type="checkbox"
              className="cursor-pointer mt-1 py-3 px-4 block w-full text-md rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
          </div>
          <div className="ml-3">
            <label
              htmlFor="disclaimer"
              className="cursor-pointer select-none text-sm text-neutral-600 dark:text-neutral-400"
            >
              {disclaimer.label}
            </label>
          </div>
        </div>
      )}

      <input type="checkbox" name="botcheck" className="hidden" />

      {button && <div className="mt-10 grid">{button}</div>}

      {description && (
        <div className="mt-3 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
      )}
    </form>
  );
};

export default Form;
