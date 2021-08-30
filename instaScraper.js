//Use the ?__a=1 endpoint to create a .json object and get the user.id from it
function getUserId(userName) {
  return fetch(`https://www.instagram.com/${userName}/?__a=1`)
  .then(response => response.json())
  .then(data => data.graphql.user.id)
}

async function main(userName = "") {
  let user_id = await getUserId(userName)
  let query_hash = await getHash();
  let variables = {"id": user_id, "include_reel": false, "fetch_mutual": false, "first": 50, "after": "QVFCU2w2Wm5Bd0d4LW9ZVnFxc3htb2pFYTgtMkpWampxSGFiajhFRUNCWGFldUxUMnFsTnY1el90QS1FMVdHYU1QZ2FGTW1OZDJkQTJwdE1fVU5NSlp2Zg=="}
  
  let followers = await getFollowers(query_hash, variables);
  console.log(followers)
  let i = 288;
  do {
    followers = await getFollowers(query_hash, {...variables, "after": followers.data.user.edge_followed_by.page_info.end_cursor});
    createTextFile(JSON.stringify(followers), i.toString().padStart(3, '0'));
    i++
  } while (followers.data.user.edge_followed_by.page_info.has_next_page)
}

//Full Get request for the next patch of followers
function getFollowers(query_hash, variables) {
  return fetch(`https://www.instagram.com/graphql/query/?query_hash=${query_hash}&variables=${JSON.stringify(variables)}`)
  .then(response => response.json())
}

//Create a text-Blob, make a downloadable portal for it and click the link.
function createTextFile(text, fileName) {
  let data = new Blob([text], {type: 'text/plain'});
  let a = document.createElement('a');
  a.download = fileName + '.txt';
  a.href = window.URL.createObjectURL(data)
  a.click()
}

//Find all links in the document and regex + return the query_hash from there
function getHash() {
  let links = document.querySelectorAll('link')
  let consumerJS = "";
  let regex = /const t="[a-z0-9]{32}",n/;
  links.forEach((element)=> {
    if (element.href.includes("/static/bundles/es6/Consumer.js/")) {
          consumerJS = element.href
        }
    })
  return fetch(`${consumerJS}`)
  .then(response => response.text())
  .then(data => data.match(regex)[0].slice(9, 41))
}
