const fetch = require('node-fetch');
const clc = require('cli-color');

async function getSessionId(username, password) {
  var response = await fetch('https://almtools.ldschurch.org/fhjira/rest/auth/1/session', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username,
      password
    })
  });

  var data = await response.json();
  if(!data.session){
    throw new Error(`Cannot get session id for user: ${username}`)
  }
  
  return data.session.value;
}

async function getQueryUrl(id = 34568) {
  var response = await fetch(`https://almtools.ldschurch.org/fhjira/rest/api/2/filter/${id}`, {
    headers: {Cookie: 'JSESSIONID=CD38DE3E8D487C3606C7FDE27E96BCFE'}
  });

  var data = await response.json();

  return data.searchUrl;
}

async function getIssuesFromFilter(id, sessionId) {
  var searchUrl = await getQueryUrl(id);

  var response = await fetch(searchUrl, {
    headers: {Cookie: `JSESSIONID=${sessionId}`}
  });

  var data = await response.json();

  return data.issues.map(mapIssue);
}

function prettyPrintIssues(issues) {
  var str = issues.reduce((acc, issue, i) =>  {
    var prettyIssue = `
    ${clc.cyan.bold(issue.key)}
      ${clc.greenBright(issue.summary)}
      ${issue.assigneeName}
    `;
    return acc + prettyIssue;
  }, '');
  process.stdout.write(str); 
}

function mapIssue(issue) {
  return {
    key: issue.key,
    link: issue.self,
    labels: issue.fields.labels,
    assignee: issue.fields.assignee.name,
    assigneeName: issue.fields.assignee.displayName,
    summary: issue.fields.summary
  }
}

module.exports = {
  getIssuesFromFilter,
  getSessionId,
  prettyPrintIssues
}