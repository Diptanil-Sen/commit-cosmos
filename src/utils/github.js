const BASE = 'https://api.github.com'

const headers = {
  Accept: 'application/vnd.github.v3+json',
  Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
}

async function ghFetch(url) {
  const res = await fetch(url, { headers })
  if (!res.ok) {
    if (res.status === 403) throw new Error('GitHub rate limit hit. Wait ~60s and retry.')
    if (res.status === 404) throw new Error('User not found.')
    throw new Error(`GitHub error: ${res.status}`)
  }
  return res.json()
}

export async function fetchUniverse(username) {
  const user = await ghFetch(`${BASE}/users/${username}`)
  const repos = await ghFetch(
    `${BASE}/users/${username}/repos?per_page=100&sort=pushed`
  )
  const topRepos = repos
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 15)
  const repoData = await Promise.all(
    topRepos.map(async repo => {
      try {
        const commits = await ghFetch(
          `${BASE}/repos/${username}/${repo.name}/commits?per_page=100&author=${username}`
        )
        return { repo, commits }
      } catch {
        return { repo, commits: [] }
      }
    })
  )
  return { user, repoData }
}