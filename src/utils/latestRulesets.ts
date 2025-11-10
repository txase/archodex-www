import * as yaml from 'yaml';
import type { ArchodexAgentVersion, ArchodexRuleName, ArchodexRuleset } from '~/types';

const ARCHODEX_PROD_DOMAIN = 'archodex.com';

export const rulesDomain = (domain = import.meta.env.PUBLIC_ARCHODEX_DOMAIN) => `rules.${domain}`;

export const fetchRule = async (domain: string, version: ArchodexAgentVersion, rule: ArchodexRuleName) => {
  const res = await fetch(`https://${domain}/${version}/${rule}.yaml`);
  const body = await res.text();

  const yamlDoc = yaml.parseDocument(body);
  if (!yamlDoc) {
    throw new Error(`Failed to parse rule ${rule}`);
  }

  const ruleset = yamlDoc.toJS() as ArchodexRuleset;
  ruleset.Id = rule;

  // Remove all keys except 'Rules' so we can stringify Rules alone
  for (const key in ruleset) {
    if (key !== 'Rules' && key !== 'Contexts') {
      yamlDoc.delete(key);
    }
  }

  ruleset.RulesYaml = yamlDoc.toString();

  return ruleset;
};

const fetchRulesForVersion = async (domain: string, version: ArchodexAgentVersion) => {
  const res = await fetch(`https://${domain}/${version}/rules.json`);
  const { rules: ruleNames }: { rules: string[] } = await res.json();

  const rules = {} as Record<ArchodexRuleName, ArchodexRuleset>;
  const rulePromises = ruleNames.map(async (rule) => {
    rules[rule] = await fetchRule(domain, version, rule);
  });

  await Promise.all(rulePromises);

  return rules;
};

let _latestRules:
  | {
      latestVersion: ArchodexAgentVersion;
      rulesets: Record<ArchodexAgentVersion, Record<ArchodexRuleName, ArchodexRuleset>>;
    }
  | undefined;
export const latestRulesets = async () => {
  if (_latestRules) return _latestRules;

  let domain = rulesDomain();

  let versionsRes = await fetch(`https://${domain}/versions.json`);
  if (!versionsRes.ok && import.meta.env.PUBLIC_ARCHODEX_DOMAIN !== ARCHODEX_PROD_DOMAIN) {
    // Operating on a developer domain which may not have rules published - attempt to fall back to production
    console.warn(`WARNING: Failed to fetch versions from ${domain}: ${versionsRes.status} ${versionsRes.statusText}`);
    domain = rulesDomain(ARCHODEX_PROD_DOMAIN);
    console.warn(`         Attempting to fall back to production - using ${domain}`);
    versionsRes = await fetch(`https://${domain}/versions.json`);
  }
  if (!versionsRes.ok) {
    throw new Error(`Failed to fetch versions from ${domain}: ${versionsRes.status} ${versionsRes.statusText}`);
  }
  const { versions }: { versions: ArchodexAgentVersion[] } = await versionsRes.json();

  // We map/reduce to keep the same versions order, which is sorted from latest to oldest
  const versionPromises = versions.map(async (version) => {
    const rules = await fetchRulesForVersion(domain, version);
    return { version, rules };
  });

  const versionRulesets = await Promise.all(versionPromises);

  _latestRules = {
    latestVersion: versions[0],
    rulesets: versionRulesets.reduce(
      (acc, { version, rules }) => {
        acc[version] = rules;
        return acc;
      },
      {} as Record<ArchodexAgentVersion, Record<ArchodexRuleName, ArchodexRuleset>>,
    ),
  };
  return _latestRules;
};
