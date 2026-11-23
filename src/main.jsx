import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { injectSpeedInsights } from '@vercel/speed-insights'

// Vercel Speed Insights
if (import.meta.env.PROD) {
  injectSpeedInsights();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
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
