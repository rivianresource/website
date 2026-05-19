const GIST_ID = '85cd384060888473147fd059b3ca6bc4';
const GIST_FILE = 'leaderboard.json';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const token = env.GITHUB_TOKEN;

    // GET — return current leaderboard
    if (request.method === 'GET') {
      try {
        const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'rivian-leaderboard'
          }
        });
        const data = await res.json();
        const content = data.files[GIST_FILE].content;
        return new Response(content, {
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response('[]', {
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    // POST — add a new score
    if (request.method === 'POST') {
      try {
        const { name, score, round, date } = await request.json();

        // Fetch current leaderboard
        const getRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'rivian-leaderboard'
          }
        });
        const data = await getRes.json();
        let lb = JSON.parse(data.files[GIST_FILE].content);
        if (!Array.isArray(lb)) lb = [];

        // Add, sort, trim to top 10
        lb.push({ name, score, round, date });
        lb.sort((a, b) => b.score - a.score);
        if (lb.length > 10) lb = lb.slice(0, 10);

        // Save back
        await fetch(`https://api.github.com/gists/${GIST_ID}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'rivian-leaderboard'
          },
          body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(lb) } } })
        });

        return new Response(JSON.stringify(lb), {
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...CORS, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  }
};
