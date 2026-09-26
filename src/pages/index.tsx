import type {ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

// The real `/` is landing/index.html, copied over this page after the build
// (see the landing-page plugin in docusaurus.config.ts). This route exists so
// the navbar logo and breadcrumb home links resolve; landing-reload.ts turns
// in-app navigation here into a full page load.
export default function Home(): ReactNode {
  return (
    <main style={{padding: '4rem 1rem', textAlign: 'center'}}>
      <a href={useBaseUrl('/')} target="_self">
        Seeker Agent Connect
      </a>
    </main>
  );
}
