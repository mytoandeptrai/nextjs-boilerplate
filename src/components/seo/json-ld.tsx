interface JsonLdProps {
  data: Record<string, unknown>;
}

/** Renders a schema.org JSON-LD block. `<` is escaped so the payload can never close the script tag. */
export const JsonLd = ({ data }: JsonLdProps) => (
  <script
    type='application/ld+json'
    // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined; payload is serialised and escaped below
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);
