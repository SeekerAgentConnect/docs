import type {ReactNode} from 'react';
import {Redirect} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function DocsHome(): ReactNode {
  return <Redirect to={useBaseUrl('/docs/getting-started')} />;
}
