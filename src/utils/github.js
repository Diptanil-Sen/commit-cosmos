const BASE = 'https://api.github.com'

async function ghFetch(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  })
  if (!res.ok) {
    if (res.status === 403) throw new Error('GitHub rate limit hit. Wait ~60s and retry.')
    if (res.status === 404) throw new Error('Repository not found.')
    throw new Error(`GitHub error: ${res.status}`)
  }
  return res.json()
}

export async function fetchRepo(slug) {
  // Accept full URLs or owner/repo
  const clean = slug
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .replace(/\/$/, '')
    .trim()

  if (!clean.includes('/')) throw new Error('Use format: owner/repo')

  const [meta, commits] = await Promise.all([
    ghFetch(`${BASE}/repos/${clean}`),
    ghFetch(`${BASE}/repos/${clean}/commits?per_page=100`)
  ])

  return { meta, commits }
}

export function parseCommits(rawCommits, repoName, color) {
  return rawCommits.map(c => ({
    sha: c.sha.slice(0, 7),
    repo: repoName,
    msg: c.commit.message.split('\n')[0].slice(0, 72),
    date: new Date(c.commit.author.date),
    author: c.commit.author.name,
    color,
  }))
}
