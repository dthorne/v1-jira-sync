#!/usr/bin/env node
const jiraIssuesService = require('./services/jiraIssuesService');
const args = require('command-line-args')([
  {name: 'jiraFilterId', alias: 'f', type: Number},
  {name: 'username', alias: 'u', type: String},
  {name: 'password', alias: 'p', type: String}
]);

async function run(jiraFilterId, username = process.env.JIRA_USERNAME, password = process.env.JIRA_PASSWORD) {
  try {
    var sessionId = await jiraIssuesService.getSessionId(username, password);
    var issues = await jiraIssuesService.getIssuesFromFilter(jiraFilterId, sessionId);
    jiraIssuesService.prettyPrintIssues(issues);


  } catch(ex) {
    console.error(ex);
  }
}

run(args.jiraFilterId, args.username, args.password);