import { useEffect, useState } from 'react';
import { ExpressiveCode } from 'expressive-code';
import { toHtml } from 'expressive-code/hast';

import type { ArchodexAgentVersion, ArchodexRuleset, ArchodexRulesets } from '~/types';
import { fetchRule, rulesDomain } from '~/utils/latestRulesets';

const ec = new ExpressiveCode({
  customizeTheme: (theme) => {
    theme.name = theme.name.replace('github-', '');
  },
});

interface RulesetProps {
  rulesets: ArchodexRulesets;
  latestVersion: ArchodexAgentVersion;
}

const Ruleset: React.FC<RulesetProps> = ({ rulesets, latestVersion }) => {
  const [ruleset, setRuleset] = useState<ArchodexRuleset>();
  const [baseStyles, setBaseStyles] = useState<string>('');
  const [themeStyles, setThemeStyles] = useState<string>('');
  const [jsModules, setJsModules] = useState<string[]>([]);
  const [enableCodeHtml, setEnableCodeHtml] = useState<string>('');
  const [enableCodeBlockStyles, setEnableCodeBlockStyles] = useState<Set<string>>(new Set());
  const [rulesYamlHtml, setRulesYamlHtml] = useState<string>('');
  const [rulesYamlBlockStyles, setRulesYamlBlockStyles] = useState<Set<string>>(new Set());

  const id = window.location.pathname.split('/').pop() as string;

  useEffect(() => {
    fetchRule(rulesDomain(), 'dev', id).then(setRuleset);

    // Update static title with ruleset ID
    const _top = document.getElementById('_top');
    if (_top) {
      _top.innerText = id;
    }

    // Update the sidebar entry to show the current page
    const sidebarEntry = document.querySelector(`a[href="/docs/rulesets/${id}"]`);
    if (sidebarEntry) {
      sidebarEntry.setAttribute('aria-current', 'page');
    }
  }, [id]);

  useEffect(() => {
    ec.getBaseStyles().then(setBaseStyles);
    ec.getThemeStyles().then(setThemeStyles);
    ec.getJsModules().then(setJsModules);
  }, []);

  useEffect(() => {
    if (!ruleset) return;

    const enableCode = ruleset.Default
      ? `$ archodex --disable-rulesets ${id}\n# or\n$ ARCHODEX_DISABLE_RULESETS=${id} archodex`
      : `$ archodex --enable-rulesets ${id}\n# or\n$ ARCHODEX_ENABLE_RULESETS=${id} archodex`;

    ec.render({ code: enableCode, language: 'sh' }).then(({ renderedGroupAst, styles: blockStyles }) => {
      setEnableCodeHtml(toHtml(renderedGroupAst));
      setEnableCodeBlockStyles(blockStyles);
    });

    ec.render({ code: ruleset.RulesYaml, language: 'yaml' }).then(({ renderedGroupAst, styles: blockStyles }) => {
      setRulesYamlHtml(toHtml(renderedGroupAst));
      setRulesYamlBlockStyles(blockStyles);
    });
  }, [ruleset]);

  if (!ruleset) {
    return (
      <>
        <VersionForm id={id} rulesets={rulesets} latestVersion={latestVersion} />
        <p>Loading...</p>
      </>
    );
  }

  const stylesToPrepend: string[] = ['.frame > pre, .frame .ec-line { margin-top: 0 !important; }'];
  stylesToPrepend.push(baseStyles);
  stylesToPrepend.push(themeStyles);
  stylesToPrepend.push(...enableCodeBlockStyles);
  stylesToPrepend.push(...rulesYamlBlockStyles);

  const inputs = Object.entries(ruleset?.Inputs || {});

  return (
    <>
      <VersionForm id={id} rulesets={rulesets} latestVersion={latestVersion} />

      <style dangerouslySetInnerHTML={{ __html: [...stylesToPrepend].join('') }} />
      <script type="module" dangerouslySetInnerHTML={{ __html: jsModules.join('') }} />
      <h2 id="description">{ruleset.Name} Archodex Ruleset</h2>
      <p>{ruleset.Description}</p>
      <h3 id="how_to_enable">How to Enable</h3>
      {ruleset.Default ? (
        <p>This ruleset is enabled by default. To disable:</p>
      ) : (
        <p>This ruleset is disabled by default. To enable:</p>
      )}
      <div dangerouslySetInnerHTML={{ __html: enableCodeHtml }} />
      <h3 id="inputs">Inputs</h3>
      {inputs.length > 0 ? (
        inputs.map(([name, definition]) => (
          <div key={name}>
            <h4 id={`inputs_${name}`}>{name}</h4>
            <p>{definition.Description}</p>
            <div>
              <strong>Required:</strong> {definition.Required ? 'Yes' : 'No'}
              <br />
              <strong>Command Line Argument:</strong>{' '}
              <code>
                --ruleset-input {ruleset.Id}:{name}={'<value>'}
              </code>
              <br />
              <strong>Environment Variables:</strong>
              <ul>
                <li>
                  <code>{`ARCHODEX_RULESET_INPUT_${camelToUpperCase(ruleset.Id).replace('@', '_')}_${camelToUpperCase(name)}`}</code>
                </li>
                <li>
                  <code>{camelToUpperCase(name)}</code>
                </li>
              </ul>
            </div>
          </div>
        ))
      ) : (
        <p>No inputs required</p>
      )}
      <h3 id="contexts_and_rules">Contexts and Rules</h3>
      <div dangerouslySetInnerHTML={{ __html: rulesYamlHtml }} />
    </>
  );
};

interface VersionFormProps {
  id: string;
  rulesets: ArchodexRulesets;
  latestVersion: ArchodexAgentVersion;
}

const VersionForm: React.FC<VersionFormProps> = ({ id, rulesets, latestVersion }) => {
  return (
    <>
      <form>
        <label htmlFor="version">
          <strong>Agent Version:</strong>
        </label>
        <select
          id="version"
          defaultValue={`/docs/rulesets/dev/${id}`}
          onChange={(e) => (window.location.href = e.target.value)}
        >
          <option value={`/docs/rulesets/dev/${id}`}>Dev</option>
          <option value={`/docs/rulesets/${id}`}>Latest ({latestVersion.replace(/^agent-/, '')})</option>
          {Object.keys(rulesets)
            .filter((ver) => id in rulesets[ver])
            .map((ver) => (
              <option key={ver} value={`/docs/rulesets/${ver}/${id}`}>
                {ver.replace(/^agent-/, '')}
              </option>
            ))}
        </select>
      </form>
    </>
  );
};

const camelToUpperCase = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
};

export default Ruleset;
