// Ambil video ID dari berbagai format link YouTube
export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1).split('/')[0] || null;
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] ?? null;
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

// Ambil judul & nama channel lewat YouTube oEmbed (publik, tanpa API key)
export async function fetchYoutubeMeta(url: string): Promise<{ title: string; author: string } | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    return { title: data.title as string, author: data.author_name as string };
  } catch {
    return null;
  }
}
