import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { injectSpeedInsights } from '@vercel/speed-insights'

// Vercel Speed Insights
if (import.meta.env.PROD) {
  injectSpeedInsights();
}

const QuickRateDemo = import.meta.env.VITE_QUICK_RATE_DEMO==='true' ? lazy(()=>import('./dev/QuickRateDemo.jsx')) : null;
const isQuickRateDemo=Boolean(QuickRateDemo)&&window.location.pathname==='/quick-rate-demo';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isQuickRateDemo?<Suspense fallback={<p>Opening Quick rate preview…</p>}><QuickRateDemo/></Suspense>:<App/>}
  </StrictMode>,
)


import './styles/app.css'
import './styles/tokens.css'
import './styles/profile.css'
import './styles/workspaces.css'

import './styles/appearance.css'
import './styles/touch.css'
import './styles/notices.css'

import './styles/dialogs.css'

import './styles/mobile-controls.css'

import './styles/film-story.css'

import './styles/poster-metadata.css'

import './styles/selects.css'

import './styles/layout-test.css'

import './styles/journal.css'

import './styles/taste-map.css'

import './styles/extras.css'

import './styles/account.css'

import './styles/search.css'
import './styles/quick-log.css'

import './styles/viewing.css'

import './styles/episodes.css'

import './styles/community.css'

import './styles/screening-log.css'

import './styles/community-feed.css'

import './styles/quick-rate.css'
