require('./main.styl');

import React from 'react';
import { render } from 'react-dom';
import { Router } from 'react-router';
import RSVP from 'rsvp';
import routes from './routes';

RSVP.on('error', (e) => {
  console.error('Error caught by RSVP:');
  console.error(e.message);
  console.error(e.stack);
});

render(<Router routes={routes} />, document.getElementById('app-container'));
