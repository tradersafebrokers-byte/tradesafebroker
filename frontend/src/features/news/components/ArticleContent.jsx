import { Link } from 'react-router-dom';

// Matches <a href="...">text</a> written in the article editor. Curly quotes are
// accepted because editors/notes apps often auto-convert straight quotes.
const ANCHOR_REGEX = /<a\b[^>]*?\bhref\s*=\s*["'“”‘’]([^"'“”‘’]*)["'“”‘’][^>]*>([\s\S]*?)<\/a\s*>/gi;
const SITE_HOSTS = ['tradesafebrokers.com', 'www.tradesafebrokers.com'];

// Only http(s), mailto and site-relative paths are turned into links. Anything else
// (javascript:, data:, etc.) is rendered as plain text, so content is never injected as HTML.
const resolveHref = (rawHref) => {
  let href = rawHref.trim().replace(/&amp;/gi, '&');
  if (!href) return null;

  if (href.startsWith('/') && !href.startsWith('//')) {
    return { internal: true, to: href };
  }

  if (/^mailto:/i.test(href)) {
    return { internal: false, href };
  }

  // Bare domains such as "tradesafebrokers.com/compare" or "www.example.com"
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|\?|#|$)/i.test(href)) {
    href = `https://${href}`;
  }

  if (!/^https?:\/\//i.test(href)) return null;

  try {
    const url = new URL(href);
    if (SITE_HOSTS.includes(url.hostname) || url.origin === window.location.origin) {
      return { internal: true, to: `${url.pathname}${url.search}${url.hash}` };
    }
    return { internal: false, href: url.href };
  } catch {
    return null;
  }
};

const renderLink = (rawHref, rawText, key, isCommunityPost) => {
  const resolved = resolveHref(rawHref);
  const text = rawText.replace(/<[^>]+>/g, '').trim() || rawHref;

  if (!resolved) return text;

  if (resolved.internal) {
    return (
      <Link key={key} to={resolved.to} className="article-inline-link">
        {text}
      </Link>
    );
  }

  // Community (user-submitted) posts get nofollow/ugc so outbound links don't pass SEO value
  const rel = isCommunityPost ? 'noopener noreferrer nofollow ugc' : 'noopener noreferrer';
  return (
    <a key={key} href={resolved.href} target="_blank" rel={rel} className="article-inline-link">
      {text}
    </a>
  );
};

const renderInline = (text, keyPrefix, isCommunityPost) => {
  const nodes = [];
  let lastIndex = 0;

  for (const match of text.matchAll(ANCHOR_REGEX)) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(renderLink(match[1], match[2], `${keyPrefix}-${match.index}`, isCommunityPost));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
};

export default function ArticleContent({ content = '', isCommunityPost = false }) {
  return content.split('\n\n').map((para, i) => (
    <p key={i}>{renderInline(para, i, isCommunityPost)}</p>
  ));
}
