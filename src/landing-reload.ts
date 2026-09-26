import siteConfig from '@generated/docusaurus.config';
import type {ClientModule} from '@docusaurus/types';

// `/` is a static landing page outside the React app. When the app routes
// there client-side (navbar logo, breadcrumb home), load it from the server.
const clientModule: ClientModule = {
  onRouteUpdate({location, previousLocation}) {
    if (previousLocation && location.pathname === siteConfig.baseUrl) {
      window.location.reload();
    }
  },
};

export default clientModule;
