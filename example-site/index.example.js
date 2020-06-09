import React, { lazy, Suspense } from 'react';
import { render } from 'react-dom';
const Entry = lazy(() => import('./Entry.example'));

const container = document.createElement('div');
document.body.appendChild(container);

render(
  <Suspense fallback={<>Loading…</>}>
    <Entry />
  </Suspense>,
  container
);
