import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Review AI document edits before accepting them | DocumentEditor',
  description: 'See how to review AI suggestions in a document, accept individual edits, and keep a revision history.',
  alternates: { canonical: '/review-ai-document-edits' },
};

export default function ReviewGuide() {
  return <main className="mx-auto min-h-screen max-w-3xl space-y-6 px-6 py-16">
    <Link href="/">DocumentEditor</Link>
    <h1 className="text-4xl font-bold">Review AI document edits before accepting them</h1>
    <p>When a proposal goes through several revisions, whole-document rewrites make it hard to see what changed. DocumentEditor keeps suggestions visible so you can review them one at a time.</p>
    <h2 className="text-xl font-semibold">Try it with a sample proposal</h2>
    <ol className="list-decimal space-y-3 pl-6">
      <li>Open the editor and set up your own model API key in Settings for AI suggestions.</li>
      <li>Select a paragraph and ask for a specific revision, such as tightening the summary while preserving its numbers.</li>
      <li>Open Changes to review the previous wording and the proposed replacement. Accept or reject each suggestion.</li>
      <li>Save a revision before you share the document.</li>
    </ol>
    <Link href="/editor" className="inline-block font-semibold underline">Open the editor</Link>
  </main>;
}
