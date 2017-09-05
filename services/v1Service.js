const fetch = require('node-fetch');
const moment = require('moment');
const getStory = async (v1Token, storyId = 711813) => {
  var data = await (await fetch(`https://www5.v1host.com/FH-V1/rest-1.v1/Data/Story/${storyId}`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${v1Token}`
    }
  })).json();
  return data;
} 

const query = async (v1Token, query) => {
  return await (await fetch(`https://www5.v1host.com/FH-V1/query.v1`, {
    method: 'POST',
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${v1Token}`
    },
    body: JSON.stringify(query)
  })).json();
} 

const getIterationBugStoryId = async (v1Token, teamName) => {
  try {
    const iterationDate = await getCurrentIterationDate(v1Token, moment())
    var stories = await query(v1Token, {
      from: "Story", 
      select: ['Name', 'Team.Name'],
      find: iterationDate,
      findin: ["Name"],
      where: {
        'Team.Name': teamName
      }
    });
    return stories[0].find(story => story.Name.includes('Defects'))._oid;
  } catch(ex) {
    throw(ex);
  }
}

const findMemberId = async (v1Token, name) => {
  var memberInfo = await (await fetch(`https://www5.v1host.com/FH-V1/rest-1.v1/Data/Member?find=${name}&findIn=Name`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${v1Token}`
    }
  })).json();
  if(memberInfo.Assets[0])
    return memberInfo.Assets[0].id;
  else
    throw new Error(`No member with name: ${name}`);
}

//Gets the timebox (iteration name) for the iteration you will be in in 7 days. Today + 7's current iteration
const getCurrentIterationDate = async (v1Token, today) => {
  var timeboxes = await (await fetch(`https://www5.v1host.com/FH-V1/rest-1.v1/Data/Timebox`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${v1Token}`
    }
  })).json();

  var theTimebox = timeboxes.Assets.filter(timebox => {
    return timebox.Attributes.Name.value.includes('Tree Web');
  }).map(timebox => {
    return {
      name: timebox.Attributes.Name.value,
      endDate: timebox.Attributes.EndDate.value,
      beginDate: timebox.Attributes.BeginDate.value
    }
  }).find(timebox => moment(today).add(7, 'days').isBetween(timebox.beginDate, timebox.endDate))

  return moment(theTimebox.endDate).subtract(1, 'days').format('YYYYMMDD');
}

const getNewTask

module.exports = {
  getStory,
  query,
  getIterationBugStoryId,
  findMemberId
}