type JsonLdProps = {
  id?: string;
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders schema.org structured data. `<` is escaped so that user-provided
 * strings can never close the script tag (XSS-safe JSON-LD injection).
 */
export function JsonLd({ id, data }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
