interface PhotoCreditProps {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}

const LINK_CLASSES = 'underline decoration-line underline-offset-4 hover:decoration-accent-ink';

/** Attribution required by CC BY / CC BY-SA: author, license (linked) and source. */
export function PhotoCredit({ author, license, licenseUrl, sourceUrl }: PhotoCreditProps) {
  return (
    <figcaption className="px-4 py-3 text-xs text-ink-muted">
      Foto: {author} ·{' '}
      <a href={licenseUrl} className={LINK_CLASSES}>
        {license}
      </a>{' '}
      ·{' '}
      <a href={sourceUrl} className={LINK_CLASSES}>
        Fuente (Wikimedia Commons)
      </a>
      . Recortada a 16:10.
    </figcaption>
  );
}
