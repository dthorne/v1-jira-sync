#!/usr/bin/env node
const moment = require('moment');
const jiraIssuesService = require('./services/jiraIssuesService');
const v1Service = require('./services/v1Service');
const args = require('command-line-args')([
  {name: 'jiraFilterId', alias: 'f', type: Number},
  {name: 'username', alias: 'u', type: String},
  {name: 'password', alias: 'p', type: String},
  {name: 'v1Token', alias: 'v', type: String},
  {name: 'teamName', alias: 't', type: String}
]);

async function run(jiraFilterId, username = process.env.JIRA_USERNAME, password = process.env.JIRA_PASSWORD, v1Token = process.env.V1_ACCESS_TOKEN) {
  try {
    var sessionId = await jiraIssuesService.getSessionId(username, password);
    var issues = await jiraIssuesService.getIssuesFromFilter(jiraFilterId, sessionId);
    issues = await Promise.all(issues.map(async (issue) => {
      try {
        var memberId = await v1Service.findMemberId(v1Token, issue.assigneeName);
        return Object.assign(issue, {memberId});
      } catch(ex) {
        return issue;
      }
    }));
    var storyId = await v1Service.getIterationBugStoryId(v1Token, 'TW 2');
    //TODO: POST new tasks to story

    jiraIssuesService.prettyPrintIssues(issues);
    console.log(`Bug Story ID: ${storyId}`);
  } catch(ex) {
    console.error(ex);
  }
}

run(args.jiraFilterId, args.username, args.password, args.v1Token);